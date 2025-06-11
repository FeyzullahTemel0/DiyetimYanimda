const express = require("express");
const router  = express.Router();
const jwt = require("jsonwebtoken"); // JWT kütüphanesini ekliyoruz
const { auth, firestore, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require('../middleware/verifyToken');

// --- Kullanıcı Kaydı Endpoint'i (Mevcut kodun, değişiklik yok) ---
router.post("/register", async (req, res) => {
  const { name, surname, email, password, gender, height = 0, weight = 0, targetWeight = 0 } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: "Zorunlu alanlar eksik." });
  }

  try {
    const userRecord = await auth.createUser({ email, password, displayName: `${name} ${surname}` });

    const newUserProfile = {
      name, surname, email,
      gender: gender || "not_specified",
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      role: "user",
      authProvider: 'email',
      createdAt: FieldValue.serverTimestamp(),
      pictureUrl: "",
      subscription: {
        plan: "free", status: "active", startDate: null, endDate: null, paymentId: null
      }
    };

    await firestore.collection("users").doc(userRecord.uid).set(newUserProfile);
    return res.status(201).json({ uid: userRecord.uid, message: "Kayıt başarılı." });

  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda." });
    }
    return res.status(400).json({ error: "Kayıt sırasında bir hata oluştu." });
  }
});

// --- E-posta/Şifre ile Giriş Endpoint'i (YENİ EKLENDİ) ---
// Frontend, Firebase ile login olduktan sonra aldığı idToken'ı bu endpoint'e gönderir.
router.post("/login", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(401).json({ error: "Kimlik doğrulama token'ı sağlanmadı." });
    }

    try {
        // Frontend'den gelen Firebase token'ını doğrula
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // Firestore'dan kullanıcı profilini al
        const userDoc = await firestore.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Kullanıcı profili bulunamadı. Lütfen senkronize edin." });
        }
        const user = { uid, ...userDoc.data() };

        // 1. KISA ÖMÜRLÜ ACCESS TOKEN ÜRET
        const accessToken = jwt.sign(
            { uid: user.uid, role: user.role, name: user.name },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' } // 15 dakika
        );

        // 2. UZUN ÖMÜRLÜ REFRESH TOKEN ÜRET
        const refreshToken = jwt.sign(
            { uid: user.uid },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '30d' } // 30 gün
        );

        // 3. YENİ REFRESH TOKEN'I VERİTABANINA KAYDET (GÜVENLİK İÇİN)
        await firestore.collection('users').doc(user.uid).update({
            refreshToken: refreshToken
        });

        // 4. TOKEN'LARI VE KULLANICI BİLGİSİNİ FRONTEND'E GÖNDER
        res.status(200).json({
            message: "Giriş başarılı!",
            accessToken,
            refreshToken,
            user: {
                uid: user.uid,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Login hatası:", error);
        res.status(401).json({ error: "Giriş başarısız, geçersiz token." });
    }
});


// --- Google ile Giriş Yapan Kullanıcıyı Senkronize Etme (Mevcut kodun, değişiklik yok) ---
router.post('/google-sync', verifyToken, async (req, res) => {
  const { uid, email, name, picture } = req.user;

  try {
    const userRef = firestore.collection('users').doc(uid);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(200).json(doc.data());
    } 
    else {
      const nameParts = name ? name.split(' ') : ['Yeni'];
      const newName = nameParts[0];
      const newSurname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Kullanıcı';

      const newUserProfile = {
        name: newName, surname: newSurname, email: email,
        gender: "not_specified", height: 0, weight: 0, targetWeight: 0,
        role: 'user', createdAt: FieldValue.serverTimestamp(), pictureUrl: picture || "",
        authProvider: 'google',
        subscription: {
          plan: "free", status: "active", startDate: null, endDate: null, paymentId: null
        }
      };

      await userRef.set(newUserProfile);
      return res.status(201).json(newUserProfile);
    }
  } catch (error) {
    res.status(500).send({ message: "Kullanıcı senkronizasyonu sırasında bir hata oluştu." });
  }
});


// --- TOKEN YENİLEME ENDPOINT'İ (YENİ EKLENDİ) ---
// Access token süresi dolduğunda bu endpoint kullanılır.
router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token sağlanmadı." });
    }

    try {
        // Refresh token'ı kendi gizli anahtarımızla doğrula
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Veritabanındaki token ile eşleşiyor mu kontrol et (ÇOK ÖNEMLİ GÜVENLİK ADIMI)
        const userDoc = await firestore.collection('users').doc(decoded.uid).get();
        if (!userDoc.exists || userDoc.data().refreshToken !== refreshToken) {
            return res.status(403).json({ error: "Geçersiz refresh token. Yeniden giriş yapın." });
        }

        const user = { uid: userDoc.id, ...userDoc.data() };

        // Her şey yolundaysa, yeni bir Access Token üret ve gönder
        const newAccessToken = jwt.sign(
            { uid: user.uid, role: user.role, name: user.name },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        // Token'ın süresi dolmuş veya tamamen geçersiz
        return res.status(403).json({ error: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." });
    }
});


module.exports = router;
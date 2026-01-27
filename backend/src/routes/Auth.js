const express = require("express");
const router  = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { auth, firestore, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require('../middleware/verifyToken');
const { sendEmail, getPasswordResetEmailTemplate, getPasswordResetSuccessEmailTemplate } = require("../services/emailService");

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


// --- ŞIFRE UNUTTUM ENDPOINT'İ (YENİ EKLENDİ) ---
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email adresi gereklidir." });
    }

    try {
        // Email'e göre kullanıcıyı bul
        const usersSnapshot = await firestore
            .collection('users')
            .where('email', '==', email)
            .get();

        if (usersSnapshot.empty) {
            // Güvenlik nedeniyle aynı mesajı döndür (var olmayan email'leri gizle)
            return res.status(200).json({ 
                message: "Eğer bu email'e kayıtlı bir hesap varsa, şifre sıfırlama linki gönderilecektir." 
            });
        }

        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;
        const userName = userData.name || 'Kullanıcı';

        // Şifre sıfırlama token'ı oluştur (1 saat geçerli)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = Date.now() + (60 * 60 * 1000); // 1 saat

        // Token'ı Firestore'a kaydet
        await firestore.collection('users').doc(userId).update({
            resetToken: resetTokenHash,
            resetTokenExpiry: resetTokenExpiry
        });

        // Şifre sıfırlama linki oluştur
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${email}`;

        // Email gönder
        const emailTemplate = getPasswordResetEmailTemplate(resetLink, userName);
        const emailSent = await sendEmail(
            email,
            '🔐 Şifre Sıfırlama İsteği - Diyetim Yanımda',
            emailTemplate
        );

        if (!emailSent) {
            console.error('Email gönderme başarısız:', email);
            return res.status(500).json({ error: "Email gönderilemedi. Lütfen daha sonra tekrar deneyin." });
        }

        res.status(200).json({ 
            message: "Şifre sıfırlama linki email adresinize gönderilmiştir.",
            success: true
        });

    } catch (error) {
        console.error('Forgot password hatası:', error);
        res.status(500).json({ error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
    }
});


// --- ŞIFRE SIFIRLA ENDPOINT'İ (YENİ EKLENDİ) ---
router.post("/reset-password", async (req, res) => {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
        return res.status(400).json({ error: "Token, email ve yeni şifre gereklidir." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır." });
    }

    try {
        // Email'e göre kullanıcıyı bul
        const usersSnapshot = await firestore
            .collection('users')
            .where('email', '==', email)
            .get();

        if (usersSnapshot.empty) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }

        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;
        const userName = userData.name || 'Kullanıcı';

        // Token kontrol et
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        if (userData.resetToken !== resetTokenHash) {
            return res.status(401).json({ error: "Geçersiz sıfırlama linki." });
        }

        // Token'ın süresi dolmadığını kontrol et
        if (!userData.resetTokenExpiry || userData.resetTokenExpiry < Date.now()) {
            return res.status(401).json({ error: "Sıfırlama linki süresi dolmuştur. Yeni bir istek gönderin." });
        }

        // Şifreyi hash'le ve kaydet
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Firestore'da şifreyi ve token'ı güncelle
        await firestore.collection('users').doc(userId).update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            updatedAt: FieldValue.serverTimestamp()
        });

        // Firebase Auth'ta da şifreyi güncelle
        try {
            await auth.updateUser(userId, {
                password: newPassword
            });
        } catch (authError) {
            console.error('Firebase auth şifre güncelleme hatası:', authError);
            // Firestore'daki değişiklik zaten yapıldı, devam et
        }

        // Başarılı email gönder
        const successEmailTemplate = getPasswordResetSuccessEmailTemplate(userName);
        await sendEmail(
            email,
            '✅ Şifre Değiştirildi - Diyetim Yanımda',
            successEmailTemplate
        );

        res.status(200).json({ 
            message: "Şifreniz başarıyla değiştirilmiştir. Giriş sayfasında yeni şifrenizle giriş yapabilirsiniz.",
            success: true
        });

    } catch (error) {
        console.error('Reset password hatası:', error);
        res.status(500).json({ error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
    }
});


module.exports = router;
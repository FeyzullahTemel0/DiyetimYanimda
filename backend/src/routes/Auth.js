// backend/src/routes/auth.js

const express = require("express");
const router  = express.Router();
const { auth, firestore, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require('../middleware/verifyToken');

// --- Kullanıcı Kaydı Endpoint'i (E-posta/Şifre) ---
router.post("/register", async (req, res) => {
  const { name, surname, email, password, gender, height = 0, weight = 0, targetWeight = 0 } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: "Zorunlu alanlar eksik." });
  }

  try {
    const userRecord = await auth.createUser({ email, password, displayName: `${name} ${surname}` });

    // YENİ: Varsayılan üyelik bilgilerini ekliyoruz
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
      // --- ÜYELİK ALANLARI ---
      subscription: {
        plan: "free", // Her yeni kullanıcı 'free' (ücretsiz) planla başlar
        status: "active",
        startDate: null,
        endDate: null,
        paymentId: null
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


// --- Google ile Giriş Yapan Kullanıcıyı Senkronize Etme Endpoint'i ---
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

      // YENİ: Varsayılan üyelik bilgilerini ekliyoruz
      const newUserProfile = {
        name: newName,
        surname: newSurname,
        email: email,
        gender: "not_specified",
        height: 0, weight: 0, targetWeight: 0,
        role: 'user',
        createdAt: FieldValue.serverTimestamp(),
        pictureUrl: picture || "",
        authProvider: 'google',
        // --- ÜYELİK ALANLARI ---
        subscription: {
          plan: "free", // Her yeni Google kullanıcısı da 'free' planla başlar
          status: "active",
          startDate: null,
          endDate: null,
          paymentId: null
        }
      };

      await userRef.set(newUserProfile);
      return res.status(201).json(newUserProfile);
    }
  } catch (error) {
    res.status(500).send({ message: "Kullanıcı senkronizasyonu sırasında bir hata oluştu." });
  }
});


module.exports = router;
// backend/src/routes/protected.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { firestore, auth, FieldValue } = require("../services/firebaseAdmin");

// Bu dosyada tanımlanan TÜM rotaların önce 'verifyToken' kontrolünden geçmesini sağla
router.use(verifyToken);


// === PROFİL ENDPOINT'LERİ ===

// GET /api/profile -> Giriş yapmış kullanıcının kendi profilini getirir.
router.get("/", async (req, res) => {
  try {
    console.log("user",req.user); // Kullanıcı bilgilerini kontrol et
    console.log("userid",req.user.uid); // Kullanıcı bilgilerini kontrol et
    
    const uid = req.user.uid;
    const doc = await firestore.collection("users").doc(uid).get();
    console.log("doc", doc);
    
    if (!doc.exists) return res.status(404).json({ error: "Kullanıcı profili bulunamadı." });
    
    const profileData = doc.data();
    if (!Array.isArray(profileData.favoritePrograms)) {
      profileData.favoritePrograms = [];
    }
    res.status(200).json(profileData);
  } catch (err) {
    res.status(400).json({ error: "Profil bilgileri getirilirken bir hata oluştu." });
  }
});

// PUT /api/profile -> Kullanıcının profil bilgilerini günceller.
router.put("/", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, surname, height, weight, targetWeight, gender } = req.body;
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (surname !== undefined) allowedUpdates.surname = surname;
    if (height !== undefined) allowedUpdates.height = Number(height);
    if (weight !== undefined) allowedUpdates.weight = Number(weight);
    if (targetWeight !== undefined) allowedUpdates.targetWeight = Number(targetWeight);
    if (gender && ["male", "female", "not_specified"].includes(gender)) {
      allowedUpdates.gender = gender;
    }
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ error: "Güncellenecek geçerli bir veri gönderilmedi." });
    }
    await firestore.collection("users").doc(uid).update(allowedUpdates);
    res.status(200).json({ message: "Profil başarıyla güncellendi." });
  } catch (err) {
    res.status(500).json({ error: "Profil güncellenirken bir hata oluştu." });
  }
});

// DELETE /api/profile -> Kullanıcı hesabını tamamen siler.
router.delete("/", async (req, res) => {
  try {
    const uid = req.user.uid;
    await firestore.collection("users").doc(uid).delete();
    await auth.deleteUser(uid);
    res.status(200).json({ message: "Hesap başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ error: "Hesap silinirken bir hata oluştu." });
  }
});


// === FAVORİ PROGRAM ENDPOINT'LERİ ===

// POST /api/profile/favorite/:programId
router.post("/favorite/:programId", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { programId } = req.params;
    await firestore.collection("users").doc(uid).update({ favoritePrograms: FieldValue.arrayUnion(programId) });
    res.status(200).json({ message: "Program favorilere eklendi." });
  } catch (err) {
    res.status(500).json({ error: "Favorilere ekleme işlemi başarısız oldu." });
  }
});

// DELETE /api/profile/favorite/:programId
router.delete("/favorite/:programId", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { programId } = req.params;
    await firestore.collection("users").doc(uid).update({ favoritePrograms: FieldValue.arrayRemove(programId) });
    res.status(200).json({ message: "Program favorilerden çıkarıldı." });
  } catch (err) {
    res.status(500).json({ error: "Favorilerden çıkarma işlemi başarısız oldu." });
  }
});


// === PROGRAM SEÇİMİ ENDPOINT'İ ===

// POST /api/profile/select-program
router.post("/select-program", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { programId, programTitle, price } = req.body;
    if (!programId || !programTitle) {
      return res.status(400).json({ error: "Program ID ve başlığı gereklidir." });
    }
    await firestore.collection("users").doc(uid).update({
      selectedProgram: {
        programId,
        programTitle,
        price: price || 0,
        status: "pending_payment",
        selectedAt: FieldValue.serverTimestamp()
      }
    });
    res.status(200).json({ message: "Program başarıyla seçildi. Ödeme sayfasına yönlendiriliyorsunuz..." });
  } catch (err) {
    res.status(500).json({ error: "Program seçme işlemi başarısız oldu." });
  }
});


// === ABONELİK ENDPOINT'LERİ ===

// POST /api/profile/subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { uid } = req.user;
    const { plan, planName, features } = req.body;
    
    // Ücretsiz plan için kontrol et
    if (plan !== 'free') {
      return res.status(400).json({ error: "Bu endpoint sadece ücretsiz plan için kullanılır." });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const subscriptionData = {
      plan,
      planName: planName || "Ücretsiz Plan",
      price: 0,
      features: features || [],
      status: "active",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentId: null,
    };
    
    await firestore.collection("users").doc(uid).update({ subscription: subscriptionData });
    res.status(200).json({ 
      message: `Üyelik planınız başarıyla '${planName || plan}' olarak güncellendi!`, 
      subscription: subscriptionData 
    });
  } catch (error) {
    res.status(500).json({ error: "Üyelik güncellenirken bir hata oluştu." });
  }
});

// YENİ EKLENEN ve HATAYI ÇÖZEN ENDPOINT
// DELETE /api/profile/subscription -> Kullanıcının aboneliğini iptal eder.
router.delete("/subscription", async (req, res) => {
  try {
    const { uid } = req.user;
    const updatedSubscription = {
      plan: 'free',
      status: 'cancelled',
      startDate: null,
      endDate: null,
      paymentId: null,
    };
    await firestore.collection("users").doc(uid).update({
      subscription: updatedSubscription
    });
    res.status(200).json({ 
        message: "Aboneliğiniz başarıyla iptal edildi.",
        subscription: updatedSubscription
    });
  } catch (error) {
    console.error("🚨 DELETE /api/profile/subscription hatası:", error);
    res.status(500).json({ error: "Abonelik iptal edilirken bir hata oluştu." });
  }
});


module.exports = router;
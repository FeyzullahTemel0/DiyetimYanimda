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
    console.log("🔍 [GET /api/profile] req.user:", req.user);
    
    if (!req.user || !req.user.uid) {
      console.error("🚨 req.user veya req.user.uid tanımsız!");
      return res.status(401).json({ error: "Kullanıcı bilgisi bulunamadı." });
    }
    
    const uid = req.user.uid;
    console.log("🔍 [GET /api/profile] UID:", uid);
    
    const doc = await firestore.collection("users").doc(uid).get();
    console.log("🔍 [GET /api/profile] doc.exists:", doc.exists);
    
    if (!doc.exists) {
      console.log("⚠️ [GET /api/profile] Kullanıcı profili Firestore'da bulunamadı. Boş profil döndürülüyor...", uid);
      // Kullanıcı henüz profil oluşturmamışsa boş profil döndür
      return res.status(200).json({
        uid: uid,
        name: "",
        surname: "",
        email: "",
        height: "",
        weight: "",
        targetWeight: "",
        gender: "female",
        allergies: "",
        isDiabetic: false,
        diabeticType: "",
        isHypertensive: false,
        bloodPressure: "",
        hasHeartDisease: false,
        hasKidneyDisease: false,
        hasLiverDisease: false,
        hasThyroidDisease: false,
        otherDiseases: "",
        medications: "",
        dietaryRestrictions: "",
        activityLevel: "moderate",
        favoritePrograms: [],
        subscription: {
          plan: "free",
          status: "active",
          startDate: null,
          endDate: null,
          paymentId: null
        }
      });
    }
    
    const profileData = doc.data();
    console.log("🔍 [GET /api/profile] Profil verileri başarıyla alındı");
    if (!Array.isArray(profileData.favoritePrograms)) {
      profileData.favoritePrograms = [];
    }
    res.status(200).json(profileData);
  } catch (err) {
    console.error("🚨 [GET /api/profile] HATA:", err.message);
    console.error("🚨 [GET /api/profile] Stack:", err.stack);
    res.status(500).json({ error: "Profil bilgileri getirilirken bir hata oluştu.", details: err.message });
  }
});

// PUT /api/profile -> Kullanıcının profil bilgilerini günceller.
router.put("/", async (req, res) => {
  try {
    const uid = req.user.uid;
    const { 
      name, 
      surname, 
      height, 
      weight, 
      targetWeight, 
      gender,
      // Sağlık Bilgileri
      allergies,
      isDiabetic,
      diabeticType,
      isHypertensive,
      bloodPressure,
      hasHeartDisease,
      hasKidneyDisease,
      hasLiverDisease,
      hasThyroidDisease,
      otherDiseases,
      medications,
      dietaryRestrictions,
      activityLevel
    } = req.body;
    
    const allowedUpdates = {};
    
    // Kişisel Bilgiler
    if (name !== undefined) allowedUpdates.name = name;
    if (surname !== undefined) allowedUpdates.surname = surname;
    if (height !== undefined) allowedUpdates.height = Number(height);
    if (weight !== undefined) allowedUpdates.weight = Number(weight);
    if (targetWeight !== undefined) allowedUpdates.targetWeight = Number(targetWeight);
    if (gender && ["male", "female", "not_specified"].includes(gender)) {
      allowedUpdates.gender = gender;
    }
    if (activityLevel !== undefined) allowedUpdates.activityLevel = activityLevel;
    
    // Sağlık Bilgileri
    if (allergies !== undefined) allowedUpdates.allergies = allergies;
    if (isDiabetic !== undefined) allowedUpdates.isDiabetic = isDiabetic;
    if (diabeticType !== undefined) allowedUpdates.diabeticType = diabeticType;
    if (isHypertensive !== undefined) allowedUpdates.isHypertensive = isHypertensive;
    if (bloodPressure !== undefined) allowedUpdates.bloodPressure = bloodPressure;
    if (hasHeartDisease !== undefined) allowedUpdates.hasHeartDisease = hasHeartDisease;
    if (hasKidneyDisease !== undefined) allowedUpdates.hasKidneyDisease = hasKidneyDisease;
    if (hasLiverDisease !== undefined) allowedUpdates.hasLiverDisease = hasLiverDisease;
    if (hasThyroidDisease !== undefined) allowedUpdates.hasThyroidDisease = hasThyroidDisease;
    if (otherDiseases !== undefined) allowedUpdates.otherDiseases = otherDiseases;
    if (medications !== undefined) allowedUpdates.medications = medications;
    if (dietaryRestrictions !== undefined) allowedUpdates.dietaryRestrictions = dietaryRestrictions;
    
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ error: "Güncellenecek geçerli bir veri gönderilmedi." });
    }
    
    await firestore.collection("users").doc(uid).update(allowedUpdates);
    console.log(`✅ Profil güncellendi - UID: ${uid}`, allowedUpdates);
    res.status(200).json({ message: "Profil başarıyla güncellendi." });
  } catch (err) {
    console.error("🚨 PUT /api/profile error:", err);
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

// POST /api/profile/subscribe - Kullanıcının planını güncelle (Ücretsiz planlar için)
router.post("/subscribe", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { plan, planName, features } = req.body;
    
    // Plan validasyonu - sadece ücretsiz plan için kontrol et
    if (plan !== 'free') {
      return res.status(400).json({ 
        error: "Bu endpoint sadece ücretsiz plan seçimi için kullanılır. Ücretli planlar için /api/payment/confirm endpoint'ini kullanın." 
      });
    }

    if (!plan || plan.trim() === '') {
      return res.status(400).json({ error: "Plan ID boş olamaz" });
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
    
    console.log(`✅ Ücretsiz plan seçildi - Kullanıcı ${uid} Plan: ${plan}`);
    
    res.status(200).json({ 
      message: `Üyelik planınız başarıyla '${planName || plan}' olarak güncellendi!`, 
      subscription: subscriptionData 
    });
  } catch (error) {
    console.error("❌ Plan güncellemesi hatası:", error);
    res.status(500).json({ error: `Üyelik güncellenirken bir hata oluştu: ${error.message}` });
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
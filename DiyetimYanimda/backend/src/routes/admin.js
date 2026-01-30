// ...existing code...

// backend/src/routes/admin.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { firestore, auth, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

router.use(verifyToken);
router.use(checkAdmin);


// --- DİYETİSYEN DAVET LİNKİ SİLME ---
// POST /api/admin/users/delete-dietitian-invite
router.post("/delete-dietitian-invite", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Token gerekli" });
    }
    await firestore.collection('dietitianInvites').doc(token).delete();
    res.status(200).json({ success: true, message: "Davet linki silindi" });
  } catch (error) {
    console.error("POST /api/admin/users/delete-dietitian-invite hatası:", error);
    res.status(500).json({ success: false, error: "Davet linki silinemedi." });
  }
});

// --- TÜM KULLANICILARI LİSTELEME ENDPOINT'İ (GÜNCELLENMİŞ) ---
// GET /api/admin/users
router.get("/", async (req, res) => {
  try {
    // 1. Önce Firestore'daki tüm kullanıcı profillerini çekiyoruz
    const usersSnapshot = await firestore.collection('users').orderBy('name').get();
    const firestoreUsers = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    // 2. Her bir Firestore kullanıcısının Auth'da karşılığı olup olmadığını kontrol et
    const detailedUsers = await Promise.all(
      firestoreUsers.map(async (fUser) => {
        try {
          const authUserRecord = await auth.getUser(fUser.uid);
          // Kullanıcı Auth'da VAR: Verileri birleştir
          return {
            ...fUser, // Firestore verileri (role, height vb.)
            displayName: authUserRecord.displayName,
            email: authUserRecord.email,
            disabled: authUserRecord.disabled,
            isAuthUser: true, // Frontend'de kullanmak için işaret
          };
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Kullanıcı Auth'da YOK: Silinmiş olarak işaretle
            return {
              ...fUser,
              displayName: `${fUser.name || ''} ${fUser.surname || ''} (Silinmiş)`.trim(),
              email: fUser.email,
              isAuthUser: false, // Frontend'de kullanmak için işaret
              disabled: true,
            };
          }
          // Diğer beklenmedik hatalar
          return { ...fUser, isAuthUser: false, disabled: true, displayName: "Hatalı Kayıt" };
        }
      })
    );

    res.status(200).json(detailedUsers);
  } catch (error) {
    console.error("🚨 GET /api/admin/users hatası:", error);
    res.status(500).json({ error: "Kullanıcılar listelenirken bir hata oluştu." });
  }
});


// --- TEK BİR KULLANICI DETAYINI GETİRME ENDPOINT'İ (DEĞİŞİKLİK YOK) ---
// GET /api/admin/users/:uid
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userRecord = await auth.getUser(uid);
    const firestoreDoc = await firestore.collection('users').doc(uid).get();
    if (!firestoreDoc.exists) {
      return res.status(200).json({ ...userRecord.toJSON(), firestoreData: { error: 'Firestore profili bulunamadı.' } });
    }
    const responseData = { ...userRecord.toJSON(), firestoreData: firestoreDoc.data() };
    res.status(200).json(responseData);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Bu ID ile bir kullanıcı bulunamadı.' });
    }
    res.status(500).json({ error: "Kullanıcı bilgileri getirilirken bir hata oluştu." });
  }
});


// --- KULLANICI GÜNCELLEME ENDPOINT'İ (DEĞİŞİKLİK YOK) ---
// PUT /api/admin/users/:uid
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, surname, height, weight, targetWeight, role, disabled } = req.body;
    const firestoreUpdates = {};
    if (name !== undefined) firestoreUpdates.name = name;
    if (surname !== undefined) firestoreUpdates.surname = surname;
    if (height !== undefined) firestoreUpdates.height = Number(height);
    if (weight !== undefined) firestoreUpdates.weight = Number(weight);
    if (targetWeight !== undefined) firestoreUpdates.targetWeight = Number(targetWeight);
    if (role) firestoreUpdates.role = role;
    if (Object.keys(firestoreUpdates).length > 0) {
      await firestore.collection('users').doc(uid).update(firestoreUpdates);
    }
    const authUpdates = {};
    if (disabled !== undefined) authUpdates.disabled = disabled;
    if (name !== undefined || surname !== undefined) {
      const updatedName = name !== undefined ? name : (await firestore.collection('users').doc(uid).get()).data().name;
      const updatedSurname = surname !== undefined ? surname : (await firestore.collection('users').doc(uid).get()).data().surname;
      authUpdates.displayName = `${updatedName || ''} ${updatedSurname || ''}`.trim();
    }
    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(uid, authUpdates);
    }
    res.status(200).json({ message: "Kullanıcı başarıyla güncellendi." });
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı güncellenirken bir sunucu hatası oluştu." });
  }
});


// --- KULLANICI SİLME ENDPOINT'İ (DEĞİŞİKLİK YOK) ---
// DELETE /api/admin/users/:uid
router.delete("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    await auth.deleteUser(uid);
    await firestore.collection('users').doc(uid).delete();
    res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı silinirken bir hata oluştu." });
  }
});


// --- KULLANICININ TÜM VERİLERİNİ GETİRME (Profil + Abonelik + Kalori Tracker) ---
// GET /api/admin/users/:uid/full
router.get("/:uid/full", async (req, res) => {
  try {
    const { uid } = req.params;

    const [authRecord, userDoc, calorieSnapshot] = await Promise.all([
      auth.getUser(uid),
      firestore.collection('users').doc(uid).get(),
      firestore.collection('calorieTracker').where('userId', '==', uid).get(),
    ]);

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Kullanıcı profili bulunamadı." });
    }

    const calorieHistory = calorieSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({
      auth: authRecord.toJSON(),
      profile: userDoc.data(),
      subscription: userDoc.data().subscription || { plan: 'free', status: 'active' },
      calorieTracker: calorieHistory,
    });
  } catch (error) {
    console.error("🚨 GET /api/admin/users/:uid/full hatası:", error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Bu ID ile bir kullanıcı bulunamadı.' });
    }
    res.status(500).json({ error: "Kullanıcı verileri getirilirken bir hata oluştu." });
  }
});


// --- ADMİN: ABONELİK İPTAL ---
// POST /api/admin/users/:uid/subscription/cancel
router.post("/:uid/subscription/cancel", async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedSubscription = {
      plan: 'free',
      planName: 'Ücretsiz',
      price: 0,
      status: 'cancelled',
      startDate: null,
      endDate: null,
      paymentId: null,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    await firestore.collection('users').doc(uid).update({ subscription: updatedSubscription });

    res.status(200).json({
      message: 'Abonelik iptal edildi ve free plana alındı.',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("🚨 POST /api/admin/users/:uid/subscription/cancel hatası:", error);
    res.status(500).json({ error: "Abonelik iptal edilirken bir hata oluştu." });
  }
});


// --- ADMİN: SEÇİLEN PLANI HEDİYE ET ---
// POST /api/admin/users/:uid/subscription/gift
// body: { plan: string, planName?: string, price?: number, durationMonths?: number }
router.post("/:uid/subscription/gift", async (req, res) => {
  try {
    const { uid } = req.params;
    const { plan, planName, price, durationMonths } = req.body || {};

    const allowedPlans = ['free', 'basic', 'premium', 'plus'];
    const safePlan = allowedPlans.includes(plan) ? plan : 'free';
    const startDate = new Date();
    const months = Number(durationMonths) > 0 ? Number(durationMonths) : 1;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const giftedSubscription = {
      plan: safePlan,
      planName: planName || safePlan,
      price: Number.isFinite(Number(price)) ? Number(price) : 0,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentId: 'gift',
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    await firestore.collection('users').doc(uid).update({ subscription: giftedSubscription });

    res.status(200).json({
      message: `Kullanıcıya '${giftedSubscription.planName}' planı hediye edildi.`,
      subscription: giftedSubscription,
    });
  } catch (error) {
    console.error("🚨 POST /api/admin/users/:uid/subscription/gift hatası:", error);
    res.status(500).json({ error: "Abonelik hediye edilirken bir hata oluştu." });
  }
});


// --- KULLANICI ŞİFRESİNİ GÜNCELLEME ENDPOINT'İ (YENİ) ---
// POST /api/admin/users/:uid/update-password
router.post("/:uid/update-password", async (req, res) => {
  try {
    const { uid } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır." });
    }

    // Firebase Auth'ta şifreyi güncelle
    await auth.updateUser(uid, {
      password: newPassword
    });

    // Firestore'da hash'lenmiş şifreyi kaydet (admin tarafından görüntüleme için)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await firestore.collection('users').doc(uid).update({
      password: hashedPassword,
      passwordUpdatedAt: FieldValue.serverTimestamp(),
      passwordUpdatedBy: req.user.uid // Admin'in UID'si
    });

    res.status(200).json({ 
      message: "Kullanıcı şifresi başarıyla güncellendi.",
      success: true 
    });
  } catch (error) {
    console.error("🚨 POST /api/admin/users/:uid/update-password hatası:", error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    
    res.status(500).json({ error: "Şifre güncellenirken bir hata oluştu." });
  }
});


// --- KULLANICI EMAIL ADRESİNİ GÜNCELLEME ENDPOINT'İ (YENİ) ---
// POST /api/admin/users/:uid/update-email
router.post("/:uid/update-email", async (req, res) => {
  try {
    const { uid } = req.params;
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin." });
    }

    // Email'in başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
    try {
      const existingUser = await auth.getUserByEmail(newEmail);
      if (existingUser && existingUser.uid !== uid) {
        return res.status(400).json({ error: "Bu email adresi başka bir kullanıcı tarafından kullanılıyor." });
      }
    } catch (error) {
      // Email kullanılmıyor, devam et
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Firebase Auth'ta email'i güncelle
    await auth.updateUser(uid, {
      email: newEmail,
      emailVerified: false // Email değiştiğinde doğrulamayı sıfırla
    });

    // Firestore'da email'i güncelle
    await firestore.collection('users').doc(uid).update({
      email: newEmail,
      emailUpdatedAt: FieldValue.serverTimestamp(),
      emailUpdatedBy: req.user.uid // Admin'in UID'si
    });

    res.status(200).json({ 
      message: "Kullanıcı email adresi başarıyla güncellendi.",
      success: true,
      newEmail: newEmail
    });
  } catch (error) {
    console.error("🚨 POST /api/admin/users/:uid/update-email hatası:", error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: "Bu email adresi zaten kullanılıyor." });
    }
    
    res.status(500).json({ error: "Email güncellenirken bir hata oluştu." });
  }
});




// --- D�YET�SYEN DAVET L�NK� OLU�TURMA ---
// POST /api/admin/users/create-dietitian-invite
router.post("/create-dietitian-invite", async (req, res) => {
  try {
    const { expiresInDays = 7 } = req.body;
    
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresInDays);

    await firestore.collection('dietitianInvites').doc(token).set({
      createdBy: req.user.uid,
      createdByEmail: req.user.email,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiryDate,
      used: false,
      usedBy: null,
      usedAt: null
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/dietitian/register?token=${token}`;

    res.status(200).json({
      success: true,
      token,
      inviteUrl,
      expiresAt: expiryDate,
      message: 'Diyetisyen davet linki ba�ar�yla olu�turuldu'
    });
  } catch (error) {
    console.error(" POST /api/admin/users/create-dietitian-invite hatas�:", error);
    res.status(500).json({ error: "Davet linki olu�turulamad�." });
  }
});

// --- D�YET�SYEN DAVET L�NKLER�N� L�STELEME ---
// GET /api/admin/users/dietitian-invites/list
router.get("/dietitian-invites/list", async (req, res) => {
  try {
    const snapshot = await firestore.collection('dietitianInvites')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const invites = snapshot.docs.map(doc => ({
      token: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      expiresAt: doc.data().expiresAt,
      usedAt: doc.data().usedAt?.toDate()
    }));

    res.status(200).json({ success: true, invites });
  } catch (error) {
    console.error(" GET /api/admin/users/dietitian-invites/list hatas�:", error);
    res.status(500).json({ error: "Davet linkleri listelenemedi." });
  }
});

module.exports = router;

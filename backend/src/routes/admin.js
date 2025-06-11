// backend/src/routes/admin.js

const express = require("express");
const router = express.Router();
const { firestore, auth } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

router.use(verifyToken);
router.use(checkAdmin);


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

module.exports = router;
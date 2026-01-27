// backend/src/routes/protected.js
const express         = require("express");
const router          = express.Router();
const { verifyToken } = require("../middleware/auth");
const { firestore, auth, FieldValue } = require("../services/firebaseAdmin"); // FieldValue'yu ekledik

const usersCol = firestore.collection("users");

// Tüm profile rotalarında önce token doğrula
router.use(verifyToken);

/**
 * GET /api/profile
 * Ana profil bilgilerini getirir.
 */
router.get("/", async (req, res) => {
  try {
    const uid  = req.user.uid;
    const snap = await usersCol.doc(uid).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Profil bulunamadı." });
    }
    // Kullanıcının favori programları yoksa boş bir dizi döndür
    const userData = snap.data();
    if (!userData.favoritePrograms) {
      userData.favoritePrograms = [];
    }
    return res.json({ uid, ...userData });
  } catch (err) {
    console.error("🚨 GET /api/profile error:", err);
    return res.status(500).json({ error: "Profil yüklenemedi." });
  }
});

/**
 * PUT /api/profile
 * Profil bilgilerini günceller.
 */
router.put("/", async (req, res) => {
  try {
    const uid     = req.user.uid;
    const updates = req.body;

    // Firestore’da güncelle
    await usersCol.doc(uid).update(updates);

    // Auth güncelle (email veya displayName varsa)
    const authUpdates = {};
    if (updates.email) authUpdates.email = updates.email;
    if (updates.name || updates.surname) {
      const userDoc = await usersCol.doc(uid).get(); // En güncel name/surname için tekrar oku
      const { name, surname } = userDoc.data();
      authUpdates.displayName = `${name || ""} ${surname || ""}`.trim();
    }
    if (Object.keys(authUpdates).length) {
      await auth.updateUser(uid, authUpdates);
    }

    return res.json({ message: "Profil güncellendi." });
  } catch (err) {
    console.error("🚨 PUT /api/profile error:", err);
    return res.status(500).json({ error: "Profil güncelleme hatası." });
  }
});

/**
 * DELETE /api/profile
 * Kullanıcı hesabını siler.
 */
router.delete("/", async (req, res) => {
  try {
    const uid = req.user.uid;
    await usersCol.doc(uid).delete();
    await auth.deleteUser(uid);
    return res.json({ message: "Profil silindi." });
  } catch (err) {
    console.error("🚨 DELETE /api/profile error:", err);
    return res.status(500).json({ error: "Profil silme hatası." });
  }
});


// --- YENİ EKLENEN FAVORİ ROTALARI ---

/**
 * POST /api/profile/favorite/:programId
 * Favorilere program ekler.
 */
router.post("/favorite/:programId", async (req, res) => {
  try {
    const uid = req.user.uid;
    const pid = req.params.programId;
    await usersCol.doc(uid).update({
      favoritePrograms: FieldValue.arrayUnion(pid)
    });
    return res.json({ message: "Favorilere eklendi." });
  } catch (err) {
    console.error("🚨 POST /api/profile/favorite error:", err);
    return res.status(500).json({ error: "Favori ekleme hatası." });
  }
});

/**
 * DELETE /api/profile/favorite/:programId
 * Favorilerden program çıkarır.
 */
router.delete("/favorite/:programId", async (req, res) => {
  try {
    const uid = req.user.uid;
    const pid = req.params.programId;
    await usersCol.doc(uid).update({
      favoritePrograms: FieldValue.arrayRemove(pid)
    });
    return res.json({ message: "Favorilerden çıkarıldı." });
  } catch (err) {
    console.error("🚨 DELETE /api/profile/favorite error:", err);
    return res.status(500).json({ error: "Favori silme hatası." });
  }
});


module.exports = router;
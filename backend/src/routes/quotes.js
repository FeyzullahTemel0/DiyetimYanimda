const express = require("express");
const router = express.Router();
const { firestore, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

// PUBLIC ENDPOINT - Günün Sözü (Auth gerektirmiyor)
router.get("/daily", async (req, res) => {
  try {
    const snapshot = await firestore.collection("motivationQuotes").get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "Henüz hiç söz eklenmemiş." });
    }
    
    const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Tarih bazlı seed kullanarak günlük aynı sözü seç
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % quotes.length;
    
    res.status(200).json(quotes[index]);
  } catch (error) {
    console.error("Günün sözü alınamadı:", error);
    res.status(500).json({ error: "Günün sözü alınırken bir hata oluştu." });
  }
});

// Middleware: Admin rotalar için auth ve admin kontrolü
router.use(verifyToken);
router.use(checkAdmin);

// GET /api/admin/quotes - Tüm motivasyon sözlerini listele
router.get("/", async (req, res) => {
  try {
    const snapshot = await firestore.collection("motivationQuotes").orderBy("createdAt", "desc").get();
    const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(quotes);
  } catch (error) {
    console.error("Sözler listelenemedi:", error);
    res.status(500).json({ error: "Sözler listelenirken bir hata oluştu." });
  }
});

// POST /api/admin/quotes - Yeni söz ekle
router.post("/", async (req, res) => {
  try {
    const { text, author, category } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Söz metni gerekli!" });
    }

    const newQuote = {
      text: text.trim(),
      author: author?.trim() || "Anonim",
      category: category || "genel",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection("motivationQuotes").add(newQuote);
    res.status(201).json({ id: docRef.id, message: "Söz başarıyla eklendi!", ...newQuote });
  } catch (error) {
    console.error("Söz eklenemedi:", error);
    res.status(500).json({ error: "Söz eklenirken bir hata oluştu." });
  }
});

// PUT /api/admin/quotes/:id - Sözü güncelle
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author, category } = req.body;

    const updates = {};
    if (text !== undefined) updates.text = text.trim();
    if (author !== undefined) updates.author = author.trim() || "Anonim";
    if (category !== undefined) updates.category = category;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Güncellenecek veri bulunamadı." });
    }

    await firestore.collection("motivationQuotes").doc(id).update(updates);
    res.status(200).json({ message: "Söz başarıyla güncellendi!" });
  } catch (error) {
    console.error("Söz güncellenemedi:", error);
    res.status(500).json({ error: "Söz güncellenirken bir hata oluştu." });
  }
});

// DELETE /api/admin/quotes/:id - Sözü sil
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await firestore.collection("motivationQuotes").doc(id).delete();
    res.status(200).json({ message: "Söz başarıyla silindi!" });
  } catch (error) {
    console.error("Söz silinemedi:", error);
    res.status(500).json({ error: "Söz silinirken bir hata oluştu." });
  }
});

module.exports = router;

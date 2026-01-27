// backend/src/routes/adminDietPrograms.js (TAM VE KESİN ÇALIŞAN HALİ)

const express = require("express");
const router = express.Router();
const { firestore } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

router.use(verifyToken);
router.use(checkAdmin);

// GET / - Tüm Programları Listele (Özet Bilgiler)
router.get("/", async (req, res) => {
  try {
    const { gender } = req.query;
    let query = firestore.collection("dietPrograms");
    if (gender && (gender === 'male' || gender === 'female')) {
      query = query.where('gender', '==', gender);
    }
    const snapshot = await query.get();
    if (snapshot.empty) return res.status(200).json([]);
    
    // DİKKAT: Bu liste endpoint'i, uzun alanları (tips, weeklyMenu) bilerek göndermez.
    const programs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Başlıksız Program',
        description: data.description || '',
        gender: data.gender || 'not_specified',
        calories: data.calories || 0,
        macros: data.macros || { proteinPercent: 0, carbPercent: 0, fatPercent: 0 },
        accessLevel: data.accessLevel || 'free',
        difficulty: data.difficulty || 'beginner',
        dietType: data.dietType || 'balanced',
        category: data.category || 'fat_loss',
        goal: data.goal || 'fat_loss',
        durationWeeks: data.durationWeeks || 0,
      };
    });
    res.status(200).json(programs);
  } catch (error) {
    console.error("Program listeleme hatası:", error);
    res.status(500).json({ error: "Programlar listelenirken bir hata oluştu." });
  }
});


// YENİ VE EN ÖNEMLİ KISIM: GET /:id - Tek Bir Programın Tüm Detaylarını Getir
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = firestore.collection("dietPrograms").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Program bulunamadı." });
        }
        
        // Bu endpoint, dokümandaki TÜM verileri geri döner.
        res.status(200).json({ id: doc.id, ...doc.data() });

    } catch (error) {
        console.error("Program detay getirme hatası:", error);
        res.status(500).json({ error: "Program detayı alınırken bir hata oluştu." });
    }
});


// POST / - Yeni Diyet Programı Oluşturma
router.post("/", async (req, res) => {
  try {
    // Body'den tüm alanları alıyoruz (tips ve weeklyMenu dahil)
    const { title, description, gender, calories, macros, accessLevel, tips, weeklyMenu } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Başlık ve açıklama alanları gereklidir." });
    }
    
    const newProgramData = {
      title,
      description,
      gender: gender || 'not_specified',
      calories: Number(calories) || 0,
      macros: macros || { proteinPercent: 0, carbPercent: 0, fatPercent: 0 },
      accessLevel: accessLevel || 'free',
      tips: tips || "", // Eğer boşsa, boş string olarak kaydet
      weeklyMenu: weeklyMenu || "" // Eğer boşsa, boş string olarak kaydet
    };

    const docRef = await firestore.collection("dietPrograms").add(newProgramData);
    
    // DÜZELTME: Kaydedilen veriyi veritabanından çekip geri döndürüyoruz.
    const newDoc = await docRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });

  } catch (error) {
    console.error("Program oluşturma hatası:", error);
    res.status(500).json({ error: "Diyet programı oluşturulurken bir hata oluştu." });
  }
});


// PUT /:id - Mevcut Bir Diyet Programını Güncelleme
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    // Gelen veride ID alanı varsa, güncelleme verisinden çıkaralım.
    delete updatedData.id;

    const programRef = firestore.collection("dietPrograms").doc(id);
    await programRef.update(updatedData);

    // DÜZELTME: Güncellenen veriyi veritabanından çekip geri döndürüyoruz.
    const updatedDoc = await programRef.get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });

  } catch (error) {
    console.error("Program güncelleme hatası:", error);
    res.status(500).json({ error: "Diyet programı güncellenirken bir hata oluştu." });
  }
});


// DELETE /:id - Program Silme (Değişiklik Yok)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await firestore.collection("dietPrograms").doc(id).delete();
        res.status(200).json({ message: "Program başarıyla silindi." });
    } catch (error) {
        console.error("Program silme hatası:", error);
        res.status(500).json({ error: "Program silinirken bir hata oluştu." });
    }
});


module.exports = router;
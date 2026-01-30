// backend/src/routes/recipes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { db } = require("../services/firebaseAdmin");

// GET: Tüm tarifler - Firestore'dan
router.get("/", verifyToken, async (req, res) => {
  try {
    const { category, targetGroup, vegan, glutenFree, dairyFree } = req.query;

    let query = db.collection("recipes");

    // Kategori filtresi
    if (category && category !== "tümü") {
      query = query.where("category", "==", category);
    }

    // Hedef grup filtresi - hem tags hem targetGroups için kontrol
    if (targetGroup && targetGroup !== "tümü") {
      // Önce tags field'ini dene (yeni tarifler için)
      query = query.where("tags", "array-contains", targetGroup);
    }

    // Status aktif olması
    query = query.where("status", "==", "active");

    const snapshot = await query.get();
    const recipes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // İstemci tarafı filtreler
      if (vegan === "true" && !data.vegan) return;
      if (glutenFree === "true" && !data.glutenFree) return;
      if (dairyFree === "true" && !data.dairyFree) return;

      recipes.push({
        id: doc.id,
        ...data
      });
    });

    res.json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error("Tarif listesi hatası:", error);
    res.status(500).json({ success: false, message: "Tarifler yüklenemedi" });
  }
});

// GET: Belirtilen ID'li tarif detayı
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("recipes").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Tarif bulunamadı" });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error("Tarif detay hatası:", error);
    res.status(500).json({ success: false, message: "Tarif alınamadı" });
  }
});

// POST: Yeni tarif ekle (Admin)
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Admin kontrolü
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "Sadece adminler tarif ekleyebilir" });
    }

    const {
      name,
      category,
      targetGroups,
      difficulty,
      prepTime,
      servings,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      glycemicIndex,
      description,
      ingredients,
      instructions,
      tips,
      vegan,
      glutenFree,
      dairyFree
    } = req.body;

    // Validasyon
    if (!name || !category || !targetGroups || targetGroups.length === 0) {
      return res.status(400).json({ success: false, message: "Zorunlu alanlar eksik" });
    }

    const recipeRef = await db.collection("recipes").add({
      name,
      category,
      targetGroups,
      difficulty,
      prepTime,
      servings,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      glycemicIndex,
      description,
      ingredients,
      instructions,
      tips,
      vegan,
      glutenFree,
      dairyFree,
      status: "active",
      rating: 0,
      reviews: 0,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Tarif başarıyla eklendi",
      id: recipeRef.id
    });
  } catch (error) {
    console.error("Tarif ekleme hatası:", error);
    res.status(500).json({ success: false, message: "Tarif eklenemedi" });
  }
});

// PUT: Tarif güncelle (Admin)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Admin kontrolü
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "Sadece adminler tarif güncelleyebilir" });
    }

    // Tarif var mı kontrol et
    const recipeDoc = await db.collection("recipes").doc(id).get();
    if (!recipeDoc.exists) {
      return res.status(404).json({ success: false, message: "Tarif bulunamadı" });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection("recipes").doc(id).update(updateData);

    res.json({
      success: true,
      message: "Tarif başarıyla güncellendi"
    });
  } catch (error) {
    console.error("Tarif güncelleme hatası:", error);
    res.status(500).json({ success: false, message: "Tarif güncellenemedi" });
  }
});

// DELETE: Tarif sil (Admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Admin kontrolü
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "Sadece adminler tarif silebilir" });
    }

    // Tarif var mı kontrol et
    const recipeDoc = await db.collection("recipes").doc(id).get();
    if (!recipeDoc.exists) {
      return res.status(404).json({ success: false, message: "Tarif bulunamadı" });
    }

    await db.collection("recipes").doc(id).delete();

    res.json({
      success: true,
      message: "Tarif başarıyla silindi"
    });
  } catch (error) {
    console.error("Tarif silme hatası:", error);
    res.status(500).json({ success: false, message: "Tarif silinemedi" });
  }
});

// POST: Favori tarif olarak kaydet
router.post("/:id/favorite", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const favoriteRecipes = userDoc.data().favoriteRecipes || [];

    if (!favoriteRecipes.includes(id)) {
      favoriteRecipes.push(id);
      await userRef.update({ favoriteRecipes });
    }

    res.json({
      success: true,
      message: "Tarif favorilere eklendi",
      favoriteRecipes
    });
  } catch (error) {
    console.error("Tarif favoriye ekleme hatası:", error);
    res.status(500).json({ success: false, message: "Favoriye eklenemedi" });
  }
});

// DELETE: Favori tariften çıkar
router.delete("/:id/favorite", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    let favoriteRecipes = userDoc.data().favoriteRecipes || [];
    favoriteRecipes = favoriteRecipes.filter(r => r !== id);

    await userRef.update({ favoriteRecipes });

    res.json({
      success: true,
      message: "Tarif favorilerden çıkarıldı",
      favoriteRecipes
    });
  } catch (error) {
    console.error("Tarif favoriden çıkarma hatası:", error);
    res.status(500).json({ success: false, message: "Favoriden çıkarılamadı" });
  }
});

// GET: Kullanıcının favori tariflerini getir
router.get("/user/favorites", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const favoriteIds = userDoc.data().favoriteRecipes || [];
    const recipes = [];

    for (const id of favoriteIds) {
      const recipeDoc = await db.collection("recipes").doc(id).get();
      if (recipeDoc.exists && recipeDoc.data().status === "active") {
        recipes.push({
          id: recipeDoc.id,
          ...recipeDoc.data()
        });
      }
    }

    res.json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error("Favori tarifler hatası:", error);
    res.status(500).json({ success: false, message: "Favori tarifler alınamadı" });
  }
});

// POST: Özelleştirilmiş tarif önerisi
router.post("/suggest", verifyToken, async (req, res) => {
  try {
    const { targetCalories, targetGroup } = req.body;

    let query = db.collection("recipes").where("status", "==", "active");

    if (targetGroup) {
      query = query.where("targetGroups", "array-contains", targetGroup);
    }

    const snapshot = await query.get();
    const suggestions = [];

    snapshot.forEach(doc => {
      suggestions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Kalori hedefine göre sırala
    suggestions.sort((a, b) => {
      const diff1 = Math.abs(a.calories - targetCalories);
      const diff2 = Math.abs(b.calories - targetCalories);
      return diff1 - diff2;
    });

    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions.slice(0, 10) // En iyi 10 tarifin önerilmesi
    });
  } catch (error) {
    console.error("Tarif önerisi hatası:", error);
    res.status(500).json({ success: false, message: "Tarif önerileri alınamadı" });
  }
});

module.exports = router;

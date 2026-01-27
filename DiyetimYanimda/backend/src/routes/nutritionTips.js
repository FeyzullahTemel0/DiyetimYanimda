const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/nutrition-tips
 * Tüm ipuçlarını al (filtre, kategori seçeneği ile)
 */
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let query = db.collection("nutrition_tips").where("status", "==", "active");

    if (category) {
      query = query.where("category", "==", category);
    }

    // Tüm sonuçları al ve client-side'de sırala (index gereksinimini kaldır)
    const snapshot = await query.get();
    
    let tips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // is_featured'a göre sırala (true önde), sonra created_at'a göre
    tips.sort((a, b) => {
      if (b.is_featured !== a.is_featured) {
        return b.is_featured - a.is_featured;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Sayfalandırma
    const offset = (page - 1) * limit;
    const paginatedTips = tips.slice(offset, offset + parseInt(limit));
    const hasMore = offset + parseInt(limit) < tips.length;

    res.json({ success: true, tips, hasMore, currentPage: parseInt(page) });
  } catch (error) {
    console.error("Error fetching tips:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/nutrition-tips/featured
 * Günün ipucunu al - Her gün farklı kategoriden
 */
router.get("/featured", async (req, res) => {
  try {
    // Tüm kategorileri al
    const categoriesSnapshot = await db.collection("nutrition_categories").get();
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (categories.length === 0) {
      return res.json({ success: true, tip: null });
    }

    // Günün kategori index'ini hesapla (her gün farklı kategori)
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const categoryIndex = dayOfYear % categories.length;
    const selectedCategory = categories[categoryIndex];

    // Seçilen kategoriden rastgele bir ipucu al
    const tipsSnapshot = await db
      .collection("nutrition_tips")
      .where("status", "==", "active")
      .where("category", "==", selectedCategory.id)
      .get();

    const tips = tipsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    if (tips.length === 0) {
      return res.json({ success: true, tip: null });
    }

    // Günün seed'ini kullanarak deterministik rastgele seçim (her gün aynı ipucu)
    const tipIndex = dayOfYear % tips.length;
    const tip = tips[tipIndex];

    res.json({ success: true, tip });
  } catch (error) {
    console.error("Error fetching featured tip:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/nutrition-tips/categories
 * Tüm kategorileri al
 */
router.get("/categories", async (req, res) => {
  try {
    const snapshot = await db.collection("nutrition_categories").get();
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/nutrition-tips/tags
 * Tüm etiketleri al
 */
router.get("/tags", async (req, res) => {
  try {
    const snapshot = await db.collection("nutrition_tags").get();
    const tags = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/nutrition-tips/:id
 * Bir ipucunun detayını al
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("nutrition_tips").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Tip bulunamadı" });
    }

    const tip = { id: doc.id, ...doc.data() };

    // Okunma sayısını artır
    await db
      .collection("nutrition_tips")
      .doc(id)
      .update({ view_count: (tip.view_count || 0) + 1 });

    res.json({ success: true, tip });
  } catch (error) {
    console.error("Error fetching tip:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * POST /api/nutrition-tips
 * Yeni ipucu ekle (ADMIN ONLY)
 */
router.post("/", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { title, short_description, content, category, tags, read_time, image, is_featured } = req.body;

    if (!title || !short_description || !content || !category) {
      return res.status(400).json({ error: "Gerekli alanlar eksik" });
    }

    const newTip = {
      title,
      short_description,
      content,
      category,
      tags: tags || [],
      read_time: read_time || "1 dakika",
      image: image || "",
      status: "active",
      is_featured: is_featured || false,
      view_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: req.user.uid,
    };

    const docRef = await db.collection("nutrition_tips").add(newTip);

    res.json({ success: true, id: docRef.id, message: "İpucu başarıyla eklendi" });
  } catch (error) {
    console.error("Error creating tip:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/nutrition-tips/:id
 * İpucu güncelle (ADMIN ONLY)
 */
router.put("/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, short_description, content, category, tags, read_time, image, status, is_featured } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (short_description !== undefined) updates.short_description = short_description;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (read_time !== undefined) updates.read_time = read_time;
    if (image !== undefined) updates.image = image;
    if (status !== undefined) updates.status = status;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    updates.updated_at = new Date();

    await db.collection("nutrition_tips").doc(id).update(updates);

    res.json({ success: true, message: "İpucu başarıyla güncellendi" });
  } catch (error) {
    console.error("Error updating tip:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/nutrition-tips/:id
 * İpucu sil (ADMIN ONLY)
 */
router.delete("/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("nutrition_tips").doc(id).delete();

    res.json({ success: true, message: "İpucu başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting tip:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/nutrition-tips/categories
 * Kategori ekle (ADMIN ONLY)
 */
router.post("/categories", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name, slug, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "İsim ve slug gereklidir" });
    }

    const newCategory = {
      name,
      slug,
      icon: icon || "",
      created_at: new Date(),
    };

    const docRef = await db.collection("nutrition_categories").add(newCategory);

    res.json({ success: true, id: docRef.id, message: "Kategori başarıyla eklendi" });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/nutrition-tips/categories/:id
 * Kategori güncelle (ADMIN ONLY)
 */
router.put("/categories/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (icon !== undefined) updates.icon = icon;
    updates.updated_at = new Date();

    await db.collection("nutrition_categories").doc(id).update(updates);

    res.json({ success: true, message: "Kategori başarıyla güncellendi" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/nutrition-tips/categories/:id
 * Kategori sil (ADMIN ONLY)
 */
router.delete("/categories/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("nutrition_categories").doc(id).delete();

    res.json({ success: true, message: "Kategori başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/nutrition-tips/tags
 * Etiket ekle (ADMIN ONLY)
 */
router.post("/tags", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Etiket adı gereklidir" });
    }

    const newTag = {
      name,
      created_at: new Date(),
    };

    const docRef = await db.collection("nutrition_tags").add(newTag);

    res.json({ success: true, id: docRef.id, message: "Etiket başarıyla eklendi" });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/nutrition-tips/tags/:id
 * Etiket sil (ADMIN ONLY)
 */
router.delete("/tags/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("nutrition_tags").doc(id).delete();

    res.json({ success: true, message: "Etiket başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/nutrition-tips/tags/:id
 * Etiket güncelle (ADMIN ONLY)
 */
router.put("/tags/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Etiket adı gereklidir" });
    }

    await db.collection("nutrition_tags").doc(id).update({ name, updated_at: new Date() });

    res.json({ success: true, message: "Etiket başarıyla güncellendi" });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

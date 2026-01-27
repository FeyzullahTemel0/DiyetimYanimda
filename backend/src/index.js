// backend/src/index.js

const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config(); 

// --- Middleware Tanımlamaları ---
// Bu bölüm, gelen istekleri işlemek için kullanılan ara yazılımları içerir.
// Tüm istekler rotalara ulaşmadan önce bu adımlardan geçer.

// 1. CORS (Cross-Origin Resource Sharing)
// Frontend'in (http://localhost:3000) backend'e (http://localhost:5000)
// güvenli bir şekilde istek atabilmesini sağlar.
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// 2. JSON Parser
// Gelen isteklerin gövdesindeki (body) JSON verilerini ayrıştırır
// ve req.body nesnesi olarak erişilebilir hale getirir.
// Base64 encoded resimler için payload limit'i 50MB'a çıkartıldı
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// --- Rota Tanımlamaları ---
// Bu bölüm, gelen istekleri ilgili rota dosyalarına yönlendirir.
// Her rota dosyası kendi alanıyla ilgili endpoint'leri yönetir.

console.log("🚦 Rotalar yükleniyor...");

// 1. Rota Dosyalarını İçe Aktarma
const authRoutes = require("./routes/Auth");
const profileRoutes = require("./routes/protected");
const dietProgramsRoutes = require("./routes/dietPrograms");
const adminUserRoutes = require("./routes/admin");
const adminDietRoutes = require("./routes/adminDietPrograms");
const paymentRoutes = require("./routes/payment");
const notificationRoutes = require("./routes/notifications");
const quotesRoutes = require("./routes/quotes");
const communityRoutes = require("./routes/community");
const nutritionTipsRoutes = require("./routes/nutritionTips");
const mealsRoutes = require("./routes/meals");
const recipesRoutes = require("./routes/recipes");

// 2. Rotaları Uygulamaya Bağlama
// '/api/auth' ile başlayan tüm istekler (örn: /api/auth/register, /api/auth/google-sync)
// authRoutes dosyasına yönlendirilir.
app.use("/api/auth", authRoutes);

// '/api/profile' ile başlayan tüm istekler profileRoutes'a yönlendirilir.
app.use("/api/profile", profileRoutes);

// '/api/diet-programs' ile başlayan tüm istekler dietProgramsRoutes'a yönlendirilir.
app.use("/api/diet-programs", dietProgramsRoutes);

// Topluluk paylaşımları
app.use("/api/community", communityRoutes);

// '/api/admin/users' ile başlayan tüm istekler adminUserRoutes'a yönlendirilir.
app.use("/api/admin/users", adminUserRoutes);

// '/api/admin/diet-programs' ile başlayan tüm istekler adminDietRoutes'a yönlendirilir.
app.use("/api/admin/diet-programs", adminDietRoutes);

// '/api/payment' ile başlayan tüm istekler paymentRoutes'a yönlendirilir.
app.use("/api/payment", paymentRoutes);

// '/api/notifications' ile başlayan tüm istekler notificationRoutes'a yönlendirilir.
app.use("/api/notifications", notificationRoutes);

// '/api/admin/quotes' ile başlayan tüm istekler quotesRoutes'a yönlendirilir.
app.use("/api/admin/quotes", quotesRoutes);

// '/api/nutrition-tips' ile başlayan tüm istekler nutritionTipsRoutes'a yönlendirilir.
app.use("/api/nutrition-tips", nutritionTipsRoutes);

// '/api/meals' ile başlayan tüm istekler mealsRoutes'a yönlendirilir.
app.use("/api/meals", mealsRoutes);

// '/api/recipes' ile başlayan tüm istekler recipesRoutes'a yönlendirilir.
app.use("/api/recipes", recipesRoutes);

// Pricing endpoint - Firestore'daki pricing collection'ını döner
app.get("/api/pricing", async (req, res) => {
  try {
    const { firestore } = require("./services/firebaseAdmin");
    const snapshot = await firestore.collection("pricing").get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const pricing = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(pricing);
  } catch (err) {
    console.error("Pricing fetch hatası:", err);
    res.status(500).json({ error: "Fiyatlandırma verileri alınamadı." });
  }
});

console.log("✅ Rotalar başarıyla yüklendi.");


// --- Genel Hata Yakalayıcı (Error Handler) ---
// Rotalarda meydana gelen ve yakalanmayan hatalar en son bu middleware'e düşer.
// Bu, sunucunun çökmesini engeller ve kullanıcıya standart bir hata mesajı döner.
app.use((err, req, res, next) => {
  console.error("🔥 Genel Hata Yakalandı:", err.stack || err);
  res.status(500).json({ error: "Sunucuda beklenmedik bir hata oluştu." });
});


// --- Sunucuyu Başlatma ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda başarıyla başlatıldı!`));
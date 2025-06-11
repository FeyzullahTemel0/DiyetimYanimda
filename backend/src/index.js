// backend/src/index.js

const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config(); 

const aiRoutes = require('./routes/ai');
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
app.use(express.json());



// Mevcut app.use() satırlarınızın altına ekleyin
app.use('/api/ai', aiRoutes); // Yeni AI route'umuzu /api/ai altında bağlıyoruz

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

// 2. Rotaları Uygulamaya Bağlama
// '/api/auth' ile başlayan tüm istekler (örn: /api/auth/register, /api/auth/google-sync)
// authRoutes dosyasına yönlendirilir.
app.use("/api/auth", authRoutes);

// '/api/profile' ile başlayan tüm istekler profileRoutes'a yönlendirilir.
app.use("/api/profile", profileRoutes);

// '/api/diet-programs' ile başlayan tüm istekler dietProgramsRoutes'a yönlendirilir.
app.use("/api/diet-programs", dietProgramsRoutes);

// '/api/admin/users' ile başlayan tüm istekler adminUserRoutes'a yönlendirilir.
app.use("/api/admin/users", adminUserRoutes);

// '/api/admin/diet-programs' ile başlayan tüm istekler adminDietRoutes'a yönlendirilir.
app.use("/api/admin/diet-programs", adminDietRoutes);

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
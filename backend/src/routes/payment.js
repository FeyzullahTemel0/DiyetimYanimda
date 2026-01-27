const express = require("express");
const router = express.Router();
const { firestore, FieldValue } = require("../services/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");

// Plan tanımları
const PLANS = {
  free: { name: "Ücretsiz Plan", price: 0 },
  basic: { name: "Temel Plan", price: 99 },
  premium: { name: "Premium Plan", price: 249 },
  plus: { name: "Profesyonel Plus+", price: 499 }
};

// POST /api/payment/create-session - Ödeme oturumu oluştur (Stripe ödemi simülasyonu)
router.post("/create-session", verifyToken, async (req, res) => {
  try {
    const { planId, planName, planPrice } = req.body;
    const uid = req.user.uid;

    // Plan validasyonu
    if (!PLANS[planId]) {
      return res.status(400).json({ error: "Geçersiz plan" });
    }

    // Demo amaçlı: Stripe yerine basit bir session oluştur
    // Gerçek uygulamada Stripe API kullanılır
    const sessionData = {
      planId,
      planName,
      planPrice,
      userId: uid,
      createdAt: new Date().toISOString(),
      sessionId: `session_${Date.now()}`
    };

    // Session'ı geçici olarak localStorage'da tutabiliriz veya DB'ye yazabiliriz
    // Şu an basit demo: ödeme sayfasına yönlendir
    const sessionUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment?session=${sessionData.sessionId}&plan=${planId}&amount=${planPrice}`;

    res.json({ sessionUrl });
  } catch (error) {
    console.error("Ödeme oturumu oluşturma hatası:", error);
    res.status(500).json({ error: "Ödeme oturumu oluşturulamadı" });
  }
});

// POST /api/payment/webhook - Stripe webhook (ödeme tamamlandı)
router.post("/webhook", async (req, res) => {
  try {
    // Gerçek Stripe webhook işleme
    // Şu an demo amaçlı geçilir
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook hatası:", error);
    res.status(500).json({ error: "Webhook işleme hatası" });
  }
});

// POST /api/payment/confirm - Ödemeyi doğrula ve planı aktifleştir
router.post("/confirm", verifyToken, async (req, res) => {
  try {
    const { planId, planName, planPrice, features, paymentId } = req.body;
    const uid = req.user.uid;

    // Plan ID'nin boş olmamasını kontrol et
    if (!planId) {
      return res.status(400).json({ error: "Plan ID gereklidir" });
    }

    const userRef = firestore.collection("users").doc(uid);
    const now = new Date();
    const endDate = new Date(now.setMonth(now.getMonth() + 1));

    // Plan aktivasyonu - features ile beraber
    await userRef.update({
      "subscription.plan": planId,
      "subscription.planName": planName || "Plan",
      "subscription.price": planPrice || 0,
      "subscription.features": features || [],
      "subscription.status": "active",
      "subscription.startDate": FieldValue.serverTimestamp(),
      "subscription.endDate": endDate,
      "subscription.paymentId": paymentId,
      "subscription.lastRenewalDate": FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      message: "Plan başarı ile aktifleştirildi",
      plan: planId
    });
  } catch (error) {
    console.error("Ödeme doğrulama hatası:", error);
    res.status(500).json({ error: "Ödeme doğrulanamadı" });
  }
});

module.exports = router;

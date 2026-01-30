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

    // Validasyonlar
    if (!planId || planId.trim() === '') {
      return res.status(400).json({ error: "Plan ID boş olamaz - ödeme başarısız" });
    }

    if (!PLANS[planId]) {
      return res.status(400).json({ error: `Geçersiz plan: '${planId}' - Sistem tanımı yok` });
    }

    if (planPrice === null || planPrice === undefined || planPrice < 0) {
      return res.status(400).json({ error: "Geçersiz ödeme tutarı" });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "Ödeme ID'si gereklidir" });
    }

    const userRef = firestore.collection("users").doc(uid);
    const now = new Date();
    const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 gün sonra

    // Plan aktivasyonu - features ile beraber
    const updateData = {
      "subscription.plan": planId,
      "subscription.planName": planName || PLANS[planId].name || "Plan",
      "subscription.price": planPrice,
      "subscription.features": features || [],
      "subscription.status": "active",
      "subscription.startDate": FieldValue.serverTimestamp(),
      "subscription.endDate": endDate.toISOString(),
      "subscription.paymentId": paymentId,
      "subscription.lastRenewalDate": FieldValue.serverTimestamp()
    };

    await userRef.update(updateData);

    console.log(`✅ Ödeme başarılı - Kullanıcı ${uid} Plan: ${planId}`);

    res.json({ 
      success: true, 
      message: `Plan '${planName || PLANS[planId].name}' başarı ile aktifleştirildi`,
      plan: planId,
      subscription: {
        plan: planId,
        planName: planName || PLANS[planId].name,
        price: planPrice,
        status: "active"
      }
    });
  } catch (error) {
    console.error("❌ Ödeme doğrulama hatası:", error);
    res.status(500).json({ error: `Ödeme doğrulanamadı: ${error.message}` });
  }
});

module.exports = router;

const admin = require('firebase-admin');
const serviceAccount = require('../src/services/firebaseAdminKey.json');

// Firebase Admin SDK'yı başlat
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const pricingPlans = [
  {
    planName: "Ücretsiz Plan",
    planId: "free",
    price: 0,
    currency: "₺",
    billingPeriod: "monthly",
    description: "Platformumuzu keşfedin ve temel diyet programları ile sağlıklı bir başlangıç yapın.",
    features: [
      "10+ Temel Diyet Programına Erişim",
      "Vücut Kitle İndeksi (BMI) Hesaplama",
      "Günlük Kalori Tracker",
      "Topluluk Forumlarına Erişim",
      "E-posta Desteği (24-48 saat)",
      "Beslenme İpuçları Bülteni"
    ],
    isPopular: false,
    active: true,
    createdAt: new Date()
  },
  {
    planName: "Temel Plan",
    planId: "basic",
    price: 99,
    currency: "₺",
    billingPeriod: "monthly",
    description: "Sağlıklı yaşama ilk adımı atmak isteyenler için kapsamlı çözüm.",
    features: [
      "Ücretsiz Plandaki Her Şey",
      "100+ Profesyonel Diyet Programı",
      "Kişiselleştirilmiş Beslenme Önerileri",
      "Favori Programları Kaydetme ve Takip Etme",
      "Detaylı Vücut Analizi ve Grafikleri",
      "Haftalık Beslenme Planı İndirme",
      "Aylık İlerleme Raporu",
      "Email Desteği (12-24 saat)"
    ],
    isPopular: false,
    active: true,
    createdAt: new Date()
  },
  {
    planName: "Premium Plan",
    planId: "premium",
    price: 249,
    currency: "₺",
    billingPeriod: "monthly",
    description: "Daha fazla araç ve kişiselleştirme seçenekleri ile hedeflerinize hızlı ulaşın.",
    features: [
      "Temel Plandaki Her Şey",
      "500+ Gelişmiş Diyet Programı",
      "Yapay Zeka Destekli Kişisel Beslenme Danışmanı",
      "Yemek Tariflerine Erişim ve Özelleştirme",
      "Beslenme İhtiyaçları Analiz ve Optimizasyon",
      "Haftalık Otomatik Beslenme Planı Oluşturma",
      "Makro Dengesi Takibi (Protein, Yağ, Karbonhidrat)",
      "Alışkanlık Geliştirme Programları",
      "Canlı Sohbet Desteği (8-16:00, Pazartesi-Cuma)",
      "PDF/Excel Raporlarını İndirme"
    ],
    isPopular: true,
    active: true,
    createdAt: new Date()
  },
  {
    planName: "Profesyonel Plus+",
    planId: "plus",
    price: 499,
    currency: "₺",
    billingPeriod: "monthly",
    description: "Maksimum kişiselleştirme, koç desteği ve özel içeriklerle yeni siz olun.",
    features: [
      "Premium Plan Plandaki Her Şey",
      "1000+ Detaylı Diyet Programı",
      "Özel Beslenme Danışmanı ile 1-1 Konsultasyon (Aylık 2 Saat)",
      "Kişiye Özel Keto, Vegan, Gluten-Free Planları",
      "Fitness ve Spor Yönetimine Entegreli Planlar",
      "Yaş, Cinsiyet ve Hedef Bazlı Antrenman Rehberleri",
      "Özel Beslenme Protokolleri (Yenileme, Bulk vb)",
      "Beslenme Uygulamasında Sınırsız Özelleştirme",
      "Öncelikli Canlı Sohbet Desteği (07:00-22:00, Günlük)",
      "Telefon Desteği",
      "Ay Sonu Profesyonel Değerlendirme Raporu",
      "Özel Yemek Listesi Oluşturma Hizmeti"
    ],
    isPopular: false,
    active: true,
    createdAt: new Date()
  }
];

async function seedPricingPlans() {
  try {
    console.log('🔄 Fiyatlandırma planları yükleniyor...');
    
    // Mevcut planları sil
    const existingPlans = await db.collection('pricing').get();
    console.log(`⚠️  ${existingPlans.size} mevcut plan bulundu, temizleniyor...`);
    
    for (const doc of existingPlans.docs) {
      await db.collection('pricing').doc(doc.id).delete();
    }
    
    // Yeni planları ekle
    for (const plan of pricingPlans) {
      const docRef = await db.collection('pricing').add(plan);
      console.log(`✅ "${plan.planName}" planı eklendi (ID: ${docRef.id})`);
    }
    
    console.log('\n✨ Tüm fiyatlandırma planları başarıyla yüklendi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

// Scripti çalıştır
seedPricingPlans();

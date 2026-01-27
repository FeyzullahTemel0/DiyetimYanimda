// frontend/src/components/PlanFeatures.jsx

// Her planın sahip olduğu özellikler - TÜMÜ EKSIKSIZ
export const PLAN_FEATURES = {
  free: {
    id: "free",
    name: "Ücretsiz Plan",
    price: 0,
    currency: "₺",
    billingPeriod: "Ücretsiz",
    description: "Platformumuzu keşfedin ve temel diyet programları ile sağlıklı bir başlangıç yapın.",
    programAccess: 10,
    features: [
      "10+ Temel Diyet Programına Erişim",
      "Vücut Kitle İndeksi (BMI) Hesaplama",
      "Günlük Kalori Tracker",
      "Topluluk Forumlarına Erişim",
      "E-posta Desteği (24-48 saat)",
      "Beslenme İpuçları Bülteni"
    ],
    canCreateProgram: false,
    canSaveCustomProgram: false,
    calorieTracker: true,
    advancedAnalytics: false,
    supportLevel: "forum",
    dietRecipes: false,
    fitnessGuides: false,
    consultantAccess: false,
    customMealPlans: false,
    progressReports: false,
    autoMealPlanGeneration: false,
    macroOptimization: false,
    habitPrograms: false
  },
  basic: {
    id: "basic",
    name: "Temel Plan",
    price: 99,
    currency: "₺",
    billingPeriod: "ay",
    description: "Sağlıklı yaşama ilk adımı atmak isteyenler için kapsamlı çözüm.",
    programAccess: 100,
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
    canCreateProgram: false,
    canSaveCustomProgram: true,
    calorieTracker: true,
    advancedAnalytics: true,
    supportLevel: "email",
    dietRecipes: true,
    fitnessGuides: false,
    consultantAccess: false,
    customMealPlans: true,
    progressReports: true,
    autoMealPlanGeneration: false,
    macroOptimization: false,
    habitPrograms: false,
    likeSystem: true,
    shareFeature: true
  },
  premium: {
    id: "premium",
    name: "Premium Plan",
    price: 249,
    currency: "₺",
    billingPeriod: "ay",
    description: "Daha fazla araç ve kişiselleştirme seçenekleri ile hedeflerinize hızlı ulaşın.",
    programAccess: 500,
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
    canCreateProgram: true,
    canSaveCustomProgram: true,
    calorieTracker: true,
    advancedAnalytics: true,
    supportLevel: "chat",
    dietRecipes: true,
    fitnessGuides: true,
    consultantAccess: false,
    customMealPlans: true,
    progressReports: true,
    autoMealPlanGeneration: true,
    macroOptimization: true,
    habitPrograms: true,
    aiAssistant: true,
    likeSystem: true,
    shareFeature: true,
    recipeCustomization: true,
    advancedReports: true
  },
  plus: {
    id: "plus",
    name: "Profesyonel Plus+",
    price: 499,
    currency: "₺",
    billingPeriod: "ay",
    description: "Maksimum kişiselleştirme, koç desteği ve özel içeriklerle yeni siz olun.",
    programAccess: 1000,
    features: [
      "Premium Plan Plandaki Her Şey",
      "1000+ Detaylı Diyet Programı",
      "Özel Beslenme Danışmanı ile 1-1 Konsültasyon (Aylık 2 Saat)",
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
    canCreateProgram: true,
    canSaveCustomProgram: true,
    calorieTracker: true,
    advancedAnalytics: true,
    supportLevel: "phone",
    dietRecipes: true,
    fitnessGuides: true,
    consultantAccess: true,
    customMealPlans: true,
    progressReports: true,
    autoMealPlanGeneration: true,
    macroOptimization: true,
    habitPrograms: true,
    aiAssistant: true,
    likeSystem: true,
    shareFeature: true,
    recipeCustomization: true,
    advancedReports: true,
    specializedPlans: true,
    personalConsultant: true,
    consultantHours: 2,
    prioritySupport: true,
    phoneSupport: true,
    monthlyEvaluation: true,
    mealPlanService: true
  }
};

export const PlanFeatures = ({ plan }) => {
  const planData = PLAN_FEATURES[plan];
  if (!planData) return null;

  return (
    <div className="plan-features-container">
      <h3>📋 {planData.name} Özellikleri</h3>
      <ul className="features-list">
        {planData.features.map((feature, idx) => (
          <li key={idx}>
            <span className="check-mark">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanFeatures;

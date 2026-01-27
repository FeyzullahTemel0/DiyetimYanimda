import React, { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import PlanAccess from "../components/PlanAccess";
import "./NutritionOptimization.css";

const getApiUrl = (endpoint) => {
  const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  return `${base}${endpoint}`;
};

export default function NutritionOptimization() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimization, setOptimization] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(getApiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Profil yüklenemedi");
        
        const data = await res.json();
        setProfile(data);
        
        calculateOptimization(data);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateOptimization = (profileData) => {
    const weight = profileData.weight || 70;
    const height = profileData.height || 170;
    const age = profileData.age || 25;
    const gender = profileData.gender || "female";
    const activityLevel = profileData.activityLevel || "moderate";
    const goal = profileData.goal || "maintain";

    // Calculate BMR (Harris-Benedict)
    let bmr;
    if (gender === "male") {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Activity factors
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdee = bmr * activityFactors[activityLevel];

    // Goal adjustments
    let targetCalories = tdee;
    if (goal === "lose") targetCalories = tdee - 500;
    else if (goal === "gain") targetCalories = tdee + 300;

    // Macro distribution
    const protein = weight * 2.0; // 2g per kg for active individuals
    const fat = (targetCalories * 0.25) / 9; // 25% of calories from fat
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

    // Micronutrients (RDA)
    const micronutrients = {
      vitaminD: { amount: gender === "male" ? 15 : 15, unit: "μg", sources: ["Somon", "Ton balığı", "Yumurta", "Güneş"] },
      vitaminB12: { amount: 2.4, unit: "μg", sources: ["Et", "Balık", "Süt", "Yumurta"] },
      iron: { amount: gender === "male" ? 8 : 18, unit: "mg", sources: ["Kırmızı et", "Baklagiller", "Ispanak", "Kuru meyve"] },
      calcium: { amount: 1000, unit: "mg", sources: ["Süt", "Peynir", "Yoğurt", "Yeşil yapraklılar"] },
      omega3: { amount: 1.6, unit: "g", sources: ["Somon", "Ceviz", "Keten tohumu", "Chia"] },
      magnesium: { amount: gender === "male" ? 400 : 310, unit: "mg", sources: ["Badem", "Ispanak", "Avokado", "Karanlık çikolata"] },
    };

    // Meal timing recommendations
    const mealTiming = [
      { time: "07:00 - 08:00", meal: "Kahvaltı", calories: (targetCalories * 0.25).toFixed(0), description: "Protein + Kompleks karb + Yağ" },
      { time: "10:00 - 11:00", meal: "Ara Öğün 1", calories: (targetCalories * 0.10).toFixed(0), description: "Meyve + Kuruyemiş" },
      { time: "12:30 - 13:30", meal: "Öğle", calories: (targetCalories * 0.30).toFixed(0), description: "Protein + Sebze + Karb" },
      { time: "16:00 - 17:00", meal: "Ara Öğün 2", calories: (targetCalories * 0.10).toFixed(0), description: "Yoğurt + Meyve veya Protein bar" },
      { time: "19:00 - 20:00", meal: "Akşam", calories: (targetCalories * 0.25).toFixed(0), description: "Protein + Sebze + Az karb" },
    ];

    // Supplement recommendations
    const supplements = [];
    
    if (goal === "gain") {
      supplements.push({ name: "Whey Protein", dosage: "25-30g", timing: "Egzersiz sonrası", benefit: "Kas kütlesi artışı" });
      supplements.push({ name: "Creatine", dosage: "5g", timing: "Günlük", benefit: "Güç ve performans artışı" });
    }
    
    if (goal === "lose") {
      supplements.push({ name: "L-Carnitine", dosage: "1-2g", timing: "Egzersiz öncesi", benefit: "Yağ yakımını destekler" });
      supplements.push({ name: "Yeşil Çay Ekstresi", dosage: "500mg", timing: "Sabah", benefit: "Metabolizmayı hızlandırır" });
    }
    
    supplements.push({ name: "Omega-3", dosage: "1-2g", timing: "Öğün ile", benefit: "Kalp ve beyin sağlığı" });
    supplements.push({ name: "Multivitamin", dosage: "1 tablet", timing: "Kahvaltı ile", benefit: "Genel sağlık desteği" });
    supplements.push({ name: "Vitamin D3", dosage: "1000-2000 IU", timing: "Sabah", benefit: "Kemik ve bağışıklık" });

    // Hydration
    const waterIntake = (weight * 0.035).toFixed(1);

    setOptimization({
      macros: {
        calories: targetCalories.toFixed(0),
        protein: protein.toFixed(1),
        carbs: carbs.toFixed(1),
        fat: fat.toFixed(1),
      },
      micronutrients,
      mealTiming,
      supplements,
      waterIntake,
      bmr: bmr.toFixed(0),
      tdee: tdee.toFixed(0),
    });
  };

  if (loading) {
    return (
      <PlanAccess requiredPlan="premium">
        <div className="nutrition-optimization-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </PlanAccess>
    );
  }

  if (!profile) {
    return (
      <PlanAccess requiredPlan="premium">
        <div className="nutrition-optimization-container">
          <div className="empty-state">
            <i className="fas fa-user-circle"></i>
            <h3>Profil Bilgisi Bulunamadı</h3>
            <p>Beslenme optimizasyonu için önce profil bilgilerinizi tamamlayın.</p>
            <a href="/profile" className="cta-btn">
              <i className="fas fa-user-edit"></i>
              Profili Tamamla
            </a>
          </div>
        </div>
      </PlanAccess>
    );
  }

  return (
    <PlanAccess requiredPlan="premium">
      <div className="nutrition-optimization-container">
        <header className="optimization-header">
          <h1>
            <i className="fas fa-dna"></i>
            Beslenme Optimizasyonu
          </h1>
          <p className="subtitle">Kişiselleştirilmiş beslenme analizi ve ihtiyaçlarınız</p>
        </header>

        {optimization && (
          <>
            {/* Macro Summary */}
            <div className="macro-summary-grid">
              <div className="macro-summary-card calories">
                <div className="card-icon">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="card-content">
                  <span className="card-label">Günlük Kalori</span>
                  <span className="card-value">{optimization.macros.calories}</span>
                  <span className="card-desc">kcal</span>
                </div>
              </div>

              <div className="macro-summary-card protein">
                <div className="card-icon">🥩</div>
                <div className="card-content">
                  <span className="card-label">Protein</span>
                  <span className="card-value">{optimization.macros.protein}g</span>
                  <span className="card-desc">{((optimization.macros.protein * 4 / optimization.macros.calories) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="macro-summary-card carbs">
                <div className="card-icon">🍞</div>
                <div className="card-content">
                  <span className="card-label">Karbonhidrat</span>
                  <span className="card-value">{optimization.macros.carbs}g</span>
                  <span className="card-desc">{((optimization.macros.carbs * 4 / optimization.macros.calories) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="macro-summary-card fat">
                <div className="card-icon">🥑</div>
                <div className="card-content">
                  <span className="card-label">Yağ</span>
                  <span className="card-value">{optimization.macros.fat}g</span>
                  <span className="card-desc">{((optimization.macros.fat * 9 / optimization.macros.calories) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="optimization-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-capsules"></i>
                  Mikro Besin Öğeleri (Günlük)
                </h3>
              </div>
              <div className="micronutrients-grid">
                {Object.entries(optimization.micronutrients).map(([key, data]) => (
                  <div key={key} className="micronutrient-item">
                    <div className="micro-header">
                      <span className="micro-name">
                        {key === "vitaminD" && "Vitamin D"}
                        {key === "vitaminB12" && "Vitamin B12"}
                        {key === "iron" && "Demir"}
                        {key === "calcium" && "Kalsiyum"}
                        {key === "omega3" && "Omega-3"}
                        {key === "magnesium" && "Magnezyum"}
                      </span>
                      <span className="micro-amount">{data.amount} {data.unit}</span>
                    </div>
                    <div className="micro-sources">
                      <strong>Kaynaklar:</strong> {data.sources.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Timing */}
            <div className="optimization-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-clock"></i>
                  Öğün Zamanlaması ve Dağılımı
                </h3>
              </div>
              <div className="meal-timing-list">
                {optimization.mealTiming.map((meal, idx) => (
                  <div key={idx} className="meal-timing-item">
                    <div className="meal-time">{meal.time}</div>
                    <div className="meal-info">
                      <div className="meal-name">{meal.meal}</div>
                      <div className="meal-calories">{meal.calories} kcal</div>
                      <div className="meal-description">{meal.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="meal-timing-note">
                <i className="fas fa-info-circle"></i>
                <p>Öğün zamanlaması metabolizmayı hızlandırır ve enerji seviyesini dengede tutar.</p>
              </div>
            </div>

            {/* Supplements */}
            <div className="optimization-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-pills"></i>
                  Takviye Önerileri
                </h3>
              </div>
              <div className="supplements-grid">
                {optimization.supplements.map((supp, idx) => (
                  <div key={idx} className="supplement-item">
                    <div className="supp-header">
                      <div className="supp-icon">💊</div>
                      <div className="supp-name">{supp.name}</div>
                    </div>
                    <div className="supp-details">
                      <div className="supp-row">
                        <span className="supp-label">Dozaj:</span>
                        <span className="supp-value">{supp.dosage}</span>
                      </div>
                      <div className="supp-row">
                        <span className="supp-label">Zamlama:</span>
                        <span className="supp-value">{supp.timing}</span>
                      </div>
                      <div className="supp-benefit">{supp.benefit}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="supplements-note">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Takviye kullanımı öncesi doktorunuza danışmanızı öneririz.</p>
              </div>
            </div>

            {/* Hydration */}
            <div className="optimization-card hydration-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-tint"></i>
                  Hidrasyon
                </h3>
              </div>
              <div className="hydration-content">
                <div className="water-visual">
                  <i className="fas fa-glass-whiskey"></i>
                </div>
                <div className="hydration-info">
                  <div className="water-amount">{optimization.waterIntake} Litre / Gün</div>
                  <p className="water-desc">
                    Vücut ağırlığınıza göre günlük su ihtiyacınız yaklaşık <strong>{optimization.waterIntake}L</strong>.
                    Bu yaklaşık <strong>{Math.ceil(optimization.waterIntake * 4)}</strong> bardak su demektir.
                  </p>
                  <div className="water-tips">
                    <div className="water-tip">
                      <i className="fas fa-check"></i>
                      <span>Sabah kalktığında 1-2 bardak</span>
                    </div>
                    <div className="water-tip">
                      <i className="fas fa-check"></i>
                      <span>Her öğünden 30 dk önce 1 bardak</span>
                    </div>
                    <div className="water-tip">
                      <i className="fas fa-check"></i>
                      <span>Egzersiz sırasında düzenli aralıklarla</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="optimization-card insights-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-lightbulb"></i>
                  Önemli Notlar ve İpuçları
                </h3>
              </div>
              <div className="insights-list">
                <div className="insight-item">
                  <i className="fas fa-check-circle"></i>
                  <p>
                    <strong>Bazal metabolizman (BMR):</strong> {optimization.bmr} kcal - Bu senin hiçbir aktivite yapmadan 
                    yaktığın kalori miktarı.
                  </p>
                </div>
                <div className="insight-item">
                  <i className="fas fa-check-circle"></i>
                  <p>
                    <strong>Toplam günlük enerji ihtiyacın (TDEE):</strong> {optimization.tdee} kcal - Aktivite seviyene 
                    göre günlük kalori ihtiyacın.
                  </p>
                </div>
                <div className="insight-item">
                  <i className="fas fa-star"></i>
                  <p>
                    Protein alımını vücut ağırlığın başına 1.6-2.2g arasında tut. Bu kas kütlesini korumak ve 
                    tokluk hissini artırmak için önemli.
                  </p>
                </div>
                <div className="insight-item">
                  <i className="fas fa-star"></i>
                  <p>
                    Kompleks karbonhidratları (tam tahıl, yulaf, quinoa) basit karbonhidratlara (şeker, beyaz un) tercih et.
                  </p>
                </div>
                <div className="insight-item">
                  <i className="fas fa-star"></i>
                  <p>
                    Sağlıklı yağları (zeytinyağı, avokado, fındık, omega-3) diyetine dahil et. Yağ hormon üretimi için gerekli.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PlanAccess>
  );
}

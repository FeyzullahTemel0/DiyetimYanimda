import React, { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import PlanAccess from "../components/PlanAccess";
import "./BodyAnalysis.css";

export default function BodyAnalysis() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setProfile(data);
          
          // Analizleri hesapla
          if (data.weight && data.height) {
            const calculatedAnalysis = calculateAnalysis(data);
            setAnalysis(calculatedAnalysis);
          }
        } catch (err) {
          console.error("Profil yüklenemedi:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateAnalysis = (data) => {
    const heightM = data.height / 100;
    const bmi = (data.weight / (heightM * heightM)).toFixed(1);
    
    // İdeal kilo (Robinson formülü)
    const heightCm = data.height;
    let idealWeight;
    if (data.gender === 'male') {
      idealWeight = 52 + (1.9 * ((heightCm - 152.4) / 2.54));
    } else {
      idealWeight = 49 + (1.7 * ((heightCm - 152.4) / 2.54));
    }
    idealWeight = idealWeight.toFixed(1);

    // Vücut yağ oranı tahmini (Jackson-Pollock)
    let bodyFat;
    if (data.gender === 'male') {
      bodyFat = (1.20 * bmi) + (0.23 * (data.age || 30)) - 16.2;
    } else {
      bodyFat = (1.20 * bmi) + (0.23 * (data.age || 30)) - 5.4;
    }
    bodyFat = Math.max(5, Math.min(50, bodyFat)).toFixed(1);

    // Bazal Metabolizma Hızı (Harris-Benedict)
    let bmr;
    if (data.gender === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * (data.age || 30));
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * (data.age || 30));
    }

    // Aktivite faktörü
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9
    };
    const activityFactor = activityFactors[data.activityLevel] || 1.2;
    const tdee = Math.round(bmr * activityFactor);

    // Hedef kalori
    let targetCalories = tdee;
    if (data.goal === 'fat_loss') {
      targetCalories = Math.round(tdee - 500);
    } else if (data.goal === 'muscle_gain') {
      targetCalories = Math.round(tdee + 300);
    }

    // Makrolar
    const proteinRatio = data.goal === 'muscle_gain' ? 0.35 : 0.30;
    const fatRatio = 0.25;
    const carbRatio = 1 - proteinRatio - fatRatio;

    const protein = Math.round((targetCalories * proteinRatio) / 4);
    const fat = Math.round((targetCalories * fatRatio) / 9);
    const carbs = Math.round((targetCalories * carbRatio) / 4);

    // BMI kategorisi
    let bmiCategory, bmiColor;
    if (bmi < 18.5) {
      bmiCategory = "Zayıf";
      bmiColor = "#3b82f6";
    } else if (bmi < 25) {
      bmiCategory = "Normal";
      bmiColor = "#22c55e";
    } else if (bmi < 30) {
      bmiCategory = "Kilolu";
      bmiColor = "#f59e0b";
    } else {
      bmiCategory = "Obez";
      bmiColor = "#ef4444";
    }

    return {
      bmi,
      bmiCategory,
      bmiColor,
      idealWeight,
      bodyFat,
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      protein,
      fat,
      carbs,
      waterIntake: Math.round(data.weight * 0.033 * 1000), // ml
    };
  };

  const getBMIPosition = (bmi) => {
    // BMI 15-40 aralığında pozisyon hesapla
    const min = 15;
    const max = 40;
    const position = ((bmi - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  if (loading) {
    return (
      <div className="body-analysis-container">
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Analiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PlanAccess requiredPlan="basic">
      <div className="body-analysis-container">
        <header className="analysis-header">
          <h1>
            <i className="fa-solid fa-chart-line"></i>
            Detaylı Vücut Analizi
          </h1>
          <p className="subtitle">Kişiselleştirilmiş sağlık metrikleri ve öneriler</p>
        </header>

        {!profile || !analysis ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-circle"></i>
            <h3>Profil bilgisi eksik</h3>
            <p>Vücut analizinizi görebilmek için lütfen profilinizi tamamlayın.</p>
            <a href="/profile" className="cta-btn">
              <i className="fa-solid fa-user-edit"></i> Profile Git
            </a>
          </div>
        ) : (
          <div className="analysis-grid">
            {/* BMI Card */}
            <div className="analysis-card highlight">
              <div className="card-header">
                <h3><i className="fa-solid fa-weight-scale"></i> Vücut Kitle İndeksi</h3>
              </div>
              <div className="bmi-display">
                <div className="bmi-value" style={{color: analysis.bmiColor}}>
                  {analysis.bmi}
                </div>
                <div className="bmi-category" style={{color: analysis.bmiColor}}>
                  {analysis.bmiCategory}
                </div>
              </div>
              <div className="bmi-scale">
                <div className="bmi-bar">
                  <div className="bmi-sections">
                    <span className="section underweight"></span>
                    <span className="section normal"></span>
                    <span className="section overweight"></span>
                    <span className="section obese"></span>
                  </div>
                  <div 
                    className="bmi-indicator" 
                    style={{left: `${getBMIPosition(analysis.bmi)}%`}}
                  >
                    <div className="indicator-dot"></div>
                  </div>
                </div>
                <div className="bmi-labels">
                  <span>Zayıf</span>
                  <span>Normal</span>
                  <span>Kilolu</span>
                  <span>Obez</span>
                </div>
              </div>
            </div>

            {/* Ağırlık Analizi */}
            <div className="analysis-card">
              <div className="card-header">
                <h3><i className="fa-solid fa-balance-scale"></i> Ağırlık Analizi</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Mevcut Kilo</span>
                  <span className="stat-value">{profile.weight} kg</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">İdeal Kilo</span>
                  <span className="stat-value success">{analysis.idealWeight} kg</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Hedef Kilo</span>
                  <span className="stat-value">{profile.targetWeight || analysis.idealWeight} kg</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fark</span>
                  <span className="stat-value warning">
                    {(profile.weight - (profile.targetWeight || analysis.idealWeight)).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Vücut Kompozisyonu */}
            <div className="analysis-card">
              <div className="card-header">
                <h3><i className="fa-solid fa-percent"></i> Vücut Kompozisyonu</h3>
              </div>
              <div className="composition-display">
                <div className="circular-progress">
                  <svg viewBox="0 0 120 120" className="progress-ring">
                    <circle cx="60" cy="60" r="50" className="progress-ring-bg"></circle>
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      className="progress-ring-fill"
                      style={{
                        strokeDasharray: `${(analysis.bodyFat / 100) * 314} 314`,
                        stroke: analysis.bodyFat > 25 ? '#ef4444' : analysis.bodyFat > 20 ? '#f59e0b' : '#22c55e'
                      }}
                    ></circle>
                  </svg>
                  <div className="progress-text">
                    <span className="progress-value">{analysis.bodyFat}%</span>
                    <span className="progress-label">Yağ Oranı</span>
                  </div>
                </div>
                <div className="composition-info">
                  <p>Yağ Kütlesi: <strong>{(profile.weight * analysis.bodyFat / 100).toFixed(1)} kg</strong></p>
                  <p>Yağsız Kütle: <strong>{(profile.weight * (1 - analysis.bodyFat / 100)).toFixed(1)} kg</strong></p>
                </div>
              </div>
            </div>

            {/* Kalori İhtiyacı */}
            <div className="analysis-card highlight">
              <div className="card-header">
                <h3><i className="fa-solid fa-fire-flame-curved"></i> Kalori İhtiyacı</h3>
              </div>
              <div className="calorie-breakdown">
                <div className="calorie-main">
                  <div className="calorie-box bmr">
                    <span className="calorie-label">Bazal Metabolizma (BMR)</span>
                    <span className="calorie-value">{analysis.bmr} kcal</span>
                    <span className="calorie-desc">Dinlenme hali</span>
                  </div>
                  <div className="calorie-box tdee">
                    <span className="calorie-label">Günlük Harcama (TDEE)</span>
                    <span className="calorie-value">{analysis.tdee} kcal</span>
                    <span className="calorie-desc">Aktivite dahil</span>
                  </div>
                  <div className="calorie-box target">
                    <span className="calorie-label">Hedef Kalori</span>
                    <span className="calorie-value">{analysis.targetCalories} kcal</span>
                    <span className="calorie-desc">
                      {profile.goal === 'fat_loss' ? 'Yağ yakma' : profile.goal === 'muscle_gain' ? 'Kas kazanma' : 'Koruma'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Makro Dağılımı */}
            <div className="analysis-card full-width">
              <div className="card-header">
                <h3><i className="fa-solid fa-chart-pie"></i> Günlük Makro Dağılımı</h3>
              </div>
              <div className="macros-display">
                <div className="macro-card protein">
                  <div className="macro-icon">
                    <i className="fa-solid fa-drumstick-bite"></i>
                  </div>
                  <div className="macro-info">
                    <span className="macro-name">Protein</span>
                    <span className="macro-amount">{analysis.protein}g</span>
                    <span className="macro-calories">{analysis.protein * 4} kcal</span>
                  </div>
                  <div className="macro-bar">
                    <div className="macro-fill" style={{width: `${(analysis.protein * 4 / analysis.targetCalories) * 100}%`}}></div>
                  </div>
                </div>

                <div className="macro-card carbs">
                  <div className="macro-icon">
                    <i className="fa-solid fa-bread-slice"></i>
                  </div>
                  <div className="macro-info">
                    <span className="macro-name">Karbonhidrat</span>
                    <span className="macro-amount">{analysis.carbs}g</span>
                    <span className="macro-calories">{analysis.carbs * 4} kcal</span>
                  </div>
                  <div className="macro-bar">
                    <div className="macro-fill" style={{width: `${(analysis.carbs * 4 / analysis.targetCalories) * 100}%`}}></div>
                  </div>
                </div>

                <div className="macro-card fat">
                  <div className="macro-icon">
                    <i className="fa-solid fa-bacon"></i>
                  </div>
                  <div className="macro-info">
                    <span className="macro-name">Yağ</span>
                    <span className="macro-amount">{analysis.fat}g</span>
                    <span className="macro-calories">{analysis.fat * 9} kcal</span>
                  </div>
                  <div className="macro-bar">
                    <div className="macro-fill" style={{width: `${(analysis.fat * 9 / analysis.targetCalories) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidrasyon */}
            <div className="analysis-card">
              <div className="card-header">
                <h3><i className="fa-solid fa-droplet"></i> Günlük Hidrasyon</h3>
              </div>
              <div className="hydration-display">
                <div className="water-icon">
                  <i className="fa-solid fa-glass-water"></i>
                </div>
                <div className="hydration-info">
                  <span className="hydration-amount">{analysis.waterIntake} ml</span>
                  <span className="hydration-desc">~ {Math.round(analysis.waterIntake / 250)} bardak su</span>
                  <p className="hydration-note">
                    Vücut ağırlığınıza göre önerilen günlük su miktarı
                  </p>
                </div>
              </div>
            </div>

            {/* Öneriler */}
            <div className="analysis-card full-width recommendations">
              <div className="card-header">
                <h3><i className="fa-solid fa-lightbulb"></i> Kişisel Öneriler</h3>
              </div>
              <div className="recommendations-grid">
                <div className="recommendation-item">
                  <i className="fa-solid fa-utensils"></i>
                  <p>Günde {Math.round(analysis.targetCalories / 5)} kalorilik 5 öğün tüketin</p>
                </div>
                <div className="recommendation-item">
                  <i className="fa-solid fa-dumbbell"></i>
                  <p>Haftada en az 3-4 gün egzersiz yapın</p>
                </div>
                <div className="recommendation-item">
                  <i className="fa-solid fa-bed"></i>
                  <p>Günde 7-8 saat kaliteli uyku alın</p>
                </div>
                <div className="recommendation-item">
                  <i className="fa-solid fa-heart-pulse"></i>
                  <p>Stres seviyenizi düşük tutmaya çalışın</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlanAccess>
  );
}

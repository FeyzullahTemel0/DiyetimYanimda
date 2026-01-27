import React, { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import PlanAccess from "../components/PlanAccess";
import "./MonthlyProgress.css";

const getApiUrl = (endpoint) => {
  const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  return `${base}${endpoint}`;
};

export default function MonthlyProgress() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
        
        // Calculate progress data
        calculateProgress(data);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedMonth, selectedYear]);

  const calculateProgress = (profileData) => {
    // Simulated weight history (in real app, fetch from database)
    const currentWeight = profileData.weight || 70;
    const targetWeight = profileData.targetWeight || 65;
    const startWeight = currentWeight + 5; // Simulated starting weight
    
    // Generate weekly data for the month
    const weeklyData = [];
    const weeksInMonth = 4;
    const weightChange = (currentWeight - startWeight) / weeksInMonth;
    
    for (let i = 0; i < weeksInMonth; i++) {
      weeklyData.push({
        week: i + 1,
        weight: (startWeight + (weightChange * i)).toFixed(1),
        calories: 1800 + Math.random() * 400,
        protein: 80 + Math.random() * 40,
        carbs: 180 + Math.random() * 60,
        fat: 50 + Math.random() * 30,
      });
    }

    // Calculate statistics
    const totalWeightChange = currentWeight - startWeight;
    const avgCalories = weeklyData.reduce((sum, w) => sum + w.calories, 0) / weeksInMonth;
    const avgProtein = weeklyData.reduce((sum, w) => sum + w.protein, 0) / weeksInMonth;
    const avgCarbs = weeklyData.reduce((sum, w) => sum + w.carbs, 0) / weeksInMonth;
    const avgFat = weeklyData.reduce((sum, w) => sum + w.fat, 0) / weeksInMonth;
    
    const progressToGoal = ((startWeight - currentWeight) / (startWeight - targetWeight) * 100).toFixed(1);
    const remainingWeight = (currentWeight - targetWeight).toFixed(1);
    const daysToGoal = Math.ceil((currentWeight - targetWeight) / 0.5 * 7); // Assuming 0.5kg per week

    setProgressData({
      weeklyData,
      statistics: {
        startWeight,
        currentWeight,
        targetWeight,
        totalWeightChange,
        avgCalories: avgCalories.toFixed(0),
        avgProtein: avgProtein.toFixed(1),
        avgCarbs: avgCarbs.toFixed(1),
        avgFat: avgFat.toFixed(1),
        progressToGoal,
        remainingWeight,
        daysToGoal,
      },
    });
  };

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <PlanAccess requiredPlan="basic">
        <div className="monthly-progress-container">
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
      <PlanAccess requiredPlan="basic">
        <div className="monthly-progress-container">
          <div className="empty-state">
            <i className="fas fa-user-circle"></i>
            <h3>Profil Bilgisi Bulunamadı</h3>
            <p>İlerleme raporunu görüntülemek için önce profil bilgilerinizi tamamlayın.</p>
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
    <PlanAccess requiredPlan="basic">
      <div className="monthly-progress-container">
        <header className="progress-header">
          <h1>
            <i className="fas fa-chart-line"></i>
            Aylık İlerleme Raporu
          </h1>
          <p className="subtitle">Hedefinize giden yolda aylık gelişiminizi takip edin</p>
          
          <div className="date-selector">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {months.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </header>

        {progressData && (
          <>
            {/* Summary Cards */}
            <div className="summary-grid">
              <div className="summary-card weight-change">
                <div className="card-icon">
                  <i className="fas fa-weight"></i>
                </div>
                <div className="card-content">
                  <span className="card-label">Kilo Değişimi</span>
                  <span className={`card-value ${progressData.statistics.totalWeightChange < 0 ? 'success' : 'warning'}`}>
                    {progressData.statistics.totalWeightChange > 0 ? '+' : ''}
                    {progressData.statistics.totalWeightChange.toFixed(1)} kg
                  </span>
                  <span className="card-desc">Bu ay</span>
                </div>
              </div>

              <div className="summary-card goal-progress">
                <div className="card-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <div className="card-content">
                  <span className="card-label">Hedefe İlerleme</span>
                  <span className="card-value">{progressData.statistics.progressToGoal}%</span>
                  <span className="card-desc">{progressData.statistics.remainingWeight} kg kaldı</span>
                </div>
              </div>

              <div className="summary-card avg-calories">
                <div className="card-icon">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="card-content">
                  <span className="card-label">Ort. Günlük Kalori</span>
                  <span className="card-value">{progressData.statistics.avgCalories}</span>
                  <span className="card-desc">kcal/gün</span>
                </div>
              </div>

              <div className="summary-card est-time">
                <div className="card-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="card-content">
                  <span className="card-label">Tahmini Süre</span>
                  <span className="card-value">{progressData.statistics.daysToGoal}</span>
                  <span className="card-desc">gün kaldı</span>
                </div>
              </div>
            </div>

            {/* Weight Progress Chart */}
            <div className="progress-card chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-area"></i>
                  Kilo Gelişimi
                </h3>
              </div>
              <div className="weight-chart">
                <div className="chart-grid">
                  {progressData.weeklyData.map((week, idx) => {
                    const maxWeight = Math.max(...progressData.weeklyData.map(w => parseFloat(w.weight)));
                    const minWeight = Math.min(...progressData.weeklyData.map(w => parseFloat(w.weight)));
                    const range = maxWeight - minWeight;
                    const height = range > 0 ? ((parseFloat(week.weight) - minWeight) / range * 100) : 50;
                    
                    return (
                      <div key={idx} className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: `${height}%` }}>
                          <span className="bar-value">{week.weight} kg</span>
                        </div>
                        <span className="bar-label">Hafta {week.week}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot start"></span>
                    <span>Başlangıç: {progressData.statistics.startWeight} kg</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot current"></span>
                    <span>Şimdiki: {progressData.statistics.currentWeight} kg</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot target"></span>
                    <span>Hedef: {progressData.statistics.targetWeight} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro Averages */}
            <div className="progress-card macros-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-balance-scale"></i>
                  Aylık Makro Ortalamaları
                </h3>
              </div>
              <div className="macros-grid">
                <div className="macro-stat protein">
                  <div className="macro-icon">🥩</div>
                  <div className="macro-info">
                    <span className="macro-label">Protein</span>
                    <span className="macro-value">{progressData.statistics.avgProtein}g</span>
                    <span className="macro-percentage">
                      {((progressData.statistics.avgProtein * 4 / progressData.statistics.avgCalories) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill protein" 
                      style={{ width: `${(progressData.statistics.avgProtein * 4 / progressData.statistics.avgCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-stat carbs">
                  <div className="macro-icon">🍞</div>
                  <div className="macro-info">
                    <span className="macro-label">Karbonhidrat</span>
                    <span className="macro-value">{progressData.statistics.avgCarbs}g</span>
                    <span className="macro-percentage">
                      {((progressData.statistics.avgCarbs * 4 / progressData.statistics.avgCalories) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill carbs" 
                      style={{ width: `${(progressData.statistics.avgCarbs * 4 / progressData.statistics.avgCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-stat fat">
                  <div className="macro-icon">🥑</div>
                  <div className="macro-info">
                    <span className="macro-label">Yağ</span>
                    <span className="macro-value">{progressData.statistics.avgFat}g</span>
                    <span className="macro-percentage">
                      {((progressData.statistics.avgFat * 9 / progressData.statistics.avgCalories) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="macro-bar">
                    <div 
                      className="macro-fill fat" 
                      style={{ width: `${(progressData.statistics.avgFat * 9 / progressData.statistics.avgCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="progress-card insights-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-lightbulb"></i>
                  Analizler ve Öneriler
                </h3>
              </div>
              <div className="insights-grid">
                {progressData.statistics.totalWeightChange < 0 && (
                  <div className="insight-item success">
                    <i className="fas fa-check-circle"></i>
                    <p>
                      <strong>Harika gidiyorsun!</strong> Bu ay {Math.abs(progressData.statistics.totalWeightChange).toFixed(1)} kg 
                      kaybettin. Sağlıklı kilo verme hızındasın.
                    </p>
                  </div>
                )}
                
                {progressData.statistics.totalWeightChange >= 0 && (
                  <div className="insight-item warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>
                      <strong>Dikkat!</strong> Bu ay kilo kaybı görülmüyor. Kalori alımını ve egzersiz rutinini 
                      gözden geçir.
                    </p>
                  </div>
                )}

                <div className="insight-item info">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Protein alımın günlük ortalama <strong>{progressData.statistics.avgProtein}g</strong>. 
                    İdeal protein alımı vücut ağırlığın başına 1.6-2.2g arasında olmalı.
                  </p>
                </div>

                <div className="insight-item info">
                  <i className="fas fa-tachometer-alt"></i>
                  <p>
                    Hedefine ulaşman için haftada ortalama <strong>0.5 kg</strong> vermeni öneriyoruz. 
                    Bu sağlıklı ve sürdürülebilir bir tempo.
                  </p>
                </div>

                <div className="insight-item tip">
                  <i className="fas fa-star"></i>
                  <p>
                    <strong>İpucu:</strong> Su tüketimini artır (günlük 2-3 litre), düzenli uyku (7-8 saat) 
                    ve haftalık 3-4 gün egzersiz ile daha iyi sonuçlar elde edebilirsin.
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

import React, { useState } from 'react';
import { PLAN_FEATURES } from '../components/PlanFeatures';
import './FeaturesPage.css';

export default function FeaturesPage() {
  const [selectedPlan, setSelectedPlan] = useState('all');

  const planOrder = ['free', 'basic', 'premium', 'plus'];
  const plans = planOrder.map(planId => PLAN_FEATURES[planId]);

  // Tüm özellikleri kategoriye göre grupla
  const allFeatures = {};
  const categories = {
    "Diyet Programları": "📚",
    "İzleme & Analiz": "📊",
    "Danışmanlık & Koçluk": "👨‍⚕️",
    "Kişiselleştirme": "🎨",
    "Destek": "💬",
    "Araçlar & Özellikler": "🛠️",
    "Raporlama": "📈",
    "Spor & Fitness": "💪",
    "Premium Hizmetler": "✨"
  };

  // Tüm özellikleri mapla
  const featureMatrix = {
    "Diyet Programları": {
      free: "10+",
      basic: "100+",
      premium: "500+",
      plus: "1000+"
    },
    "Kişiselleştirilmiş Öneriler": {
      free: false,
      basic: true,
      premium: true,
      plus: true
    },
    "Yapay Zeka Danışmanı": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "BMI & Kalori Tracker": {
      free: true,
      basic: true,
      premium: true,
      plus: true
    },
    "Vücut Analizi Grafikleri": {
      free: false,
      basic: true,
      premium: true,
      plus: true
    },
    "Program Favorileme": {
      free: false,
      basic: true,
      premium: true,
      plus: true
    },
    "Haftalık Beslenme Planı": {
      free: false,
      basic: true,
      premium: true,
      plus: true
    },
    "Otomatik Plan Oluşturma": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "Yemek Tarifi Kütüphanesi": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "Makro Optimizasyon": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "Alışkanlık Programları": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "Antrenman Rehberleri": {
      free: false,
      basic: false,
      premium: false,
      plus: true
    },
    "1-1 Konsültasyon": {
      free: false,
      basic: false,
      premium: false,
      plus: "2 Saat/Ay"
    },
    "Topluluk Forumları": {
      free: true,
      basic: true,
      premium: true,
      plus: true
    },
    "E-posta Desteği": {
      free: "24-48s",
      basic: "12-24s",
      premium: true,
      plus: true
    },
    "Canlı Sohbet": {
      free: false,
      basic: false,
      premium: "08-16",
      plus: "07-22"
    },
    "Telefon Desteği": {
      free: false,
      basic: false,
      premium: false,
      plus: true
    },
    "İlerleme Raporları": {
      free: false,
      basic: true,
      premium: true,
      plus: true
    },
    "PDF/Excel İndirmesi": {
      free: false,
      basic: false,
      premium: true,
      plus: true
    },
    "Beslenme Bülteni": {
      free: true,
      basic: true,
      premium: true,
      plus: true
    }
  };

  const getFeatureValue = (value) => {
    if (value === true) return "✓";
    if (value === false) return "✗";
    return value;
  };

  const getFeatureClass = (value) => {
    if (value === true || typeof value === 'string') return 'available';
    if (value === false) return 'unavailable';
    return 'neutral';
  };

  return (
    <div className="features-page">
      <div className="features-header">
        <h1>🎯 Tüm Özellikler Karşılaştırması</h1>
        <p>Her plana hangi özelliklerin dahil olduğunu görmek için aşağıyı gözden geçirin</p>
      </div>

      <div className="plan-selector">
        <button
          className={`plan-btn ${selectedPlan === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedPlan('all')}
        >
          Tümünü Göster
        </button>
        {plans.map(plan => (
          <button
            key={plan.id}
            className={`plan-btn ${selectedPlan === plan.id ? 'active' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.name}
          </button>
        ))}
      </div>

      {selectedPlan === 'all' ? (
        <div className="features-table-container">
          <table className="features-table">
            <thead>
              <tr>
                <th className="feature-name-col">Özellik</th>
                {plans.map(plan => (
                  <th key={plan.id} className={`plan-col plan-${plan.id}`}>
                    <div className="plan-header">
                      <div className="plan-name">{plan.name}</div>
                      <div className="plan-price">
                        {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                        {plan.price > 0 && <span>/ay</span>}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(featureMatrix).map(([feature, values]) => (
                <tr key={feature} className="feature-row">
                  <td className="feature-name-col">{feature}</td>
                  {plans.map(plan => (
                    <td
                      key={`${feature}-${plan.id}`}
                      className={`feature-cell ${getFeatureClass(values[plan.id])}`}
                    >
                      <span className="feature-value">
                        {getFeatureValue(values[plan.id])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="plan-details">
          {plans
            .filter(plan => plan.id === selectedPlan)
            .map(plan => (
              <div key={plan.id} className={`plan-detail-card plan-${plan.id}`}>
                <div className="plan-info">
                  <h2>{plan.name}</h2>
                  <div className="plan-pricing">
                    {plan.price === 0 ? (
                      <span className="price-free">Ücretsiz</span>
                    ) : (
                      <>
                        <span className="price-amount">₺{plan.price}</span>
                        <span className="price-period">/{plan.billingPeriod}</span>
                      </>
                    )}
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="features-list">
                  <h3>📋 Bu planda yer alan özellikler:</h3>
                  <ul>
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="check-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-cta">
                  <button className="btn-select-plan">
                    {plan.price === 0 ? 'Ücretsiz Başlayın' : `₺${plan.price}/ay ile Başla`}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="features-footer">
        <h3>ℹ️ Bilgi</h3>
        <ul className="info-list">
          <li>
            <strong>✓</strong> işareti: Özellik bu planda mevcuttur
          </li>
          <li>
            <strong>✗</strong> işareti: Özellik bu planda mevcut değildir
          </li>
          <li>
            <strong>Sayılar/Metinler</strong>: Belirli sınırlamalar veya özel koşullar
          </li>
          <li>
            Daha yüksek bir plana yükseltme yaparsanız, önceki planın tüm özelliklerini korursunuz.
          </li>
        </ul>
      </div>
    </div>
  );
}

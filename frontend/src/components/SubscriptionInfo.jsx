// frontend/src/components/SubscriptionInfo.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './SubscriptionInfo.css'; // Bu CSS'i birazdan oluşturacağız

// Kalan günleri hesaplayan yardımcı fonksiyon
const calculateDaysLeft = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const difference = end.getTime() - now.getTime();
  const daysLeft = Math.ceil(difference / (1000 * 3600 * 24));
  return daysLeft > 0 ? daysLeft : 0;
};

// Plan adlarını daha anlaşılır hale getiren fonksiyon
const getPlanName = (planId) => {
    switch (planId) {
        case 'basic': return 'Temel Plan';
        case 'premium': return 'Premium AI';
        case 'plus': return 'Profesyonel Plus+';
        default: return 'Ücretsiz Plan';
    }
}

export default function SubscriptionInfo({ subscription }) {

  // Eğer abonelik bilgisi yoksa veya ücretsizse, kullanıcıyı fiyatlandırma sayfasına yönlendir
  if (!subscription || subscription.plan === 'free') {
    return (
      <section className="tab-section subscription-info-tab">
        <h2>Aktif Bir Aboneliğiniz Bulunmuyor</h2>
        <p>Tüm özelliklerden faydalanmak ve kişisel diyet asistanınıza erişmek için size en uygun planı seçin.</p>
        <Link to="/pricing" className="btn-link">
          Abonelik Planlarını İncele
        </Link>
      </section>
    );
  }

  const daysLeft = calculateDaysLeft(subscription.endDate);

  return (
    <section className="tab-section subscription-info-tab">
      <h2>Abonelik Bilgilerim</h2>
      <div className="subscription-card">
        <div className={`plan-badge ${subscription.plan}`}>
            {getPlanName(subscription.plan)}
        </div>
        <div className="status-info">
          <p>
            <strong>Durum:</strong>
            <span className={`status-pill ${subscription.status}`}>
              {subscription.status === 'active' ? 'Aktif' : 'Pasif'}
            </span>
          </p>
          <p>
            <strong>Başlangıç Tarihi:</strong>
            <span>{new Date(subscription.startDate).toLocaleDateString('tr-TR')}</span>
          </p>
          <p>
            <strong>Yenileme Tarihi:</strong>
            <span>{new Date(subscription.endDate).toLocaleDateString('tr-TR')}</span>
          </p>
        </div>
        <div className="days-left-container">
          <div className="days-left-value">{daysLeft}</div>
          <div className="days-left-label">Gün Kaldı</div>
        </div>
        <div className="subscription-actions">
            <button className="btn-action manage">Aboneliği Yönet</button>
            <button className="btn-action cancel">İptal Et</button>
        </div>
      </div>
    </section>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useToastContext } from '../contexts/ToastContext';
import { getApiUrl } from '../config/apiConfig';
import './PaymentPage.css';

export default function PaymentPage() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Navigation state'den plan bilgileri
  const stateData = location.state || {};
  const planId = stateData.plan || searchParams.get('plan');
  const planName = stateData.planName || '';
  const planPrice = stateData.planPrice || searchParams.get('amount') || 0;
  const features = stateData.features || [];
  const description = stateData.description || '';
  const sessionId = searchParams.get('session');

  // Kullanıcı profil bilgisini çek
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(getApiUrl("/api/profile"), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
          }
        } catch (error) {
          console.error("Profil bilgisi alınamadı:", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleConfirmPayment = async () => {
    // Ödeme öncesi validasyon
    if (!planId || planId.trim() === '') {
      setError('Hata: Plan ID boş - Ödeme başarısız');
      showToast('❌ Hata: Plan bilgileri eksik', 'error');
      return;
    }

    if (planPrice === null || planPrice === undefined || planPrice < 0) {
      setError('Hata: Geçersiz ödeme tutarı');
      showToast('❌ Hata: Ödeme tutarı geçersiz', 'error');
      return;
    }

    if (!planName || planName.trim() === '') {
      setError('Hata: Plan adı boş - Ödeme başarısız');
      showToast('❌ Hata: Plan adı eksik', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      
      // Ödeme doğrulaması - features ile beraber gönder
      const res = await fetch(getApiUrl("/api/payment/confirm"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: planId.trim(),
          planName: planName.trim(),
          planPrice: Number(planPrice),
          features: Array.isArray(features) ? features : [],
          paymentId: sessionId || `payment_${Date.now()}`
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ödeme işlemi başarısız oldu");
      }

      const result = await res.json();
      
      // Başarılı
      showToast(`Ödeme başarılı! ${planName} planı aktifleştirildi 🎉`, 'success');
      navigate('/profile', { state: { planUpdated: true } });
    } catch (err) {
      setError(err.message);
      showToast('❌ Ödeme hatası: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="payment-page"><p>Yükleniyor...</p></div>;
  }

  // Plan bilgilerinin eksik olup olmadığını kontrol et
  if (!planId || planId.trim() === '' || !planName || planName.trim() === '') {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-card">
            <h1>⚠️ Ödeme Bilgileri Eksik</h1>
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '2rem' }}>
              Hata: Plan seçim bilgileri alınamadı. Lütfen fiyatlandırma sayfasından yeniden deneyin.
            </p>
            <button 
              className="btn-confirm" 
              onClick={() => navigate('/pricing')}
              style={{ width: '100%' }}
            >
              Fiyatlandırma Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-card">
          <h1>Ödeme Onayı</h1>
          
          <div className="payment-summary">
            <h2>Plan Özeti</h2>
            <div className="summary-item">
              <span className="label">Plan Adı:</span>
              <span className="value">{planName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Tutar:</span>
              <span className="value">₺{planPrice}/ay</span>
            </div>
            <div className="summary-item">
              <span className="label">Açıklama:</span>
              <span className="value">{description}</span>
            </div>
            <div className="summary-item">
              <span className="label">Kullanıcı:</span>
              <span className="value">{userProfile ? `${userProfile.name || ''} ${userProfile.surname || ''}`.trim() : 'Yükleniyor...'}</span>
            </div>
            <div className="summary-item">
              <span className="label">E-posta:</span>
              <span className="value">{user?.email || 'Yükleniyor...'}</span>
            </div>

            {features && features.length > 0 && (
              <div className="summary-features">
                <span className="label">Özellikler:</span>
                <ul className="features-list">
                  {features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="payment-info">
            <h3>Ödeme Bilgileri</h3>
            <p className="info-text">
              Bu demo modda ödeme otomatik olarak onaylanacaktır.
              Gerçek uygulamada Stripe veya benzeri bir ödeme sağlayıcısı entegrasyonu kullanılacaktır.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="payment-actions">
            <button 
              className="btn-cancel" 
              onClick={() => navigate('/pricing')}
              disabled={loading}
            >
              İptal Et
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : `₺${planPrice} Öde`}
            </button>
          </div>

          <p className="secure-notice">
            🔒 Ödeme işlemi güvenli ve şifreli bağlantı üzerinden yapılmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
}

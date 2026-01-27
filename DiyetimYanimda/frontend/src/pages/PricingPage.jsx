import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../services/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { getApiUrl } from '../config/apiConfig';
import { useToastContext } from '../contexts/ToastContext';
import './PricingPage.css';

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="check-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

export default function PricingPage() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kullanıcının profil bilgilerini ve mevcut planını çekelim
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

  // Veritabanından fiyatlandırma planlarını çekme
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'pricing'));
        const snapshot = await getDocs(q);
        
        // Aktif planları al ve sırala
        const activePlans = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: data.planId || doc.id,
              ...data,
              features: data.features || [],
              active: data.active !== false,
              isPopular: data.isPopular || false,
              price: data.price || 0,
              planName: data.planName || 'Plan'
            };
          })
          .filter(plan => plan.active === true)
          .sort((a, b) => a.price - b.price);
        
        setPlans(activePlans);
      } catch (error) {
        console.error('Fiyatlandırma planları yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricingPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!user) {
      return navigate('/register', { state: { fromPlan: plan.id } });
    }

    setLoadingPlan(plan.id);

    try {
      // Ücretsiz plan seçimi - doğrudan profil güncelle
      if (plan.price === 0) {
        const token = await user.getIdToken();
        const res = await fetch(getApiUrl("/api/profile/subscribe"), {
          method: "POST",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            plan: plan.id,
            planName: plan.planName,
            features: plan.features
          })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Plan güncellenemedi");
        }

        showToast(`${plan.planName} planı seçildi! ✅`, 'success');
        navigate('/profile');
        return;
      }

      // Ücretli planlar için ödeme sayfasına yönlendir
      // Plan ve özelliklerini state'de tutalım
      navigate('/payment', { 
        state: { 
          plan: plan.id,
          planName: plan.planName, 
          planPrice: plan.price,
          features: plan.features,
          description: plan.description
        } 
      });
    } catch (error) {
      showToast('Hata: ' + error.message, 'error');
      setLoadingPlan(null);
    }
  };

  const currentUserPlan = userProfile?.subscription?.plan || 'free';

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Size En Uygun Planı Seçin</h1>
        <p>Dönüşüm yolculuğunuzda ihtiyaçlarınıza yönelik hazırladığımız üyelik planları ile hedeflerinize bir adım daha yaklaşın.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Planlar yükleniyor...
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Şu anda aktif plan bulunmamaktadır.
        </div>
      ) : (
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.isPopular ? 'popular' : ''} ${currentUserPlan === plan.id ? 'current-plan' : ''}`}>
              {plan.isPopular && <div className="popular-badge">En Popüler</div>}
              
              <div className="plan-name">{plan.planName}</div>
              
              <div className="plan-price">
                {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                {plan.price > 0 && <span>/ay</span>}
              </div>
              
              <p className="plan-description">{plan.description}</p>
              
              <ul className="plan-features">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, i) => (
                    <li key={i}>
                      <CheckIcon />
                      <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /> 
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#999' }}>Özellik yok</li>
                )}
              </ul>

              <button 
                  className="btn-select-plan" 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.id || currentUserPlan === plan.id}
              >
                {loadingPlan === plan.id ? 'İşleniyor...' : (currentUserPlan === plan.id ? 'Mevcut Planınız' : 'Bu Planı Seç')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import './PricingPage.css';

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="check-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;

export default function PricingPage() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Kullanıcının profil bilgilerini ve mevcut planını çekelim
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("http://localhost:5000/api/profile", {
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

  const plans = [
    { id: "free", name: "Ücretsiz Plan", price: 0, description: "Platformumuzu keşfedin ve temel diyet programları ile sağlıklı bir başlangıç yapın.", features: [ "Sınırlı Sayıda Diyet Programına Erişim", "Vücut Kitle İndeksi Hesaplama", "Topluluk Forumlarına Erişim", "E-posta Bildirimleri" ], isPopular: false, },
    { id: "basic", name: "Temel Plan", price: 99, description: "Sağlıklı yaşama ilk adımı atmak isteyenler için harika bir başlangıç.", features: [ "Tüm Standart Diyet Programlarına Erişim", "Favori Programları Kaydetme", "Detaylı Vücut Analizi", "E-posta ile Topluluk Desteği" ], isPopular: false, },
    { id: "premium", name: "Premium AI", price: 249, description: "Yapay zeka asistanı ile hedeflerinize daha hızlı ve akıllıca ulaşın.", features: [ "**Temel Plandaki Her Şey**", "**Kişisel Yapay Zeka Diyet Asistanı**", "AI ile Kişiye Özel Program Oluşturma", "Özel Programları Kaydetme ve Düzenleme", "AI ile Anlık Soru-Cevap", "Öncelikli Destek" ], isPopular: true, },
    { id: "plus", name: "Profesyonel Plus+", price: 499, description: "Maksimum kişiselleştirme ve özel içeriklerle en iyi versiyonunuza ulaşın.", features: [ "**Premium AI Plandaki Her Şey**", "**Gelişmiş Sporcu ve Fitness Rehberleri**", "Kişiye Özel Antrenman Programları (Erkek/Kadın)", "Pilates ve Esneklik Tavsiyeleri (Kadın)", "Kas Kazanımı ve Fitness Rehberi (Erkek)", "VIP Destek Hattı" ], isPopular: false, }
  ];
  
  const handleSelectPlan = async (planId, planName, planPrice) => {
    if (!user) {
      return navigate('/register', { state: { fromPlan: planId } });
    }

    setLoadingPlan(planId);

    // Ücretsiz plan seçimi için backend'e istek atmaya gerek yok, direkt yönlendir.
    if (planId === 'free') {
        alert(`'${planName}' planını seçtiniz. Profil sayfanıza yönlendiriliyorsunuz.`);
        navigate('/profile');
        return;
    }
    
    // Ücretli planlar için ödeme simülasyonu
    alert(`'${planName}' planını seçtiniz. Ödeme sayfasına yönlendiriliyorsunuz... (Bu bir simülasyondur)`);
    
    setTimeout(async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch("http://localhost:5000/api/profile/subscribe", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plan: planId, paymentId: `sim-payment-${Date.now()}` })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Üyelik güncellenemedi.");
            
            alert("Ödeme başarılı! Üyeliğiniz güncellendi. Profilinize yönlendiriliyorsunuz.");
            navigate('/profile');
        } catch (error) {
            alert("Hata: " + error.message);
        } finally {
            setLoadingPlan(null);
        }
    }, 2000);
  };

  const currentUserPlan = userProfile?.subscription?.plan || 'free';

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Size En Uygun Planı Seçin</h1>
        <p>Dönüşüm yolculuğunuzda ihtiyaçlarınıza yönelik hazırladığımız üyelik planları ile hedeflerinize bir adım daha yaklaşın.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.isPopular ? 'popular' : ''} ${currentUserPlan === plan.id ? 'current-plan' : ''}`}>
            {plan.isPopular && <div className="popular-badge">En Popüler</div>}
            
            <div className="plan-name">{plan.name}</div>
            
            <div className="plan-price">
              {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
              {plan.price > 0 && <span>/ay</span>}
            </div>
            
            <p className="plan-description">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <CheckIcon />
                  <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /> 
                </li>
              ))}
            </ul>

            <button 
                className="btn-select-plan" 
                onClick={() => handleSelectPlan(plan.id, plan.name, plan.price)}
                disabled={loadingPlan === plan.id || currentUserPlan === plan.id}
            >
              {loadingPlan === plan.id ? 'İşleniyor...' : (currentUserPlan === plan.id ? 'Mevcut Planınız' : 'Bu Planı Seç')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
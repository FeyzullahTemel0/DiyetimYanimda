import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import { getApiUrl } from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Dietitians.css';

export default function Dietitians() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  
  const [dietitians, setDietitians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);
  const [selectedDietitian, setSelectedDietitian] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    checkUserPlanAndFetchDietitians();
  }, []);

  const checkUserPlanAndFetchDietitians = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        showToast('❌ Lütfen giriş yapın', 'error');
        navigate('/login');
        return;
      }

      // Kullanıcının planını kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const plan = userData?.subscription?.plan || 'free';
      
      setUserPlan(plan);

      // Premium veya Plus planı olması gerekir
      if (!['premium', 'plus'].includes(plan)) {
        showToast('❌ Bu özellik Premium veya Profesyonel Plus+ plan gerektirir', 'error');
        setTimeout(() => navigate('/pricing'), 2000);
        return;
      }

      // Diyetisyenleri çek
      const token = await user.getIdToken();
      const response = await fetch(getApiUrl('/api/dietitians/list'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDietitians(data.dietitians);
      } else {
        showToast('❌ Diyetisyenler yüklenemedi', 'error');
      }
    } catch (error) {
      console.error('Diyetisyenler yükleme hatası:', error);
      showToast('❌ Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDietitian = async (dietitianId) => {
    setRequesting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(getApiUrl('/api/dietitians/request'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dietitianId })
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ İstek gönderildi! Diyetisyen onayladığında bilgilendirileceksiniz.', 'success');
        setSelectedDietitian(null);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('İstek gönderme hatası:', error);
      showToast('❌ İstek gönderilemedi', 'error');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="dietitians-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!userPlan || !['premium', 'plus'].includes(userPlan)) {
    return (
      <>
        <Header />
        <div className="dietitians-container">
          <div className="premium-required">
            <h2>🔒 Premium+ Özelliği</h2>
            <p>Bu özelliğe erişim için Premium+ plan gereklidir.</p>
            <button onClick={() => navigate('/pricing')} className="btn-upgrade">
              Planları İncele
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="dietitians-container">
        <div className="dietitians-header">
          <h1>🏥 Diyetisyenlerimiz</h1>
          <p className="subtitle">
            Uzman diyetisyenlerimizle birebir çalışarak hedeflerinize ulaşın
          </p>
        </div>

        {dietitians.length === 0 ? (
          <div className="no-dietitians">
            <p>Henüz kayıtlı diyetisyen bulunmuyor.</p>
          </div>
        ) : (
          <div className="dietitians-grid">
            {dietitians.map((dietitian) => (
              <div key={dietitian.id} className="dietitian-card">
                <div className="dietitian-photo">
                  {dietitian.profilePhoto ? (
                    <img src={dietitian.profilePhoto} alt={dietitian.fullName} />
                  ) : (
                    <div className="default-photo">
                      <span>👤</span>
                    </div>
                  )}
                </div>

                <div className="dietitian-info">
                  <h3>{dietitian.fullName}</h3>
                  
                  <div className="info-row">
                    <span className="icon">📍</span>
                    <span>
                      {dietitian.location && typeof dietitian.location === 'object'
                        ? `${dietitian.location.city || ''}${dietitian.location.district ? ' / ' + dietitian.location.district : ''}${dietitian.location.neighborhood ? ' ' + dietitian.location.neighborhood : ''}`
                        : dietitian.location || ''}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="icon">🎓</span>
                    <span>{dietitian.specialization}</span>
                  </div>

                  <div className="info-row">
                    <span className="icon">💼</span>
                    <span>{dietitian.experienceYears} yıl deneyim</span>
                  </div>

                  {dietitian.certificates && dietitian.certificates.length > 0 && (
                    <div className="certificates">
                      <span className="icon">📜</span>
                      <div className="certificate-list">
                        {dietitian.certificates.map((cert, idx) => (
                          <span key={idx} className="certificate-badge">{cert}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="capacity-info">
                    <span className="capacity-label">Doluluk:</span>
                    <div className="capacity-bar">
                      <div 
                        className="capacity-fill" 
                        style={{ 
                          width: `${(dietitian.currentClients / dietitian.maxClients) * 100}%`,
                          backgroundColor: dietitian.currentClients >= dietitian.maxClients ? '#e74c3c' : '#4ca175'
                        }}
                      ></div>
                    </div>
                    <span className="capacity-text">
                      {dietitian.currentClients}/{dietitian.maxClients}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedDietitian(dietitian)}
                    disabled={dietitian.currentClients >= dietitian.maxClients}
                    className={`btn-request ${dietitian.currentClients >= dietitian.maxClients ? 'disabled' : ''}`}
                  >
                    {dietitian.currentClients >= dietitian.maxClients ? '⚠️ Kontenjan Dolu' : '📩 İstek Gönder'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* İstek Onay Modalı */}
        {selectedDietitian && (
          <div className="modal-overlay" onClick={() => setSelectedDietitian(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>📩 Diyetisyen İsteği</h2>
              <p>
                <strong>{selectedDietitian.fullName}</strong> diyetisyenimize istek göndermek istediğinize emin misiniz?
              </p>
              <p className="modal-info">
                💡 Diyetisyen isteğinizi onayladığında size bildirim gelecek ve birebir danışmanlık başlayacak.
              </p>

              <div className="modal-actions">
                <button
                  onClick={() => handleRequestDietitian(selectedDietitian.id)}
                  disabled={requesting}
                  className="btn-confirm"
                >
                  {requesting ? '⏳ Gönderiliyor...' : '✅ Evet, Gönder'}
                </button>
                <button
                  onClick={() => setSelectedDietitian(null)}
                  disabled={requesting}
                  className="btn-cancel"
                >
                  ❌ İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import './DietPrograms.css';
import GuestCalculator from '../components/GuestCalculator';
import { PLAN_FEATURES } from '../components/PlanFeatures';

// ==========================================================================
// Program Detay Modalı - Hatalı Prop'lar Düzeltildi
// ==========================================================================
const ProgramDetailModal = ({ program, userProfile, onClose, toggleFavorite }) => {
  if (!program) return null; // Program yoksa modalı hiç render etme
  
  const isFavorite = userProfile?.favoritePrograms?.includes(program.id);

  const renderListFromString = (text) => {
    if (!text || typeof text !== 'string') return null;
    return text.split('\n').filter(line => line.trim() !== '').map((line, index) => <li key={index}>{line}</li>);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        
        {/* Başlık Kısmı */}
        <div className="modal-header">
          <div className="modal-title-row">
            <h2>{program.title}</h2>
            <button 
              className={`modal-fav-btn ${isFavorite ? 'filled' : ''}`}
              onClick={(e) => toggleFavorite(e, program.id)}
              title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>
        
        {/* Metadata - Tamamen Ayrı Bölüm */}
        <div className="modal-metadata-section">
          <div className="modal-meta-list">
            <div className="meta-item">
              <i className={program.gender === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'}></i>
              <span>{program.gender === 'female' ? 'Kadın' : 'Erkek'}</span>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-fire-flame-curved"></i>
              <span>{program.calories || 'N/A'} Kcal</span>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-drumstick-bite"></i>
              <span>{program.macros?.proteinPercent || 'N/A'}% Protein</span>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-oil-well"></i>
              <span>{program.macros?.fatPercent || 'N/A'}% Yağ</span>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-wallet"></i>
              <span>{program.price ? `${program.price} TL / Ay` : 'Ücretsiz'}</span>
            </div>
          </div>
        </div>
        
        {/* Program Açıklaması */}
        <div className="modal-section">
          <h3><i className="fa-solid fa-bullseye"></i> Program Açıklaması</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{program.description || program.targetAudience || program.content || 'Açıklama bulunmamaktadır.'}</p>
        </div>
        
        {/* Genel İpuçları */}
        {program.tips && (
          <div className="modal-section">
            <h3><i className="fa-solid fa-lightbulb"></i> Genel İpuçları</h3>
            <div className="list-content">
              <ul>{renderListFromString(program.tips)}</ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


// ==========================================================================
// Ana Sayfa Bileşeni - HATALAR GİDERİLDİ
// ==========================================================================
function DietProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToastContext();
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const token = await user.getIdToken();
          // Promise.all ile iki isteği aynı anda yapıyoruz, daha performanslı.
          const [profileRes, programsRes] = await Promise.all([
            fetch('http://localhost:5000/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`http://localhost:5000/api/diet-programs`, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          if (!profileRes.ok) throw new Error('Profil bilgileri alınamadı.');
          if (!programsRes.ok) {
            const errData = await programsRes.json();
            throw new Error(errData.error || 'Diyet programları yüklenemedi.');
          }

          const profileData = await profileRes.json();
          const programsData = await programsRes.json();

          setUserProfile({ ...profileData, favoritePrograms: profileData.favoritePrograms || [] });
          setPrograms(programsData);

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Programları görmek için giriş yapmalısınız.");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCardClick = (program) => {
    setSelectedProgram(program);
  };
  
  const toggleFavorite = async (e, programId) => {
    e.stopPropagation(); // Kart tıklamasını engellemek için
    
    if (!auth.currentUser) {
      showToast('Favori eklemek için giriş yapın 🔐', 'info');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const isFavorite = userProfile?.favoritePrograms?.includes(programId);
      
      if (isFavorite) {
        await updateDoc(userRef, {
          favoritePrograms: arrayRemove(programId)
        });
        setUserProfile(prev => ({
          ...prev,
          favoritePrograms: prev.favoritePrograms.filter(id => id !== programId)
        }));
        showToast('Favorilerden çıkarıldı ⭐', 'info');
      } else {
        await updateDoc(userRef, {
          favoritePrograms: arrayUnion(programId)
        });
        setUserProfile(prev => ({
          ...prev,
          favoritePrograms: [...(prev.favoritePrograms || []), programId]
        }));
        showToast('Favorilere eklendi! ⭐', 'success');
      }
    } catch (error) {
      console.error('Favori güncelleme hatası:', error);
      showToast('Favori güncellenirken hata oluştu ⚠️', 'error');
    }
  };
  
  const handleSelectProgram = async (program) => {
    // Bu fonksiyonda değişiklik yok
    if (!auth.currentUser) return;
    // ...
  };

  // Plan'a göre programlara erişim kontrolü
  const getUserPlan = () => {
    const subscription = userProfile?.subscription;
    if (subscription?.status === 'active' || subscription?.status === 'pending') {
      return subscription?.plan || 'free';
    }
    return 'free';
  };

  const getProgramAccessLimit = () => {
    const plan = getUserPlan();
    return PLAN_FEATURES[plan]?.programAccess || 10;
  };

  const isUserPlanValid = () => {
    const subscription = userProfile?.subscription;
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'pending';
  };

  const canAccessProgram = (programIndex) => {
    const accessLimit = getProgramAccessLimit();
    return programIndex < accessLimit;
  };
  
  const filteredPrograms = programs.filter(program => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      program.title?.toLowerCase().includes(search) ||
      program.description?.toLowerCase().includes(search) ||
      program.targetAudience?.toLowerCase().includes(search)
    );
  });

  const getAccessMessage = () => {
    const plan = getUserPlan();
    const accessLimit = getProgramAccessLimit();
    if (plan === 'free') {
      return `Ücretsiz Plana Üye: ${accessLimit} programa erişim hakkınız var. Daha fazla program erişimi için <a href="/pricing" style="color: #2dd4bf;">yükseltme yapın</a>`;
    }
    return null;
  };
  
  // --- Render Logic ---
  if (loading) {
    return <div className="message-area"><i className="fa-solid fa-spinner fa-spin"></i> Veriler Yükleniyor...</div>;
  }

  if (error && error.includes("giriş yapmalısınız")) {
    return <GuestCalculator />;
  }

  if (error) {
    return <div className="message-area error-message"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>;
  }

  return (
    <div className="diet-programs-container">
      <h1>Size Özel Diyet Programları</h1>
      
      {/* Arama Barı */}
      <div className="search-bar-container">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Program ara... (örn: kilo verme, kadın, erkek)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* Plan Bilgisi ve Erişim Limiti Uyarısı */}
      <div className="plan-access-info">
        <p>
          <strong>Aktif Plan:</strong> {PLAN_FEATURES[getUserPlan()]?.name || 'Ücretsiz Plan'} 
          ({getProgramAccessLimit()} programa erişim)
        </p>
        {getAccessMessage() && (
          <p className="access-message" dangerouslySetInnerHTML={{__html: getAccessMessage()}}></p>
        )}
      </div>

      {filteredPrograms.length > 0 ? (
        <div className="programs-list">
          {filteredPrograms.map((program, index) => {
            const hasAccess = canAccessProgram(index);
            
            return (
              <div 
                key={program.id} 
                className={`program-card ${!hasAccess ? 'locked' : ''}`}
                onClick={() => hasAccess && handleCardClick(program)}
              >
                
                {!hasAccess && (
                  <div className="lock-overlay">
                    <div className="lock-message">
                      <i className="fa-solid fa-lock"></i>
                      <p>Bu programa erişmek için<br/>plana yükseltme yapın</p>
                    </div>
                  </div>
                )}
                <div className={`access-badge ${program.accessLevel || 'free'}`}>{program.accessLevel || 'free'}</div>
                <div className="card-content">
                  <h2>{program.title}</h2>
                  <p>{program.targetAudience || program.description}</p>
                  <div className="card-footer">
                    <span className="program-price">{program.price ? `${program.price} TL` : 'Plana Dahil'}</span>
                    {!hasAccess && <span className="lock-badge">🔒 Kilitli</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="message-area">
          <i className="fa-solid fa-folder-open"></i> 
          {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : 'Üyelik planınıza uygun bir diyet programı bulunamadı.'}
        </div>
      )}

      {selectedProgram && (
        <ProgramDetailModal 
          program={selectedProgram} 
          userProfile={userProfile}
          onClose={() => setSelectedProgram(null)} 
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

export default DietProgramsPage;
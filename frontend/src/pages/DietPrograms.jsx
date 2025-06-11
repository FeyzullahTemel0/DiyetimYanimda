import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, arrayRemove, doc, updateDoc } from "firebase/firestore";
import './DietPrograms.css';
import GuestCalculator from '../components/GuestCalculator';

// ==========================================================================
// Program Detay Modalı - Hatalı Prop'lar Düzeltildi
// ==========================================================================
const ProgramDetailModal = ({ program, userProfile, onClose, onSelectProgram }) => {
  if (!program) return null; // Program yoksa modalı hiç render etme

  const isSelected = userProfile?.selectedProgram?.programId === program.id;
  const isPaid = isSelected && userProfile?.selectedProgram?.status === 'paid';
  const isPending = isSelected && userProfile?.selectedProgram?.status === 'pending_payment';

  const renderListFromString = (text) => {
    if (!text || typeof text !== 'string') return null;
    return text.split('\n').filter(line => line.trim() !== '').map((line, index) => <li key={index}>{line}</li>);
  };
  
  const lockedContent = (
    <div className="locked-content-overlay">
      <div className="locked-content-message">
        <i className="fa-solid fa-lock"></i>
        <h3>Bu İçeriğe Erişmek İçin Programı Satın Alın</h3>
        <p>Haftalık plan ve ipuçları gibi tüm detaylara erişmek için ödemeyi tamamlayın.</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>{program.title}</h2>
          <div className="modal-meta">
            <span><i className={program.gender === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'}></i>{program.gender === 'female' ? 'Kadın' : 'Erkek'}</span>
            <span><i className="fa-solid fa-fire-flame-curved"></i>{program.calories || 'N/A'} Kcal</span>
            {/* DÜZELTME: macros objesinin varlığını kontrol et */}
            <span><i className="fa-solid fa-drumstick-bite"></i>{program.macros?.proteinPercent || 'N/A'}% Protein</span>
            <span><i className="fa-solid fa-oil-well"></i>{program.macros?.fatPercent || 'N/A'}% Yağ</span>
            <span><i className="fa-solid fa-wallet"></i>{program.price ? `${program.price} TL / Ay` : 'Ücretsiz'}</span>
          </div>
        </div>
        <div className="modal-section">
          <h3><i className="fa-solid fa-bullseye"></i> Program Açıklaması</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{program.targetAudience || program.description || 'Açıklama bulunmamaktadır.'}</p>
        </div>
        <div className="modal-section" style={{ position: 'relative' }}>
          <h3><i className="fa-solid fa-calendar-week"></i> Haftalık Program</h3>
          {!isPaid && lockedContent}
          <div className="list-content">{program.weeklyMenu ? <ul>{renderListFromString(program.weeklyMenu)}</ul> : <p>Detaylı haftalık plan bulunmamaktadır.</p>}</div>
        </div>
        <div className="modal-section" style={{ position: 'relative' }}>
          <h3><i className="fa-solid fa-lightbulb"></i> Genel İpuçları</h3>
          {!isPaid && lockedContent}
          <div className="list-content">{program.tips ? <ul>{renderListFromString(program.tips)}</ul> : <p>Bu program için özel ipuçları bulunmamaktadır.</p>}</div>
        </div>
        <div className="modal-footer">
          {isPaid ? <button className="action-btn success-btn" disabled><i className="fa-solid fa-check"></i> Bu Program Aktif</button>
            : isPending ? <button className="action-btn payment-btn">Ödemeyi Tamamla</button>
              : <button className="action-btn select-program-btn" onClick={() => onSelectProgram(program)}>Bu Programı Seçiyorum</button>}
        </div>
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
  
  // DİKKAT: FAVORİ EKLEME FONKSİYONU BAŞTAN YAZILDI VE DÜZELTİLDİ
  const toggleFavorite = async (programId) => {
    if (!auth.currentUser || !userProfile) return;
    
    const isCurrentlyFavorite = userProfile.favoritePrograms.includes(programId);
    const userRef = doc(db, 'users', auth.currentUser.uid);

    // 1. Önce UI'ı anında güncelle (Optimistic Update)
    setUserProfile(currentProfile => ({
      ...currentProfile,
      favoritePrograms: isCurrentlyFavorite
        ? currentProfile.favoritePrograms.filter(id => id !== programId)
        : [...currentProfile.favoritePrograms, programId],
    }));

    // 2. Sonra backend'e isteği gönder
    try {
      if (isCurrentlyFavorite) {
        await updateDoc(userRef, { favoritePrograms: arrayRemove(programId) });
      } else {
        await updateDoc(userRef, { favoritePrograms: arrayUnion(programId) });
      }
    } catch (err) {
      console.error("Favori güncelleme hatası:", err);
      // Hata olursa, UI'ı eski haline geri döndür
      setUserProfile(currentProfile => ({
        ...currentProfile,
        favoritePrograms: isCurrentlyFavorite
          ? [...currentProfile.favoritePrograms, programId]
          : currentProfile.favoritePrograms.filter(id => id !== programId),
      }));
      alert("Favori program güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };
  
  const handleSelectProgram = async (program) => {
    // Bu fonksiyonda değişiklik yok
    if (!auth.currentUser) return;
    // ...
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
      {programs.length > 0 ? (
        <div className="programs-list">
          {programs.map(program => (
            <div key={program.id} className="program-card" onClick={() => handleCardClick(program)}>
              <div className={`access-badge ${program.accessLevel || 'free'}`}>{program.accessLevel || 'free'}</div>
              <div 
                className={`fav-star ${userProfile?.favoritePrograms?.includes(program.id) ? 'filled' : ''}`} 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(program.id); }}>
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="card-content">
                <h2>{program.title}</h2>
                <p>{program.targetAudience || program.description}</p>
                <div className="card-footer">
                  <span className="program-price">{program.price ? `${program.price} TL` : 'Plana Dahil'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="message-area">
          <i className="fa-solid fa-folder-open"></i> Üyelik planınıza uygun bir diyet programı bulunamadı.
        </div>
      )}

      {selectedProgram && (
        <ProgramDetailModal 
          program={selectedProgram} 
          userProfile={userProfile}
          onClose={() => setSelectedProgram(null)} 
          onSelectProgram={handleSelectProgram}
        />
      )}
    </div>
  );
}

export default DietProgramsPage;
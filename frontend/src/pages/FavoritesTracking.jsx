import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import './DietPrograms.css';

function FavoritesTracking() {
  const [favoritePrograms, setFavoritePrograms] = useState([]);
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
          
          // Profil ve tüm programları çek
          const [profileRes, programsRes] = await Promise.all([
            fetch('http://localhost:5000/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`http://localhost:5000/api/diet-programs`, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          if (!profileRes.ok) throw new Error('Profil bilgileri alınamadı.');
          if (!programsRes.ok) throw new Error('Diyet programları yüklenemedi.');

          const profileData = await profileRes.json();
          const programsData = await programsRes.json();

          setUserProfile({ ...profileData, favoritePrograms: profileData.favoritePrograms || [] });
          
          // Sadece favorilerdeki programları filtrele
          const favorites = programsData.filter(p => 
            profileData.favoritePrograms && profileData.favoritePrograms.includes(p.id)
          );
          setFavoritePrograms(favorites);

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Favorileri görmek için giriş yapmalısınız.");
      }
    });

    return () => unsubscribe();
  }, []);

  const removeFavorite = async (programId) => {
    if (!auth.currentUser || !userProfile) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);

    // Önce UI'dan kaldır
    setFavoritePrograms(current => current.filter(p => p.id !== programId));
    setUserProfile(currentProfile => ({
      ...currentProfile,
      favoritePrograms: currentProfile.favoritePrograms.filter(id => id !== programId),
    }));

    // Backend'i güncelle
    try {
      await updateDoc(userRef, { favoritePrograms: arrayRemove(programId) });
    } catch (err) {
      console.error("Favori kaldırma hatası:", err);
      alert("Favori program kaldırılırken bir hata oluştu.");
      // Hata olursa geri ekle
      window.location.reload();
    }
  };

  const handleCardClick = (program) => {
    setSelectedProgram(program);
  };
  
  if (loading) {
    return (
      <div className="diet-programs-container">
        <div className="message-area">
          <i className="fa-solid fa-spinner fa-spin"></i> Favoriler Yükleniyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diet-programs-container">
        <div className="message-area error-message">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="diet-programs-container">
      <h1>
        <i className="fa-solid fa-star" style={{color: '#4ca175', marginRight: '0.5rem'}}></i>
        Favori Programlarım
      </h1>
      
      <div className="plan-access-info">
        <p>
          <i className="fa-solid fa-heart"></i> Favori olarak işaretlediğiniz diyet programları burada listelenir.
        </p>
      </div>

      {favoritePrograms.length > 0 ? (
        <div className="programs-list">
          {favoritePrograms.map((program) => (
            <div 
              key={program.id} 
              className="program-card"
              onClick={() => handleCardClick(program)}
            >
              <div 
                className="fav-star filled" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  removeFavorite(program.id); 
                }}
                title="Favorilerden çıkar"
              >
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="card-content">
                <h2>{program.title}</h2>
                <p>{program.targetAudience || program.description}</p>
                <div className="card-footer">
                  <span><i className="fa-solid fa-fire"></i> {program.calories || 'N/A'} Kcal</span>
                  <span><i className="fa-solid fa-drumstick-bite"></i> {program.macros?.proteinPercent || 'N/A'}% Protein</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="message-area">
          <i className="fa-solid fa-star" style={{fontSize: '3rem', color: '#4ca175', marginBottom: '1rem'}}></i>
          <h3>Henüz favori programınız yok</h3>
          <p>Diyet Programları sayfasından beğendiğiniz programları yıldız ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
          <a href="/diet-programs" className="action-btn select-program-btn" style={{marginTop: '1rem', display: 'inline-block'}}>
            <i className="fa-solid fa-utensils"></i> Diyet Programlarına Git
          </a>
        </div>
      )}

      {/* Program detay modalı */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setSelectedProgram(null)}>×</button>
            <div className="modal-header">
              <h2>{selectedProgram.title}</h2>
              <div className="modal-meta">
                <span><i className={selectedProgram.gender === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'}></i> {selectedProgram.gender === 'female' ? 'Kadın' : 'Erkek'}</span>
                <span><i className="fa-solid fa-fire-flame-curved"></i> {selectedProgram.calories || 'N/A'} Kcal</span>
                <span><i className="fa-solid fa-drumstick-bite"></i> {selectedProgram.macros?.proteinPercent || 'N/A'}% Protein</span>
                <span><i className="fa-solid fa-oil-well"></i> {selectedProgram.macros?.fatPercent || 'N/A'}% Yağ</span>
              </div>
            </div>
            <div className="modal-section">
              <h3><i className="fa-solid fa-bullseye"></i> Program Açıklaması</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProgram.targetAudience || selectedProgram.description || 'Açıklama bulunmamaktadır.'}</p>
            </div>
            <div className="modal-footer">
              <button className="action-btn select-program-btn" onClick={() => window.location.href = '/diet-programs'}>
                <i className="fa-solid fa-arrow-left"></i> Diyet Programlarına Dön
              </button>
              <button 
                className="action-btn" 
                style={{background: '#dc2626'}}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(selectedProgram.id);
                  setSelectedProgram(null);
                }}
              >
                <i className="fa-solid fa-trash"></i> Favorilerden Çıkar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoritesTracking;

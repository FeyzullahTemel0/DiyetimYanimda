import { useState, useEffect, useMemo } from "react";
import { useGlobalUpdate } from "../contexts/GlobalUpdateContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { arrayRemove, doc, updateDoc, collection, query, where, getDocs, getDoc, deleteDoc } from "firebase/firestore";
import ServiceRequest from "../components/ServiceRequest"; 
import ModernSpinner from "../components/ModernSpinner";
import PlanFeatures from "../components/PlanFeatures";
import { getApiUrl } from "../config/apiConfig";
import { useToastContext } from "../contexts/ToastContext";
import "./Profile.css"; 
import { onAuthStateChanged } from "firebase/auth"; 

const PLAN_ORDER = ["free", "basic", "premium", "plus"];
const hasPlanAccess = (userPlan = "free", requiredPlan = "basic") => PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);

const FREE_FEATURES = [
  { key: "calorie-tracker", label: "📊 Günlük Kalori Tracker", to: "/calorie-tracker", requiredPlan: "free", type: "route" },
  { key: "newsletter", label: "📧 Beslenme İpuçları Bülteni", to: "/nutrition-newsletter", requiredPlan: "free", type: "route" }
];

// ======================================================================
// BİLEŞEN: MyDietitianTab (Diyetisyenim)
// ======================================================================
function MyDietitianTab({ profile }) {
      const { updateKey, triggerGlobalUpdate } = useGlobalUpdate();
    const [cancelling, setCancelling] = useState(false);
    const [polling, setPolling] = useState(false); // Polling state
    // Diyetisyen ilişiğini iptal et
    const handleCancelDietitian = async () => {
      if (!window.confirm('Diyetisyen ile olan çalışmayı bırakmak için istek göndermek istediğinize emin misiniz?')) return;
      setCancelling(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(getApiUrl('/api/cancel-dietitian'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          showToast('Çalışmayı bırakma isteğiniz diyetisyene iletildi. Diyetisyen onaylayana kadar ilişki devam edecek.', 'success');
          setPolling(true); // Start polling after leave request
        } else {
          showToast(data.error || 'İstek sırasında hata oluştu.', 'error');
        }
      } catch (err) {
        showToast('İstek sırasında hata oluştu.', 'error');
      } finally {
        setCancelling(false);
      }
    };
  const [dietitianData, setDietitianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadDietitianInfo();
  }, [profile?.subscription?.plan, updateKey]); // Plan veya global güncellemede yenile

  // Polling effect: after leave request, poll every 10s until dietitianData is null (relationship ended)
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(() => {
      loadDietitianInfo();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [polling]);

  const loadDietitianInfo = async () => {
    try {
      if (!auth.currentUser) return;

      // Kullanıcının diyetisyenini bul
      const clientRelationQuery = query(
        collection(db, 'dietitian_clients'),
        where('userId', '==', auth.currentUser.uid),
        where('isActive', '==', true)
      );

      const relationSnapshot = await getDocs(clientRelationQuery);

      if (relationSnapshot.empty) {
        setDietitianData(null);
        setLoading(false);
        setPolling(false); // Stop polling if relationship ended
        return;
      }

      const relationDoc = relationSnapshot.docs[0];
      const relationData = relationDoc.data();

      // Diyetisyen bilgilerini çek - UID ile getDoc kullan
      const dietitianDoc = await getDoc(doc(db, 'dietitians', relationData.dietitianId));

      if (dietitianDoc.exists()) {
        setDietitianData({ id: dietitianDoc.id, ...dietitianDoc.data() });
      } else {
        // Diyetisyen bulunamadıysa ilişkiyi tamamen sil (doğru yöntem)
        await deleteDoc(relationDoc.ref);
        setDietitianData(null);
        showToast('Diyetisyen kaydı bulunamadı. Hatalı ilişki kaldırıldı. Lütfen yeni bir diyetisyen seçin.', 'error');
        setLoading(false);
        setPolling(false); // Stop polling if relationship ended
        return;
      }

      // Randevuları yükle
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', auth.currentUser.uid),
        where('dietitianId', '==', relationData.dietitianId)
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appts = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAppointments(appts);
    } catch (error) {
      console.error('Diyetisyen bilgileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="tab-section">
        <ModernSpinner text="Diyetisyen bilgileriniz yükleniyor..." />
      </section>
    );
  }

  if (!dietitianData) {
    return (
      <section className="tab-section">
        <h2>🏥 Diyetisyenim</h2>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', marginTop: '2rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '1.5rem' }}>
            Henüz bir diyetisyenle çalışmıyorsunuz.
          </p>
          <Link to="/dietitians" className="btn btn-primary">
            🔍 Diyetisyenleri Keşfet
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tab-section">
      <h2>🏥 Diyetisyenim</h2>
      
      {/* Diyetisyen Kartı */}
      <div style={{ background: '#181818', borderRadius: '12px', padding: '2rem', marginTop: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', position: 'relative', color: 'white' }} onClick={handleCancelDietitian} title="Diyetisyen ile ilişiği iptal et">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', color: 'white' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancelDietitian(); }}
                    disabled={cancelling}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.5rem 1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px rgba(231,76,60,0.08)'
                    }}
                  >
                    {cancelling ? 'İptal Ediliyor...' : 'Çalışmayı İptal Et'}
                  </button>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #4ca175 0%, #3d8a5e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {dietitianData.profilePhoto ? (
              <img src={dietitianData.profilePhoto} alt={dietitianData.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '3rem', color: 'white' }}>👤</span>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>{dietitianData.fullName}</h3>
            <p style={{ color: '#e0e0e0', fontSize: '1.1rem', marginBottom: '1rem' }}>{dietitianData.specialization}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', color: 'white' }}>
              <div>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <span style={{ marginLeft: '0.5rem' }}>
                  {typeof dietitianData.location === 'object' && dietitianData.location !== null
                    ? [dietitianData.location.city, dietitianData.location.district, dietitianData.location.neighborhood].filter(Boolean).join(', ')
                    : dietitianData.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '1.2rem' }}>💼</span>
                <span style={{ marginLeft: '0.5rem' }}>{dietitianData.experienceYears} yıl deneyim</span>
              </div>
              {dietitianData.phone && (
                <div>
                  <span style={{ fontSize: '1.2rem' }}>📞</span>
                  <span style={{ marginLeft: '0.5rem' }}>{dietitianData.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Randevularım */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📅 Randevularım</h3>
        
        {appointments.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#7f8c8d' }}>Henüz randevunuz yok.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((appt) => (
              <div key={appt.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {appt.type === 'video' && '🎥 Video Görüşme'}
                      {appt.type === 'phone' && '📞 Telefon'}
                      {appt.type === 'whatsapp' && '💬 WhatsApp'}
                    </span>
                  </div>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    background: appt.status === 'confirmed' ? '#d4edda' : appt.status === 'pending' ? '#fff5e6' : '#f8d7da',
                    color: appt.status === 'confirmed' ? '#155724' : appt.status === 'pending' ? '#f39c12' : '#721c24'
                  }}>
                    {appt.status === 'pending' && '⏳ Bekliyor'}
                    {appt.status === 'confirmed' && '✅ Onaylandı'}
                    {appt.status === 'cancelled' && '❌ İptal'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '1rem' }}>📅 {appt.confirmedDate || appt.preferredDate}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1rem' }}>⏰ {appt.confirmedTime || appt.preferredTime}</span>
                  </div>
                </div>
                
                {appt.notes && (
                  <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>📝 {appt.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ======================================================================
// BİLEŞEN 0: FavoritesTrackingTab (Favori Programlarım)
// ======================================================================
function FavoritesTrackingTab({ profile }) {
  const [favoritePrograms, setFavoritePrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        setError("Favorileri görmek için giriş yapmalısınız.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = await auth.currentUser.getIdToken();
        const [profileRes, programsRes] = await Promise.all([
          fetch(getApiUrl("/api/profile"), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(getApiUrl("/api/diet-programs"), { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!profileRes.ok) throw new Error('Profil bilgileri alınamadı.');
        if (!programsRes.ok) throw new Error('Diyet programları yüklenemedi.');

        const profileData = await profileRes.json();
        const programsData = await programsRes.json();

        const favorites = programsData.filter(p => 
          profileData.favoritePrograms && profileData.favoritePrograms.includes(p.id)
        );
        setFavoritePrograms(favorites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = async (programId) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    setFavoritePrograms(current => current.filter(p => p.id !== programId));

    try {
      await updateDoc(userRef, { favoritePrograms: arrayRemove(programId) });
    } catch (err) {
      console.error("Favori kaldırma hatası:", err);
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <section className="tab-section diet-tab">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fa-solid fa-spinner fa-spin"></i> Favoriler Yükleniyor...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tab-section diet-tab">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>
      </section>
    );
  }

  return (
    <section className="tab-section diet-tab">
      <h2><i className="fa-solid fa-star" style={{color: '#4ca175', marginRight: '0.5rem'}}></i> Favori Programlarım</h2>
      
      {favoritePrograms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fa-solid fa-star" style={{fontSize: '2rem', color: '#4ca175', marginBottom: '1rem', display: 'block'}}></i>
          <h3>Henüz favori programınız yok</h3>
          <p>Diyet Programları sayfasından beğendiğiniz programları yıldız ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
          <Link to="/diet-programs" style={{marginTop: '1rem', display: 'inline-block', padding: '0.75rem 1.5rem', background: '#4ca175', color: 'white', borderRadius: '0.5rem', textDecoration: 'none'}}>
            <i className="fa-solid fa-utensils"></i> Diyet Programlarına Git
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {favoritePrograms.map((program) => (
            <div 
              key={program.id} 
              style={{
                background: 'var(--white-bg)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => setSelectedProgram(program)}
            >
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.4rem', color: '#f0f0f0' }}>{program.title}</h3>
                <p style={{ color: 'var(--secondary-color)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {program.targetAudience || program.description}
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'right', fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  <span><i className="fa-solid fa-fire"></i> {program.calories || 'N/A'} Kcal</span> | 
                  <span style={{ marginLeft: '0.5rem' }}><i className="fa-solid fa-drumstick-bite"></i> {program.macros?.proteinPercent || 'N/A'}% Protein</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(program.id);
                }}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#ffd700',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title="Favorilerden çıkar"
              >
                ⭐
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedProgram && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedProgram(null)}>
          <div style={{
            background: 'var(--white-bg)',
            borderRadius: '0.8rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedProgram(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                color: 'var(--secondary-color)',
                lineHeight: '1'
              }}
            >×</button>
            <div style={{ marginTop: '20px', padding: '2rem 2.5rem 1rem', borderBottom: 'none' }}>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{selectedProgram.title}</h2>
            </div>
            <div style={{ marginTop: '10px', padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(76, 161, 117, 0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i style={{color: '#4ca175', width: '24px', textAlign: 'center', fontSize: '1.1rem'}} className={selectedProgram.gender === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'}></i>
                  <span>{selectedProgram.gender === 'female' ? 'Kadın' : 'Erkek'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i style={{color: '#4ca175', width: '24px', textAlign: 'center', fontSize: '1.1rem'}} className="fa-solid fa-fire-flame-curved"></i>
                  <span>{selectedProgram.calories || 'N/A'} Kcal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i style={{color: '#4ca175', width: '24px', textAlign: 'center', fontSize: '1.1rem'}} className="fa-solid fa-drumstick-bite"></i>
                  <span>{selectedProgram.macros?.proteinPercent || 'N/A'}% Protein</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i style={{color: '#4ca175', width: '24px', textAlign: 'center', fontSize: '1.1rem'}} className="fa-solid fa-oil-well"></i>
                  <span>{selectedProgram.macros?.fatPercent || 'N/A'}% Yağ</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '10px', border: '1px solid #334b3f', padding: '1.5rem 2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <i style={{marginRight: '0.75rem', color: '#28a745'}} className="fa-solid fa-bullseye"></i> Program Açıklaması
              </h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{selectedProgram.description || selectedProgram.targetAudience || 'Açıklama bulunmamaktadır.'}</p>
            </div>
            {selectedProgram.tips && (
              <div style={{ marginTop: '10px', border: '1px solid #334b3f', padding: '1.5rem 2.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <i style={{marginRight: '0.75rem', color: '#28a745'}} className="fa-solid fa-lightbulb"></i> Genel İpuçları
                </h3>
                <ul style={{ paddingLeft: '20px', listStyleType: "'✓ '" }}>
                  {selectedProgram.tips.split('\n').filter(line => line.trim() !== '').map((tip, idx) => (
                    <li key={idx} style={{ paddingLeft: '10px', marginBottom: '0.75rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ padding: '1.5rem 2.5rem', background: 'var(--light-bg)', borderTop: '1px solid var(--border-color)', borderBottomLeftRadius: '0.8rem', borderBottomRightRadius: '0.8rem', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedProgram(null)}
                style={{padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', background: '#4ca175', color: 'white', marginRight: '0.5rem'}}
              >
                <i className="fa-solid fa-xmark"></i> Kapat
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(selectedProgram.id);
                  setSelectedProgram(null);
                }}
                style={{padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', background: '#dc2626', color: 'white'}}
              >
                <i className="fa-solid fa-trash"></i> Favorilerden Çıkar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ======================================================================
// BİLEŞEN 1: SubscriptionInfo (Abonelik Bilgileri)
// ======================================================================
function SubscriptionInfo({ profile, setProfile }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const { showToast } = useToastContext();

  // Helper for safe dates - Firebase Timestamp desteği ile
  const parseDate = (d) => {
    if (!d) return null;
    // Firebase Timestamp formatı (_seconds)
    if (typeof d === 'object' && d._seconds) {
      return new Date(d._seconds * 1000);
    }
    // String formatı
    if (typeof d === 'string') {
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    // Date objesi
    if (d instanceof Date) {
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    
    const end = parseDate(endDate);
    if (!end) return 0;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Saat farkını kaldır
    end.setHours(0, 0, 0, 0); // Saat farkını kaldır
    
    const difference = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 3600 * 24));
    
    return daysLeft > 0 ? daysLeft : 0;
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz? Bu işlemin sonunda mevcut planınızın tüm avantajlarını kaybedeceksiniz.")) {
      return;
    }
    setIsCancelling(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(getApiUrl("/api/profile/subscription"), {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İptal işlemi başarısız oldu.");
      setProfile(prev => ({ ...prev, subscription: data.subscription }));
      showToast(data.message, 'info');
    } catch (error) {
      showToast('İptal hatası: ' + error.message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!profile.subscription || profile.subscription.plan === 'free') {
    return (
      <section className="tab-section subscription-info-tab">
        <h2>Aktif Bir Aboneliğiniz Bulunmuyor</h2>
        <p>Tüm özelliklerden faydalanmak ve kişisel diyet asistanınıza erişmek için size en uygun planı seçin.</p>
        <Link to="/pricing" className="btn-link-to-pricing">Abonelik Planlarını İncele</Link>
      </section>
    );
  }

  // Güvenli tarih parsing
  const startDate = parseDate(profile.subscription.startDate) || new Date();
  const endDate = parseDate(profile.subscription.endDate) || new Date(new Date().setMonth(new Date().getMonth() + 1));
  
  const daysLeft = calculateDaysLeft(profile.subscription.endDate);
  const planName = profile.subscription.planName || profile.subscription.plan;
  const planPrice = profile.subscription.price || 0;
  const features = profile.subscription.features || [];
  
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const progressPercent = Math.min(100, Math.max(0, ((totalDays - Math.max(daysLeft, 0)) / totalDays) * 100));
   
  return (
    <section className="tab-section subscription-info-tab">
      <h2>💳 Abonelik Bilgilerim</h2>
      <div className="subscription-card">
        <div className={`plan-badge ${profile.subscription.plan}`}>{planName}</div>
        
        {/* Plan Bilgileri - Kompakt Düzen */}
        <div className="status-info">
          <p><strong>Durum:</strong><span className={`status-pill ${profile.subscription.status}`}>{profile.subscription.status === 'active' ? '✓ Aktif' : '⊘ Pasif'}</span></p>
          {planPrice > 0 && <p><strong>Aylık Ücret:</strong><span>₺{planPrice.toFixed(2)}</span></p>}
        </div>

        {/* Tarih Bilgileri - İki Sütun */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-dark)' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📅 Başlangıç Tarihi</p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{startDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📆 Yenileme Tarihi</p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{endDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* İlerleme Göstergesi */}
        <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Abonelik İlerlemesi</span>
            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(45, 212, 191, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(progressPercent, 100)}%`, height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Kalan Gün */}
        <div className="days-left-container">
          <div className="days-left-value">{daysLeft}</div>
          <div className="days-left-label">Gün Kaldı</div>
        </div>

        {/* Aksiyonlar */}
        <div className="subscription-actions">
          <button className="btn-action manage" onClick={() => showToast("İşlev yakında eklenecek! 🛠️", 'info')}>Aboneliği Yönet</button>
          <button className="btn-action cancel" onClick={handleCancelSubscription} disabled={isCancelling}>
            {isCancelling ? 'İptal Ediliyor...' : 'İptal Et'}
          </button>
        </div>
        
        {/* Dinamik plan özellikleri */}
        {features && features.length > 0 ? (
          <div className="subscription-features">
            <h3>✨ Plan Özellikleri</h3>
            <ul className="features-list">
              {features.map((feature, idx) => (
                <li key={idx}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <PlanFeatures plan={profile.subscription.plan} />
        )}
      </div>
    </section>
  );
}

// ======================================================================
// BİLEŞEN 2: AccessControl (Erişilebilir Özellikler)
// ======================================================================
function AccessControl({ profile }) {
  if (!profile?.subscription) {
    return null;
  }

  const planType = profile.subscription.plan;
  
  // Hiyerarşik özellikler - her plan öncekinin tümünü içerir
  const allFeatures = {
    free: [
      { name: "10+ Temel Diyet Programı", category: "Temel", icon: "📚" },
      { name: "BMI Hesaplama Aracı", category: "Araçlar", icon: "📏" },
      { name: "Kalori Tracker", category: "Takip", icon: "🔥" },
      { name: "Topluluk Forumları", category: "Sosyal", icon: "💬" },
      { name: "E-posta Desteği (24-48 saat)", category: "Destek", icon: "📧" },
      { name: "Beslenme İpuçları Bülteni", category: "İçerik", icon: "💡" }
    ],
    basic: [
      { name: "100+ Profesyonel Diyet Programı", category: "Temel", icon: "📚" },
      { name: "Kişiselleştirilmiş Beslenme Önerileri", category: "Danışmanlık", icon: "🎯" },
      { name: "Favori Programları Kaydetme & Takip", category: "Kişiselleştirme", icon: "❤️" },
      { name: "Detaylı Vücut Analizi & Grafikleri", category: "Analiz", icon: "📊" },
      { name: "Haftalık Beslenme Planı İndirme", category: "Planlama", icon: "📅" },
      { name: "Aylık İlerleme Raporu", category: "Raporlama", icon: "📈" },
      { name: "Email Desteği (12-24 saat)", category: "Destek", icon: "📧" }
    ],
    premium: [
      { name: "500+ Gelişmiş Diyet Programı", category: "Temel", icon: "📚" },
      { name: "Yapay Zeka Kişisel Danışmanı", category: "AI", icon: "🤖" },
      { name: "Yemek Tarifi Kütüphanesi & Özelleştirme", category: "Tarifler", icon: "👨‍🍳" },
      { name: "Beslenme İhtiyaçları Analiz & Optimizasyon", category: "Analiz", icon: "🔍" },
      { name: "Otomatik Beslenme Planı Oluşturma", category: "Otomasyonu", icon: "⚙️" },
      { name: "Makro Dengesi Takibi", category: "Takip", icon: "⚖️" },
      { name: "Alışkanlık Geliştirme Programları", category: "Motivasyon", icon: "🎯" },
      { name: "Canlı Sohbet Desteği (8-16:00)", category: "Destek", icon: "💬" },
      { name: "PDF/Excel Raporları İndirme", category: "Raporlama", icon: "📊" }
    ],
    plus: [
      { name: "1000+ Detaylı Diyet Programı", category: "Temel", icon: "📚" },
      { name: "Özel Beslenme Danışmanı (1-1 Konsültasyon)", category: "Danışmanlık", icon: "👨‍⚕️" },
      { name: "Aylık 2 Saat Konsültasyon Hakkı", category: "Danışmanlık", icon: "⏱️" },
      { name: "Kişiye Özel Keto, Vegan, Gluten-Free Planları", category: "Özelleştirme", icon: "🌱" },
      { name: "Fitness & Spor Yönetimine Entegreli Planlar", category: "Spor", icon: "💪" },
      { name: "Yaş, Cinsiyet & Hedef Bazlı Antrenman", category: "Spor", icon: "🏃" },
      { name: "Özel Beslenme Protokolleri (Keto, Bulk vb)", category: "Danışmanlık", icon: "🔬" },
      { name: "Sınırsız Beslenme Uygulaması Özelleştirmesi", category: "Özelleştirme", icon: "🎨" },
      { name: "Öncelikli Canlı Sohbet (07:00-22:00)", category: "Destek", icon: "💬" },
      { name: "Telefon Desteği", category: "Destek", icon: "📞" },
      { name: "Ay Sonu Profesyonel Değerlendirme Raporu", category: "Raporlama", icon: "📄" },
      { name: "Özel Yemek Listesi Oluşturma Hizmeti", category: "Hizmetler", icon: "🍽️" }
    ]
  };

  const planInfo = {
    free: {
      title: "Ücretsiz Plan - Erişilebilir Özellikler",
      icon: "🔓",
      color: "#64748b"
    },
    basic: {
      title: "Temel Plan - Erişilebilir Özellikler",
      icon: "⭐",
      color: "#3b82f6"
    },
    premium: {
      title: "Premium Plan - Erişilebilir Özellikler",
      icon: "👑",
      color: "#8b5cf6"
    },
    plus: {
      title: "Profesyonel Plus+ - Erişilebilir Özellikler",
      icon: "💎",
      color: "#ec4899"
    }
  };

  const features = allFeatures[planType] || [];
  const info = planInfo[planType];

  if (!info) return null;

  // Özellikleri kategoriye göre grupla
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});

  return (
    <section className="tab-section access-control-tab">
      <h2>{info.icon} {info.title}</h2>
      <div className="access-control-intro">
        <p>Seçtiğiniz plan ile aşağıdaki özelliklere erişim sağlayabilirsiniz:</p>
      </div>
      
      <div className="features-by-category">
        {Object.entries(groupedFeatures).map(([category, items]) => (
          <div key={category} className="feature-category">
            <h4 className="category-title">{category}</h4>
            <div className="feature-items">
              {items.map((feature, idx) => (
                <div key={idx} className="feature-item enabled">
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-check">✓</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceHub({ profile }) {
  const plan = profile?.subscription?.plan || "free";

  const serviceLinks = [
    { to: "/nutrition-recommendations", title: "🥗 Kişiselleştirilmiş Beslenme Önerileri", desc: "Yemek analizinize dayalı kişisel öneriler", requiredPlan: "basic" },
    { to: "/favorites-tracking", title: "Favori Programları Kaydet & Takip", desc: "Favorilerinizi yönetin ve takip edin", requiredPlan: "basic" },
    { to: "/body-analysis", title: "Detaylı Vücut Analizi", desc: "Ölçümlerinizi ve BMI bilgilerinizi görün", requiredPlan: "basic" },
    { to: "/monthly-progress", title: "Aylık İlerleme Raporu", desc: "Aylık özet ve grafikler (demo)", requiredPlan: "basic" },
    { to: "/ai-consultant", title: "Yapay Zeka Beslenme Danışmanı", desc: "Premium AI destekli öneriler", requiredPlan: "premium" },
    { to: "/recipes", title: "Tarif Kütüphanesi & Özelleştirme", desc: "Premium tarif erişimi", requiredPlan: "premium" },
    { to: "/nutrition-optimization", title: "Beslenme İhtiyaç Analizi", desc: "Makro/mikro optimizasyonu", requiredPlan: "premium" },
    { to: "/auto-meal-plan", title: "Otomatik Beslenme Planı", desc: "Haftalık otomatik plan", requiredPlan: "premium" },
    { to: "/macro-tracking", title: "Makro Dengesi Takibi", desc: "Protein/yağ/karbonhidrat takibi", requiredPlan: "premium" },
    { to: "/habit-builder", title: "Alışkanlık Geliştirme", desc: "Hedef ve alışkanlık takibi", requiredPlan: "premium" },
    { to: "/live-chat", title: "Canlı Sohbet Desteği", desc: "08-16 arası sohbet (demo)", requiredPlan: "premium" },
    { to: "/reports-download", title: "PDF/Excel Raporları", desc: "Rapor indir (demo)", requiredPlan: "premium" },
  ];

  if (!profile?.subscription || plan === "free") {
    return (
      <section className="tab-section service-hub">
        <h2>Hizmetler</h2>
        <p>Planınıza özel hizmetler için abonelik satın alın.</p>
        <Link to="/pricing" className="btn-link-to-pricing">Planları İncele</Link>
      </section>
    );
  }

  return (
    <section className="tab-section service-hub">
      <h2>Planınıza Dahil Hizmetler</h2>
      <div className="service-grid">
        {serviceLinks.filter(link => hasPlanAccess(plan, link.requiredPlan)).map(link => (
          <Link key={link.to} to={link.to} className="service-card-lite">
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
            <span className="service-cta">Görüntüle →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const [user, loadingUser, authError] = useAuthState(auth);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({ 
    name: "", 
    surname: "", 
    email: "", 
    height: "", 
    weight: "", 
    targetWeight: "", 
    gender: "female",
    // Sağlık Bilgileri
    allergies: "",
    isDiabetic: false,
    diabeticType: "", // Type 1, Type 2, Prediabetic
    isHypertensive: false,
    bloodPressure: "",
    hasHeartDisease: false,
    hasKidneyDisease: false,
    hasLiverDisease: false,
    hasThyroidDisease: false,
    otherDiseases: "",
    medications: "",
    dietaryRestrictions: "", // vegan, vegetarian, keto, gluten-free, etc.
    activityLevel: "moderate" // sedentary, light, moderate, active, very active
  });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(getApiUrl("/api/profile"), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Profil verileri alınamadı.");
        const data = await res.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          surname: data.surname || "",
          email: data.email || "",
          height: data.height || "",
          weight: data.weight || "",
          targetWeight: data.targetWeight || "",
          gender: data.gender || "female",
          // Sağlık Bilgileri
          allergies: data.allergies || "",
          isDiabetic: data.isDiabetic || false,
          diabeticType: data.diabeticType || "",
          isHypertensive: data.isHypertensive || false,
          bloodPressure: data.bloodPressure || "",
          hasHeartDisease: data.hasHeartDisease || false,
          hasKidneyDisease: data.hasKidneyDisease || false,
          hasLiverDisease: data.hasLiverDisease || false,
          hasThyroidDisease: data.hasThyroidDisease || false,
          otherDiseases: data.otherDiseases || "",
          medications: data.medications || "",
          dietaryRestrictions: data.dietaryRestrictions || "",
          activityLevel: data.activityLevel || "moderate"
        });
      } catch (error) {
        setMsg("Profil yüklenirken bir hata oluştu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [user, loadingUser, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      setMsg("Kaydediliyor...");
      const res = await fetch(getApiUrl('/api/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Güncelleme başarısız.");
      setMsg("Profil başarıyla güncellendi!");
      setProfile(prev => ({ ...prev, ...form }));
    } catch (error) {
      setMsg("Profil güncellenirken bir hata oluştu.");
    } finally {
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const toggleFavorite = async (pid) => {
    if (!profile || !user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { favoritePrograms: arrayRemove(pid) });
      
      setProfile(prev => ({ ...prev, favoritePrograms: prev.favoritePrograms.filter(id => id !== pid) }));
      
      setMsg("Program favorilerden çıkarıldı.");
      setTimeout(() => setMsg(""), 2000);
    } catch (error) {
      setMsg("İşlem sırasında bir hata oluştu.");
    }
  };

  const analysis = useMemo(() => {
    const heightM = form.height / 100;
    const bmi = form.weight && heightM ? (form.weight / (heightM ** 2)).toFixed(1) : null;
    let bmiStatus = "";
    if (bmi) {
      if (bmi < 18.5) bmiStatus = "Zayıf";
      else if (bmi < 25) bmiStatus = "Normal";
      else if (bmi < 30) bmiStatus = "Fazla Kilolu";
      else bmiStatus = "Obez";
    }
    const heightInch = form.height / 2.54;
    const idealWeight = form.gender === "male" ? (50 + 2.3 * (heightInch - 60)).toFixed(1) : (45.5 + 2.3 * (heightInch - 60)).toFixed(1);
    const diff = form.weight && idealWeight ? (form.weight - idealWeight).toFixed(1) : null;
    return { bmi, bmiStatus, idealWeight, diff };
  }, [form.height, form.weight, form.gender]);


  if (isLoading || loadingUser) return <div className="loading">Yükleniyor…</div>;
  if (authError) return <div>Hata: {authError.message}</div>;
  if (!profile) return (
    <div className="register-prompt-container">
      <h2>🥳 Aramıza Hoş Geldin!</h2>
      <p>Profilini oluşturmak ve sana özel planları görmek için hemen ücretsiz hesabını oluştur.</p>
      <Link to="/register" className="btn btn-primary btn-large">Hemen Kayıt Ol</Link>
    </div>
  );
  
  const plan = profile?.subscription?.plan || "free";

  const baseLinks = [
    { key: "info", label: "Profil Bilgileri", type: "tab" },
    { key: "subscription", label: "Aboneliğim", type: "tab" },
    { key: "diet", label: "Favori Programlarım", type: "tab" },
    { key: "dietitian", label: "🏥 Diyetisyenim", type: "tab" },
    { key: "request", label: "Geri Bildirim & Talep", type: "tab" },
    { key: "community", label: "Topluluk Forumları", to: "/community", type: "route" },
    ...FREE_FEATURES,
  ];

  const serviceLinks = [
    // TEMEL PLAN (Basic)
    { key: "svc-nutrition-recommendations", label: "🥗 Kişiselleştirilmiş Beslenme Önerileri", to: "/nutrition-recommendations", requiredPlan: "basic", type: "route" },
    { key: "svc-favorites-tracking", label: "Favori Programları Kaydetme ve Takip Etme", to: "/favorites-tracking", requiredPlan: "basic", type: "route" },
    { key: "svc-body-analysis", label: "Detaylı Vücut Analizi ve Grafikleri", to: "/body-analysis", requiredPlan: "basic", type: "route" },
    { key: "svc-monthly-progress", label: "Aylık İlerleme Raporu", to: "/monthly-progress", requiredPlan: "basic", type: "route" },
    // PREMIUM PLAN
    { key: "svc-ai-consultant", label: "Yapay Zeka Destekli Kişisel Beslenme Danışmanı", to: "/ai-consultant", requiredPlan: "premium", type: "route" },
    { key: "svc-recipes", label: "Yemek Tariflerine Erişim ve Özelleştirme", to: "/recipes", requiredPlan: "premium", type: "route" },
    { key: "svc-nutrition-opt", label: "Beslenme İhtiyaçları Analiz ve Optimizasyon", to: "/nutrition-optimization", requiredPlan: "premium", type: "route" },
    { key: "svc-auto-meal", label: "Haftalık Otomatik Beslenme Planı Oluşturma", to: "/auto-meal-plan", requiredPlan: "premium", type: "route" },
    { key: "svc-macro-track", label: "Makro Dengesi Takibi (Protein, Yağ, Karbonhidrat)", to: "/macro-tracking", requiredPlan: "premium", type: "route" },
    { key: "svc-habit-builder", label: "Alışkanlık Geliştirme Programları", to: "/habit-builder", requiredPlan: "premium", type: "route" },
    { key: "svc-live-chat", label: "Canlı Sohbet Desteği (8-16:00, Pazartesi-Cuma)", to: "/live-chat", requiredPlan: "premium", type: "route" },
    { key: "svc-reports", label: "PDF/Excel Raporlarını İndirme", to: "/reports-download", requiredPlan: "premium", type: "route" },
    // PROFESYONEL PLUS+
    { key: "svc-thousand-programs", label: "1000+ Detaylı Diyet Programı", to: "/thousand-programs", requiredPlan: "plus", type: "route" },
    { key: "svc-plus-consult", label: "Özel Beslenme Danışmanı ile 1-1 Konsultasyon (Aylık 2 Saat)", to: "/plus-consultation", requiredPlan: "plus", type: "route" },
    { key: "svc-keto-vegan", label: "Kişiye Özel Keto, Vegan, Gluten-Free Planları", to: "/keto-vegan-plans", requiredPlan: "plus", type: "route" },
    { key: "svc-fitness", label: "Fitness ve Spor Yönetimine Entegreli Planlar", to: "/fitness-integration", requiredPlan: "plus", type: "route" },
    { key: "svc-training", label: "Yaş, Cinsiyet ve Hedef Bazlı Antrenman Rehberleri", to: "/training-guides", requiredPlan: "plus", type: "route" },
    { key: "svc-protocols", label: "Özel Beslenme Protokolleri (Yenileme, Bulk vb)", to: "/special-protocols", requiredPlan: "plus", type: "route" },
    { key: "svc-customization", label: "Beslenme Uygulamasında Sınırsız Özelleştirme", to: "/unlimited-customization", requiredPlan: "plus", type: "route" },
    { key: "svc-priority-chat", label: "Öncelikli Canlı Sohbet Desteği (07:00-22:00, Günlük)", to: "/priority-chat", requiredPlan: "plus", type: "route" },
    { key: "svc-phone", label: "Telefon Desteği", to: "/phone-support", requiredPlan: "plus", type: "route" },
    { key: "svc-pro-report", label: "Ay Sonu Profesyonel Değerlendirme Raporu", to: "/monthly-pro-report", requiredPlan: "plus", type: "route" },
    { key: "svc-meal-service", label: "Özel Yemek Listesi Oluşturma Hizmeti", to: "/custom-meal-service", requiredPlan: "plus", type: "route" },
  ];

  const visibleServices = serviceLinks.filter((l) => hasPlanAccess(plan, l.requiredPlan));
  const sidebarLinks = [...baseLinks, ...visibleServices];
  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <ul>
          {sidebarLinks.map(link => (
            <li
              key={link.key}
              className={link.type === "tab" && tab === link.key ? "active" : ""}
              onClick={link.type === "tab" ? () => setTab(link.key) : undefined}
            >
              {link.type === "route" ? (
                <Link to={link.to}>{link.label}</Link>
              ) : (
                link.label
              )}
            </li>
          ))}
          <li onClick={async () => { await auth.signOut(); navigate("/"); }}>Çıkış Yap</li>
        </ul>
      </aside>

      <main className="profile-content">
        {msg && <p className={`status-msg ${msg.includes('Hata') ? 'error' : ''}`}>{msg}</p>}

        {tab === "info" && (
            <form className="tab-section info-tab" onSubmit={handleSave}>
              <h2>Profil Bilgileri</h2>
              
              {/* Kişisel Bilgiler */}
              <div className="form-section">
                <h3>👤 Kişisel Bilgiler</h3>
                <div className="info-form-grid">
                  <div className="form-group"><label>Ad</label><input type="text" name="name" value={form.name} onChange={handleChange} /></div>
                  <div className="form-group"><label>Soyad</label><input type="text" name="surname" value={form.surname} onChange={handleChange} /></div>
                  <div className="form-group full-width"><label>E-posta</label><input type="email" name="email" value={form.email} disabled /></div>
                  <div className="form-group"><label>Cinsiyet</label><select name="gender" value={form.gender} onChange={handleChange}><option value="female">Kadın</option><option value="male">Erkek</option></select></div>
                  <div className="form-group"><label>Boy (cm)</label><input type="number" name="height" value={form.height} onChange={handleChange} /></div>
                  <div className="form-group"><label>Kilo (kg)</label><input type="number" name="weight" value={form.weight} onChange={handleChange} /></div>
                  <div className="form-group"><label>Hedef Kilo (kg)</label><input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} /></div>
                  <div className="form-group"><label>Aktivite Seviyesi</label><select name="activityLevel" value={form.activityLevel} onChange={handleChange}>
                    <option value="sedentary">Hareketsiz</option>
                    <option value="light">Hafif</option>
                    <option value="moderate">Orta</option>
                    <option value="active">Aktif</option>
                    <option value="very active">Çok Aktif</option>
                  </select></div>
                </div>
              </div>

              {/* Sağlık Bilgileri */}
              <div className="form-section health-section">
                <h3>🏥 Sağlık Bilgileri</h3>
                <p className="section-note">Bu bilgiler, size uygun beslenme önerileri sunabilmemiz için gereklidir. Tüm bilgiler gizli tutulur.</p>
                
                {/* Alerjiler */}
                <div className="form-group full-width">
                  <label>Alerji ve Gıda İntoleransı *</label>
                  <textarea 
                    name="allergies" 
                    value={form.allergies} 
                    onChange={handleChange}
                    placeholder="Örnek: Süt alerjisi, fistık alerjisi, gluten intoleransı, vb..."
                    rows="3"
                  />
                </div>

                {/* Beslenme Kısıtlamaları */}
                <div className="form-group full-width">
                  <label>Beslenme Tercihleri ve Kısıtlamalar</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="veggie-vegan" 
                        checked={form.dietaryRestrictions?.includes('vegan')} 
                        onChange={(e) => {
                          const restrictions = form.dietaryRestrictions || '';
                          const isChecked = e.target.checked;
                          const updated = isChecked 
                            ? restrictions + (restrictions ? ', vegan' : 'vegan')
                            : restrictions.replace(', vegan', '').replace('vegan', '');
                          setForm(prev => ({ ...prev, dietaryRestrictions: updated }));
                        }}
                      />
                      Vegan
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={form.dietaryRestrictions?.includes('vegetarian')} 
                        onChange={(e) => {
                          const restrictions = form.dietaryRestrictions || '';
                          const isChecked = e.target.checked;
                          const updated = isChecked 
                            ? restrictions + (restrictions ? ', vegetarian' : 'vegetarian')
                            : restrictions.replace(', vegetarian', '').replace('vegetarian', '');
                          setForm(prev => ({ ...prev, dietaryRestrictions: updated }));
                        }}
                      />
                      Vejetaryen
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={form.dietaryRestrictions?.includes('keto')} 
                        onChange={(e) => {
                          const restrictions = form.dietaryRestrictions || '';
                          const isChecked = e.target.checked;
                          const updated = isChecked 
                            ? restrictions + (restrictions ? ', keto' : 'keto')
                            : restrictions.replace(', keto', '').replace('keto', '');
                          setForm(prev => ({ ...prev, dietaryRestrictions: updated }));
                        }}
                      />
                      Keto
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={form.dietaryRestrictions?.includes('gluten-free')} 
                        onChange={(e) => {
                          const restrictions = form.dietaryRestrictions || '';
                          const isChecked = e.target.checked;
                          const updated = isChecked 
                            ? restrictions + (restrictions ? ', gluten-free' : 'gluten-free')
                            : restrictions.replace(', gluten-free', '').replace('gluten-free', '');
                          setForm(prev => ({ ...prev, dietaryRestrictions: updated }));
                        }}
                      />
                      Glutensiz
                    </label>
                  </div>
                </div>

                {/* Diyabet Bilgisi */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="isDiabetic" 
                      checked={form.isDiabetic} 
                      onChange={(e) => setForm(prev => ({ ...prev, isDiabetic: e.target.checked, diabeticType: "" }))}
                    />
                    <strong>Diyabet hastasıyım</strong>
                  </label>
                </div>

                {form.isDiabetic && (
                  <div className="form-group full-width nested-group">
                    <label>Diyabet Türü *</label>
                    <select 
                      name="diabeticType" 
                      value={form.diabeticType} 
                      onChange={handleChange}
                      required={form.isDiabetic}
                    >
                      <option value="">-- Seçin --</option>
                      <option value="type1">Tip 1 Diyabet</option>
                      <option value="type2">Tip 2 Diyabet</option>
                      <option value="prediabetic">Prediabetik</option>
                      <option value="gestational">Gestasyonel Diyabet</option>
                    </select>
                    <p className="info-text">💡 <strong>Tip 1:</strong> Pankreas insülin üretmiyor. <strong>Tip 2:</strong> Vücut insülini verimli kullanmıyor.</p>
                  </div>
                )}

                {/* Tansiyon Bilgisi */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="isHypertensive" 
                      checked={form.isHypertensive} 
                      onChange={(e) => setForm(prev => ({ ...prev, isHypertensive: e.target.checked, bloodPressure: "" }))}
                    />
                    <strong>Hipertansiyon (Yüksek Tansiyon) hastasıyım</strong>
                  </label>
                </div>

                {form.isHypertensive && (
                  <div className="form-group full-width nested-group">
                    <label>Kan Basıncı Ölçümü (Sistol/Diyastol)</label>
                    <input 
                      type="text" 
                      name="bloodPressure" 
                      value={form.bloodPressure} 
                      onChange={handleChange}
                      placeholder="Örnek: 140/90"
                    />
                  </div>
                )}

                {/* Kalp Hastalığı */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="hasHeartDisease" 
                      checked={form.hasHeartDisease} 
                      onChange={(e) => setForm(prev => ({ ...prev, hasHeartDisease: e.target.checked }))}
                    />
                    <strong>Kalp hastalığım var</strong>
                  </label>
                </div>

                {/* Böbrek Hastalığı */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="hasKidneyDisease" 
                      checked={form.hasKidneyDisease} 
                      onChange={(e) => setForm(prev => ({ ...prev, hasKidneyDisease: e.target.checked }))}
                    />
                    <strong>Böbrek hastalığım var</strong>
                  </label>
                </div>

                {/* Karaciğer Hastalığı */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="hasLiverDisease" 
                      checked={form.hasLiverDisease} 
                      onChange={(e) => setForm(prev => ({ ...prev, hasLiverDisease: e.target.checked }))}
                    />
                    <strong>Karaciğer hastalığım var</strong>
                  </label>
                </div>

                {/* Tiroid Hastalığı */}
                <div className="form-group full-width">
                  <label className="checkbox-label checkbox-large">
                    <input 
                      type="checkbox" 
                      name="hasThyroidDisease" 
                      checked={form.hasThyroidDisease} 
                      onChange={(e) => setForm(prev => ({ ...prev, hasThyroidDisease: e.target.checked }))}
                    />
                    <strong>Tiroid hastalığım var</strong>
                  </label>
                </div>

                {/* Diğer Hastalıklar */}
                <div className="form-group full-width">
                  <label>Diğer Hastalıklar veya Durumlar</label>
                  <textarea 
                    name="otherDiseases" 
                    value={form.otherDiseases} 
                    onChange={handleChange}
                    placeholder="Örnek: Artrit, KOAH, GIS rahatsızlığı, vb..."
                    rows="3"
                  />
                </div>

                {/* Kullanılan İlaçlar */}
                <div className="form-group full-width">
                  <label>Kullanılan İlaçlar</label>
                  <textarea 
                    name="medications" 
                    value={form.medications} 
                    onChange={handleChange}
                    placeholder="Örnek: Metformin 500mg 2x günde, Amlodipine 5mg günde 1x, vb..."
                    rows="3"
                  />
                </div>
              </div>

              <button type="submit" className="btn-save-profile">Değişiklikleri Kaydet</button>
              {analysis.bmi && (
                <div className="analysis-box">
                  <h3>📊 Vücut Analizi</h3>
                  <p><strong>BMI:</strong> {analysis.bmi} ({analysis.bmiStatus})</p>
                  <p><strong>İdeal Kilo:</strong> {analysis.idealWeight} kg</p>
                  <p><strong>Kilo Farkı:</strong> {analysis.diff > 0 ? `${analysis.diff} kg fazlanız var` : analysis.diff < 0 ? `${Math.abs(analysis.diff)} kg eksiksiniz` : "İdeal kilodasınız."}</p>
                </div>
              )}
            </form>
        )}

        {tab === "diet" && (
          <FavoritesTrackingTab profile={profile} />
        )}

        {tab === "dietitian" && (
          <MyDietitianTab profile={profile} />
        )}

        {tab === "subscription" && ( <SubscriptionInfo profile={profile} setProfile={setProfile} /> )}
        {tab === "request" && ( <ServiceRequest /> )}
      </main>
    </div>
  );
}
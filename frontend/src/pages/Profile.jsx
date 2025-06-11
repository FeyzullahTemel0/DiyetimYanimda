import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import ServiceRequest from "../components/ServiceRequest"; 
import "./Profile.css"; 
import Modal from "../components/Modal";
import AiAssistant from "../components/AiAssistant"; 

// ======================================================================
// BİLEŞEN 1: SubscriptionInfo (Abonelik Bilgileri)
// ======================================================================
function SubscriptionInfo({ profile, setProfile }) {
  const [isCancelling, setIsCancelling] = useState(false);

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 3600 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getPlanName = (planId) => {
    switch (planId) {
      case 'basic': return 'Temel Plan';
      case 'premium': return 'Premium AI';
      case 'plus': return 'Profesyonel Plus+';
      default: return 'Ücretsiz Plan';
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz? Bu işlemin sonunda mevcut planınızın tüm avantajlarını kaybedeceksiniz.")) {
      return;
    }
    setIsCancelling(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/profile/subscription", {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İptal işlemi başarısız oldu.");
      setProfile(prev => ({ ...prev, subscription: data.subscription }));
      alert(data.message);
    } catch (error) {
      alert("Hata: " + error.message);
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

  const daysLeft = calculateDaysLeft(profile.subscription.endDate);
  const planName = getPlanName(profile.subscription.plan);
   
  return (
    <section className="tab-section subscription-info-tab">
      <h2>Abonelik Bilgilerim</h2>
      <div className="subscription-card">
        <div className={`plan-badge ${profile.subscription.plan}`}>{planName}</div>
        <div className="status-info">
          <p><strong>Durum:</strong><span className={`status-pill ${profile.subscription.status}`}>{profile.subscription.status === 'active' ? 'Aktif' : 'Pasif'}</span></p>
          <p><strong>Başlangıç Tarihi:</strong><span>{new Date(profile.subscription.startDate).toLocaleDateString('tr-TR')}</span></p>
          <p><strong>Yenileme Tarihi:</strong><span>{new Date(profile.subscription.endDate).toLocaleDateString('tr-TR')}</span></p>
        </div>
        <div className="days-left-container">
          <div className="days-left-value">{daysLeft}</div>
          <div className="days-left-label">Gün Kaldı</div>
        </div>
        <div className="subscription-actions">
          <button className="btn-action manage" onClick={() => alert("Abonelik yönetimi özelliği yakında!")}>Aboneliği Yönet</button>
          <button className="btn-action cancel" onClick={handleCancelSubscription} disabled={isCancelling}>
            {isCancelling ? 'İptal Ediliyor...' : 'İptal Et'}
          </button>
        </div>
      </div>
    </section>
  );
}

// ======================================================================
// BİLEŞEN 2: AiAssistant (Sohbet Arayüzü)
// ======================================================================
// (Removed duplicate AiAssistant component definition)


// ======================================================================
// ANA PROFİL BİLEŞENİ
// ======================================================================
export default function Profile() {
  const [user, loadingUser, authError] = useAuthState(auth);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({ name: "", surname: "", email: "", height: "", weight: "", targetWeight: "", gender: "female" });
  const [msg, setMsg] = useState("");
  const [favoriteDetails, setFavoriteDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

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
        const res = await fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } });
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
        });

        if (data.favoritePrograms && data.favoritePrograms.length > 0) {
          const url = new URL("http://localhost:5000/api/diet-programs");
          const prRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!prRes.ok) throw new Error("Favori program detayları yüklenemedi.");
          const allPrograms = await prRes.json();
          const favDetails = allPrograms.filter(p => data.favoritePrograms.includes(p.id));
          setFavoriteDetails(favDetails);
        } else {
          setFavoriteDetails([]);
        }
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
      const res = await fetch(`http://localhost:5000/api/profile`, {
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
      setFavoriteDetails(prev => prev.filter(p => p.id !== pid));
      
      closeModal();
      
      setMsg("Program favorilerden çıkarıldı.");
      setTimeout(() => setMsg(""), 2000);
    } catch (error) {
      setMsg("İşlem sırasında bir hata oluştu.");
      closeModal();
    }
  };

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
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
  
  const sidebarLinks = [
    { key: "info", label: "Profil Bilgileri" },
    { key: "subscription", label: "Aboneliğim" },
    { key: "diet", label: "Favori Programlarım" },
    { key: "assistant", label: "Diyet Asistanım" },
    { key: "request", label: "Geri Bildirim & Talep"},
  ];
  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <ul>
          {sidebarLinks.map(link => (
            <li key={link.key} className={tab === link.key ? "active" : ""} onClick={() => setTab(link.key)}>
              {link.label}
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
              <div className="info-form-grid">
                <div className="form-group"><label>Ad</label><input type="text" name="name" value={form.name} onChange={handleChange} /></div>
                <div className="form-group"><label>Soyad</label><input type="text" name="surname" value={form.surname} onChange={handleChange} /></div>
                <div className="form-group full-width"><label>E-posta</label><input type="email" name="email" value={form.email} disabled /></div>
                <div className="form-group"><label>Cinsiyet</label><select name="gender" value={form.gender} onChange={handleChange}><option value="female">Kadın</option><option value="male">Erkek</option></select></div>
                <div className="form-group"><label>Boy (cm)</label><input type="number" name="height" value={form.height} onChange={handleChange} /></div>
                <div className="form-group"><label>Kilo (kg)</label><input type="number" name="weight" value={form.weight} onChange={handleChange} /></div>
                <div className="form-group"><label>Hedef Kilo (kg)</label><input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} /></div>
              </div>
              <button type="submit">Değişiklikleri Kaydet</button>
              {analysis.bmi && (
                <div className="analysis-box">
                  <h3>Vücut Analizi</h3>
                  <p><strong>BMI:</strong> {analysis.bmi} ({analysis.bmiStatus})</p>
                  <p><strong>İdeal Kilo:</strong> {analysis.idealWeight} kg</p>
                  <p><strong>Kilo Farkı:</strong> {analysis.diff > 0 ? `${analysis.diff} kg fazlanız var` : analysis.diff < 0 ? `${Math.abs(analysis.diff)} kg eksiksiniz` : "İdeal kilodasınız."}</p>
                </div>
              )}
            </form>
        )}

        {tab === "diet" && (
          <section className="tab-section diet-tab">
            <h2>Favori Programlarım</h2>
            {favoriteDetails.length === 0 ? (
              <p>Henüz favori olarak işaretlediğiniz bir program bulunmuyor.</p>
            ) : (
              <div className="program-cards">
                {favoriteDetails.map(p => (
                  <div key={p.id} className="program-card" onClick={() => handleProgramClick(p)}>
                    <h3>{p.title}</h3>
                    <p className="description">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "subscription" && ( <SubscriptionInfo profile={profile} setProfile={setProfile} /> )}
        {tab === "assistant" && ( <AiAssistant profile={profile} /> )}
        {tab === "request" && ( <ServiceRequest /> )}
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedProgram && (
          <div className="program-details-modal">
            <h2 className="title-modal">{selectedProgram.title}</h2>

            <div className="program-meta-grid">
              <div className="meta-item">
                <strong>Erişim Seviyesi</strong>
                <span className={`access-level ${selectedProgram.accessLevel}`}>
                  {selectedProgram.accessLevel === 'free' ? 'Ücretsiz' : 'Premium'}
                </span>
              </div>
              <div className="meta-item">
                <strong>Hedef Cinsiyet</strong>
                <span>{selectedProgram.gender === 'female' ? 'Kadın' : 'Erkek'}</span>
              </div>
              <div className="meta-item">
                <strong>Günlük Kalori</strong>
                <span>~{selectedProgram.calories} kcal</span>
              </div>
            </div>
            
            <p className="program-description">{selectedProgram.description}</p>
            
            {selectedProgram.macros && (
              <div className="program-section">
                <h3>Makro Dağılımı</h3>
                <ul className="macro-list">
                  <li>Karbonhidrat: <span>{selectedProgram.macros.carbPercent}%</span></li>
                  <li>Yağ: <span>{selectedProgram.macros.fatPercent}%</span></li>
                  <li>Protein: <span>{selectedProgram.macros.proteinPercent}%</span></li>
                </ul>
              </div>
            )}

            {selectedProgram.weeklyMenu && (
              <div className="program-section">
                  <h3>Haftalık Menü Örneği</h3>
                  <pre className="weekly-menu-content">{selectedProgram.weeklyMenu}</pre>
              </div>
            )}
            
            {selectedProgram.tips && (
               <div className="program-section">
                  <h3>İpuçları ve Öneriler</h3>
                  {/* GÜNCELLEME: İpuçları da menü ile aynı stile sahip olması için className eklendi */}
                  <p className="program-content-box">{selectedProgram.tips}</p>
               </div>
            )}

            <div className="modal-actions">
                <button 
                  className="btn-remove-favorite" 
                  onClick={() => toggleFavorite(selectedProgram.id)}
                >
                  Favorilerden Çıkar
                </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
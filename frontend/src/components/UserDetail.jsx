// frontend/src/components/UserDetail.jsx

import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToastContext } from "../contexts/ToastContext";
import "./UserDetail.css";

const Notification = ({ message, type }) => {
  if (!message) return null;
  return <div className={`detail-notification ${type}`}>{message}</div>;
};

export default function UserDetail({ uid, onBack }) {
  const [user, setUser] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [giftPlan, setGiftPlan] = useState("");
  const [giftDuration, setGiftDuration] = useState(1);
  const { showToast } = useToastContext();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    height: "",
    weight: "",
    targetWeight: "",
    gender: "not_specified",
    role: "user",
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);

  const formatDate = (dateStr) => {
    try {
      // Firebase Timestamp formatı
      if (dateStr && typeof dateStr === 'object' && dateStr._seconds) {
        return new Date(dateStr._seconds * 1000).toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      // String veya Date formatı
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Belirtilmemiş';
      return date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Belirtilmemiş';
    }
  };

  const mealTypeLabel = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle',
    dinner: 'Akşam',
    snack: 'Ara Öğün',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          setLoading(true);
          const token = await currentUser.getIdToken();
          
          // Fiyatlandırma verilerini Firestore'dan çek
          const pricingRes = await fetch("http://localhost:5000/api/pricing", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pricingRes.ok) {
            const pricingData = await pricingRes.json();
            setPricing(pricingData);
            // İlk planı varsayılan olarak seç
            if (pricingData.length > 0) {
              setGiftPlan(pricingData[0].planId || 'free');
            }
          }

          const res = await fetch(`http://localhost:5000/api/admin/users/${uid}/full`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error(`Kullanıcı verisi alınamadı (HTTP ${res.status})`);

          const data = await res.json();
          const profile = { ...data.profile, email: data.auth?.email, uid: uid, role: data.profile?.role || 'user' };
          setUser(profile);
          setFullData(data);
          
          setForm({
            name: profile.name || "",
            surname: profile.surname || "",
            email: profile.email || "",
            height: profile.height || "",
            weight: profile.weight || "",
            targetWeight: profile.targetWeight || "",
            gender: profile.gender || "not_specified",
            role: profile.role || "user",
          });
          
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError("Yetkilendirme başarısız.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setMsg({ text: '', type: '' });
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız oldu.");

      setUser(prevUser => ({ ...prevUser, ...form }));
      setMsg({ text: data.message, type: 'success' });
    } catch (err) {
      setMsg({ text: `Hata: ${err.message}`, type: 'error' });
    }
  };

  const handleSubscriptionAction = async (action) => {
    if (!auth.currentUser) return;
    setMsg({ text: '', type: '' });
    try {
      const token = await auth.currentUser.getIdToken();
      const duration = Number(giftDuration) > 0 ? Number(giftDuration) : 1;
      const body = action === 'gift' ? {
        plan: giftPlan,
        planName: pricing.find(p => p.planId === giftPlan)?.planName || giftPlan,
        durationMonths: duration,
      } : undefined;
      const res = await fetch(`http://localhost:5000/api/admin/users/${uid}/subscription/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız oldu.');

      // update state with latest subscription info
      setFullData(prev => ({ ...(prev || {}), subscription: data.subscription }));
      setMsg({ text: data.message, type: 'success' });
    } catch (err) {
      setMsg({ text: `Hata: ${err.message}`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message + ' 🗑️', 'success');
        onBack();
      } else {
        throw new Error(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      showToast('Silme hatası: ' + err.message, 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: 'Şifreler eşleşmiyor!', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMsg({ text: 'Şifre en az 6 karakter olmalıdır!', type: 'error' });
      return;
    }

    setMsg({ text: '', type: '' });
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${uid}/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Şifre güncellenemedi.");

      setMsg({ text: '✅ Kullanıcı şifresi başarıyla güncellendi!', type: 'success' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      setMsg({ text: `Hata: ${err.message}`, type: 'error' });
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setMsg({ text: 'Geçerli bir email adresi girin!', type: 'error' });
      return;
    }

    setMsg({ text: '', type: '' });
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${uid}/update-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail: emailForm.newEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Email güncellenemedi.");

      setMsg({ text: '✅ Kullanıcı email adresi başarıyla güncellendi!', type: 'success' });
      setUser(prev => ({ ...prev, email: data.newEmail }));
      setForm(prev => ({ ...prev, email: data.newEmail }));
      setEmailForm({ newEmail: '' });
      setShowEmailSection(false);
    } catch (err) {
      setMsg({ text: `Hata: ${err.message}`, type: 'error' });
    }
  };

  if (loading) return <div className="detail-message">Kullanıcı detayları yükleniyor...</div>;
  if (error) return <div className="detail-message error">{error}</div>;
  if (!user) return <div className="detail-message">Kullanıcı bulunamadı.</div>;

  const subscription = fullData?.subscription || user?.subscription;
  const calorieEntries = fullData?.calorieTracker || [];

  return (
    <div className="user-detail-section">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Kullanıcı Listesine Dön
        </button>
      </div>

      <div className="detail-content-grid">
        {/* PROFİL KARTI - FLEX LAYOUT */}
        <div className="profile-card">
          <div className={`profile-avatar ${user.role}`}>
            {(user.name || '?').charAt(0)}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.name} {user.surname}</h2>
            <p className="profile-email">{user.email}</p>
            <span className={`profile-role ${user.role}`}>{user.role}</span>

            {subscription && (
              <div className="subscription-badge">
                <p><strong>Plan:</strong> {subscription.planName || subscription.plan}</p>
                <p><strong>Durum:</strong> {subscription.status || 'unknown'}</p>
                {subscription.startDate && <p><strong>Başlangıç:</strong> {formatDate(subscription.startDate)}</p>}
                {subscription.endDate && <p><strong>Bitiş:</strong> {formatDate(subscription.endDate)}</p>}
              </div>
            )}

            <div className="subscription-actions">
              <h4>Abonelik İşlemleri</h4>
              
              <div className="gift-controls">
                <select value={giftPlan} onChange={(e) => setGiftPlan(e.target.value)}>
                  <option value="">Plan Seç...</option>
                  {pricing.map((plan) => (
                    <option key={plan.id || plan.planId} value={plan.planId}>
                      {plan.planName} {plan.price > 0 ? `(₺${plan.price})` : '(Ücretsiz)'}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={giftDuration}
                  onChange={(e) => setGiftDuration(Number(e.target.value))}
                  title="Hediye süresi (ay)"
                  placeholder="Ay"
                />
                <button type="button" className="btn-success" onClick={() => handleSubscriptionAction('gift')}>
                  Aboneliği Hediye Et
                </button>
              </div>

              <button type="button" className="btn-warning" onClick={() => handleSubscriptionAction('cancel')}>
                Aboneliği İptal Et
              </button>
            </div>

            {/* ŞİFRE GÜNCELLEMEBÖLÜMÜ */}
            <div className="security-section">
              <h4>🔐 Güvenlik Ayarları</h4>
              
              <button 
                type="button" 
                className="btn-toggle"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? '▼' : '▶'} Şifre Değiştir
              </button>

              {showPasswordSection && (
                <form onSubmit={handlePasswordUpdate} className="security-form">
                  <div className="form-group-inline">
                    <label>Yeni Şifre:</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="En az 6 karakter"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group-inline">
                    <label>Şifre Tekrar:</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Şifreyi tekrar girin"
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    💾 Şifreyi Güncelle
                  </button>
                </form>
              )}

              <button 
                type="button" 
                className="btn-toggle"
                onClick={() => setShowEmailSection(!showEmailSection)}
              >
                {showEmailSection ? '▼' : '▶'} Email Adresi Değiştir
              </button>

              {showEmailSection && (
                <form onSubmit={handleEmailUpdate} className="security-form">
                  <div className="form-group-inline">
                    <label>Mevcut Email:</label>
                    <input type="text" value={user.email} disabled className="disabled-input" />
                  </div>
                  <div className="form-group-inline">
                    <label>Yeni Email:</label>
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ newEmail: e.target.value })}
                      placeholder="yeni@email.com"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    💾 Email'i Güncelle
                  </button>
                </form>
              )}
            </div>

            <div className="danger-zone">
              <h4>Tehlikeli Alan</h4>
              <p>Bu işlem kalıcıdır ve geri alınamaz.</p>
              <button type="button" onClick={handleDelete} className="btn-delete">
                Kullanıcıyı Kalıcı Olarak Sil
              </button>
            </div>

            {msg.text && <Notification message={msg.text} type={msg.type} />}
          </div>
        </div>

        {/* FORM BÖLÜMÜ - DÜZENLEME */}
        <form className="update-form" onSubmit={handleUpdate}>
          <h3>Kullanıcı Bilgilerini Düzenle</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">İsim</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="surname">Soyisim</label>
              <input type="text" id="surname" name="surname" value={form.surname} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta (Değiştirilemez)</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <hr className="form-divider" />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Boy (cm)</label>
              <input type="number" id="height" name="height" value={form.height} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Kilo (kg)</label>
              <input type="number" id="weight" name="weight" value={form.weight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="targetWeight">Hedef Kilo (kg)</label>
              <input type="number" id="targetWeight" name="targetWeight" value={form.targetWeight} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Cinsiyet</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="not_specified">Belirtilmemiş</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-update">
              Değişiklikleri Kaydet
            </button>
          </div>
          
          {msg.text && <Notification message={msg.text} type={msg.type} />}
        </form>
      </div>

      <div className="data-section">
        <h3>Kayıtlı Veriler</h3>
        <div className="data-grid">
          <div className="data-card">
            <h4>Kalori Tracker Kayıtları ({calorieEntries.length})</h4>
            {calorieEntries.length === 0 ? (
              <p>Bu kullanıcı için kayıt bulunamadı.</p>
            ) : (
              <div className="calorie-entries">
                {calorieEntries.map((item) => {
                  const total = (item.meals || []).reduce((sum, m) => sum + (m.calories || 0), 0);
                  return (
                    <div className="calorie-entry" key={item.id}>
                      <div className="calorie-entry-header">
                        <div>
                          <div className="entry-date">{formatDate(item.date)}</div>
                          <div className="entry-meta">{total} kcal • {(item.meals || []).length} öğün</div>
                        </div>
                      </div>
                      <div className="meal-rows">
                        {(item.meals || []).map((meal) => (
                          <div className="meal-row" key={meal.id}>
                            <div className="meal-row-left">
                              <div className="meal-name">{meal.name}</div>
                              <div className="meal-type">{mealTypeLabel[meal.mealType] || meal.mealType}</div>
                            </div>
                            <div className="meal-row-right">
                              <span className="meal-cal">{meal.calories} kcal</span>
                              <span className="meal-macro">P {meal.protein}g</span>
                              <span className="meal-macro">K {meal.carbs}g</span>
                              <span className="meal-macro">Y {meal.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
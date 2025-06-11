// frontend/src/components/UserDetail.jsx

import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./UserDetail.css";

const Notification = ({ message, type }) => {
  if (!message) return null;
  return <div className={`detail-notification ${type}`}>{message}</div>;
};

export default function UserDetail({ uid, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    height: "",
    weight: "",
    targetWeight: "",
    role: "user",
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          setLoading(true);
          const token = await currentUser.getIdToken();
          const res = await fetch(`http://localhost:5000/api/admin/users/${uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error(`Kullanıcı verisi alınamadı (HTTP ${res.status})`);

          const data = await res.json();
          const profile = { ...data, ...(data.firestoreData || {}) };
          setUser(profile);
          
          setForm({
            name: profile.name || "",
            surname: profile.surname || "",
            email: profile.email || "",
            height: profile.height || 0,
            weight: profile.weight || 0,
            targetWeight: profile.targetWeight || 0,
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

      // --- ÖNERİ: Başarı durumunda UI'ı anında güncelle ---
      // Sol taraftaki profil kartının da anında değişmesi için user state'ini de güncelliyoruz.
      setUser(prevUser => ({ ...prevUser, ...form }));
      // ----------------------------------------------------
      
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
        alert(data.message);
        onBack();
      } else {
        throw new Error(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      alert(`Hata: ${err.message}`);
    }
  };

  if (loading) return <div className="detail-message">Kullanıcı detayları yükleniyor...</div>;
  if (error) return <div className="detail-message error">{error}</div>;
  if (!user) return <div className="detail-message">Kullanıcı bulunamadı.</div>;

  return (
    <div className="user-detail-section">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Kullanıcı Listesine Dön
        </button>
      </div>

      <div className="detail-content-grid">
        {/* SOL SÜTUN: KULLANICI PROFİL KARTI */}
        <div className="profile-card">
          <div className={`profile-avatar ${form.role}`}>
            {(form.name || '?').charAt(0)}
          </div>
          <h2 className="profile-name">{form.name} {form.surname}</h2>
          <p className="profile-email">{form.email}</p>
          <span className={`profile-role ${form.role}`}>{form.role}</span>
        </div>

        {/* SAĞ SÜTUN: GÜNCELLEME FORMU */}
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

          <div className="form-actions">
            <button type="submit" className="btn-update">
              Değişiklikleri Kaydet
            </button>
          </div>
          
          {msg.text && <Notification message={msg.text} type={msg.type} />}

          <div className="danger-zone">
            <h4>Tehlikeli Alan</h4>
            <p>Bu işlem kalıcıdır ve geri alınamaz.</p>
            <button type="button" onClick={handleDelete} className="btn-delete">
              Kullanıcıyı Kalıcı Olarak Sil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
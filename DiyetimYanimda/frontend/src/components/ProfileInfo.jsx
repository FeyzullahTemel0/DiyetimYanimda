// frontend/src/components/ProfileInfo.jsx

import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { getApiUrl } from "../config/apiConfig";
import "./ProfileInfo.css";

const Notification = ({ message, type }) => {
  if (!message) return null;
  return <div className={`profile-notification ${type}`}>{message}</div>;
};

export default function ProfileInfo({ data, onUpdate }) {
  // data prop'u admin'in kendi profil verisidir.
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    height: '',
    weight: '',
    targetWeight: '',
    gender: 'not_specified',
    role: 'user', // Rol bilgisi de formda
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Bileşen yüklendiğinde veya 'data' prop'u değiştiğinde formu doldur.
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || '',
        surname: data.surname || '',
        email: data.email || '',
        height: data.height || 0,
        weight: data.weight || 0,
        targetWeight: data.targetWeight || 0,
        gender: data.gender || 'not_specified',
        role: data.role || 'user',
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: 'Güncelleniyor...', type: 'info' });
    try {
      const token = await auth.currentUser.getIdToken();
      // Admin kendi profilini /api/profile endpoint'inden günceller
      const res = await fetch(getApiUrl("/api/profile"), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Güncelleme başarısız oldu.");
      }
      
      const successData = await res.json();
      setNotification({ message: successData.message, type: 'success' });
      setIsEditing(false); // Düzenleme modunu kapat
      onUpdate(form); // Dashboard'daki ana profil state'ini de güncelle
      
    } catch (error) {
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    }
  };

  // Eğer düzenleme modunda değilse, sadece bilgileri göster.
  if (!isEditing) {
    const date = new Date(data.createdAt?._seconds * 1000);
    return (
      <section className="profile-info-display">
        <h3>Profil Bilgileri</h3>
        <p><strong>Ad Soyad:</strong> {data.name} {data.surname}</p>
        <p><strong>E-posta:</strong> {data.email}</p>
        <p><strong>Rol:</strong> <span className={`role-pill ${data.role}`}>{data.role}</span></p>
        <p><strong>Cinsiyet:</strong> {data.gender === 'male' ? 'Erkek' : data.gender === 'female' ? 'Kadın' : 'Belirtilmemiş'}</p>
        <p><strong>Boy:</strong> {data.height} cm</p>
        <p><strong>Kilo:</strong> {data.weight} kg</p>
        <p><strong>Hedef Kilo:</strong> {data.targetWeight} kg</p>
        <p><strong>Kayıt Tarihi:</strong> {date.toLocaleDateString()}</p>
        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Profili Düzenle</button>
      </section>
    );
  }

  // Düzenleme modu aktifse, formu göster.
  return (
    <section className="profile-info-form">
      <h3>Profil Bilgilerini Düzenle</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
            <div className="form-group"><label>Ad</label><input type="text" name="name" value={form.name} onChange={handleChange} /></div>
            <div className="form-group"><label>Soyad</label><input type="text" name="surname" value={form.surname} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label>E-posta (Değiştirilemez)</label><input type="email" name="email" value={form.email} disabled /></div>
        <div className="form-row">
            <div className="form-group">
                <label>Rol</label>
                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div className="form-group">
                <label>Cinsiyet</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="not_specified">Belirtilmemiş</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                </select>
            </div>
        </div>
        <div className="form-row">
            <div className="form-group"><label>Boy (cm)</label><input type="number" name="height" value={form.height} onChange={handleChange} /></div>
            <div className="form-group"><label>Kilo (kg)</label><input type="number" name="weight" value={form.weight} onChange={handleChange} /></div>
            <div className="form-group"><label>Hedef Kilo (kg)</label><input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} /></div>
        </div>
        
        {notification.message && <Notification message={notification.message} type={notification.type} />}

        <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>İptal</button>
            <button type="submit" className="btn-save">Değişiklikleri Kaydet</button>
        </div>
      </form>
    </section>
  );
}
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import "./ProgramForm.css";

// DİKKAT: Prop adı 'initialData' olarak standarttır.
export default function ProgramForm({ initialData, onSuccess, onCancel }) {
  const isEdit = Boolean(initialData && initialData.id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    gender: 'male',
    accessLevel: 'free',
    calories: '',
    proteinPercent: '',
    carbPercent: '',
    fatPercent: '',
    weeklyMenu: '',
    tips: '',
  });
  const [error, setError] = useState("");

  // Düzenleme modu için formu gelen veriyle doldurur.
  useEffect(() => {
    // Sadece düzenleme modundaysa ve initialData varsa formu doldur
    if (isEdit && initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        gender: initialData.gender || "male",
        accessLevel: initialData.accessLevel || "free",
        calories: initialData.calories || "",
        proteinPercent: initialData.macros?.proteinPercent || "",
        carbPercent: initialData.macros?.carbPercent || "",
        fatPercent: initialData.macros?.fatPercent || "",
        weeklyMenu: initialData.weeklyMenu || "",
        tips: initialData.tips || "",
      });
    }
  }, [initialData, isEdit]);


  const handleChange = e => {
    const { name, value } = e.target;
    if (["calories", "proteinPercent", "carbPercent", "fatPercent"].includes(name) && Number(value) < 0) {
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        gender: form.gender,
        accessLevel: form.accessLevel,
        calories: Number(form.calories) || 0,
        weeklyMenu: form.weeklyMenu,
        tips: form.tips,
        macros: {
          proteinPercent: Number(form.proteinPercent) || 0,
          carbPercent: Number(form.carbPercent) || 0,
          fatPercent: Number(form.fatPercent) || 0
        }
      };

      const token = await auth.currentUser.getIdToken();
      const url = isEdit
        ? `http://localhost:5000/api/admin/diet-programs/${initialData.id}`
        : "http://localhost:5000/api/admin/diet-programs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Kaydetme sırasında bir hata oluştu.");
      }
      onSuccess(responseData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="program-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}
      
      <div className="form-group full-width">
        <label htmlFor="title">Başlık</label>
        <input type="text" id="title" name="title" value={form.title} onChange={handleChange} required />
      </div>
      
      <div className="form-group">
        <label htmlFor="gender">Cinsiyet</label>
        <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Erkek</option>
            <option value="female">Kadın</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="accessLevel">Erişim Seviyesi</label>
        <select id="accessLevel" name="accessLevel" value={form.accessLevel} onChange={handleChange}>
            <option value="free">Ücretsiz (Herkes)</option>
            <option value="basic">Temel Plan</option>
            <option value="premium">Premium Plan</option>
            <option value="plus">Profesyonel Plus+</option>
        </select>
      </div>
      
      <div className="form-group"><label htmlFor="calories">Kalori (kcal)</label><input type="number" id="calories" name="calories" value={form.calories} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label htmlFor="proteinPercent">Protein (%)</label><input type="number" id="proteinPercent" name="proteinPercent" value={form.proteinPercent} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label htmlFor="carbPercent">Karbonhidrat (%)</label><input type="number" id="carbPercent" name="carbPercent" value={form.carbPercent} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label htmlFor="fatPercent">Yağ (%)</label><input type="number" id="fatPercent" name="fatPercent" value={form.fatPercent} onChange={handleChange} min="0" /></div>

      <div className="form-group full-width"><label htmlFor="description">Açıklama</label><textarea id="description" name="description" value={form.description} onChange={handleChange} rows="4" /></div>
      <div className="form-group full-width"><label htmlFor="weeklyMenu">Haftalık Menü</label><textarea id="weeklyMenu" name="weeklyMenu" value={form.weeklyMenu} onChange={handleChange} rows="6" /></div>
      <div className="form-group full-width"><label htmlFor="tips">İpuçları</label><textarea id="tips" name="tips" value={form.tips} onChange={handleChange} rows="4" /></div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>İptal</button>
        <button type="submit" className="btn-submit">{isEdit ? "Programı Güncelle" : "Program Ekle"}</button>
      </div>
    </form>
  );
}
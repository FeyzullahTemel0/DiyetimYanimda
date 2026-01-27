// frontend/src/pages/AdminHabits.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useToastContext } from "../contexts/ToastContext";
import "./AdminHabits.css";

const defaultForm = {
  title: "",
  subtitle: "",
  description: "",
  category: "wellness",
  difficulty: "orta",
  frequencyPerWeek: 5,
  durationWeeks: 4,
  focus: ["beslenme"],
  status: "active",
};

const categoryOptions = [
  { key: "wellness", label: "Wellness" },
  { key: "fitness", label: "Fitness" },
  { key: "nutrition", label: "Beslenme" },
  { key: "mindset", label: "Zihin" },
  { key: "sleep", label: "Uyku" },
];

const difficultyOptions = ["kolay", "orta", "zor"];

const focusOptions = [
  "beslenme",
  "su tüketimi",
  "egzersiz",
  "uyku",
  "stres",
  "zihin",
  "nefes",
];

export default function AdminHabits() {
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "habitPrograms"));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHabits(rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (error) {
      console.error("Alışkanlık listesi hatası:", error);
      showToast(error.message || "Alışkanlıklar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return navigate("/");
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await res.json();
        if (profile.role !== "admin") return navigate("/");
      } catch (err) {
        console.error("Admin kontrolü hatası:", err);
        navigate("/");
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        focus: formData.focus || [],
        frequencyPerWeek: Number(formData.frequencyPerWeek),
        durationWeeks: Number(formData.durationWeeks),
        updatedAt: serverTimestamp(),
        createdAt: editingId ? formData.createdAt || serverTimestamp() : serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "habitPrograms", editingId), payload);
        showToast("Alışkanlık programı güncellendi", "success");
      } else {
        await addDoc(collection(db, "habitPrograms"), payload);
        showToast("Alışkanlık programı eklendi", "success");
      }

      setFormData(defaultForm);
      setEditingId(null);
      setShowForm(false);
      loadHabits();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      showToast(error.message || "Kaydedilemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (habit) => {
    setFormData({ ...habit });
    setEditingId(habit.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu programı silmek istediğinize emin misiniz?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "habitPrograms", id));
      showToast("Program silindi", "success");
      loadHabits();
    } catch (error) {
      console.error("Silme hatası:", error);
      showToast(error.message || "Silinemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleFocus = (tag) => {
    const current = formData.focus || [];
    if (current.includes(tag)) {
      setFormData({ ...formData, focus: current.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, focus: [...current, tag] });
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar activeTab="admin-habits" />
        <main className="main-content">
          <div className="admin-habits-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">İçerik Yönetimi</p>
                <h1>Alışkanlık Geliştirme</h1>
                <p className="sub">Programlar, hedefler, zorluk ve odak alanları</p>
              </div>
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Formu Kapat" : "Yeni Program"}
              </button>
            </div>

            {showForm && (
              <form className="habit-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Başlık</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Alt Başlık</label>
                    <input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categoryOptions.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Zorluk</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      {difficultyOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Haftalık Frekans</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={formData.frequencyPerWeek}
                      onChange={(e) => setFormData({ ...formData, frequencyPerWeek: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Süre (hafta)</label>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={formData.durationWeeks}
                      onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Durum</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="draft">Taslak</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Programın amacı, beklenen kazanımlar, günlük/haftalık görevler"
                  />
                </div>

                <div className="form-group">
                  <label>Odak Alanları</label>
                  <div className="chips">
                    {focusOptions.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        className={`chip ${formData.focus?.includes(tag) ? "active" : ""}`}
                        onClick={() => toggleFocus(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {editingId ? "Güncelle" : "Kaydet"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setShowForm(false); setEditingId(null); setFormData(defaultForm); }}
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}

            <div className="habits-list">
              <div className="list-header">
                <div>
                  <p className="eyebrow">Program Listesi</p>
                  <h3>Toplam {habits.length} kayıt</h3>
                </div>
              </div>

              {loading && <p className="loading">Yükleniyor...</p>}

              {!loading && habits.length === 0 && (
                <p className="empty">Henüz program eklenmemiş.</p>
              )}

              <div className="grid">
                {habits.map((item) => (
                  <div key={item.id} className="habit-card">
                    <div className="card-head">
                      <div>
                        <p className="eyebrow">{item.category}</p>
                        <h4>{item.title}</h4>
                        <p className="meta">{item.subtitle}</p>
                      </div>
                      <span className={`pill ${item.status === "active" ? "success" : "muted"}`}>
                        {item.status === "active" ? "Aktif" : "Taslak"}
                      </span>
                    </div>
                    <p className="desc">{item.description}</p>

                    <div className="stats">
                      <span>🔥 Zorluk: {item.difficulty}</span>
                      <span>📅 {item.durationWeeks} hafta</span>
                      <span>✅ Haftada {item.frequencyPerWeek} görev</span>
                    </div>

                    {item.focus?.length > 0 && (
                      <div className="tags">
                        {item.focus.map((t) => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="card-actions">
                      <button className="text-btn" onClick={() => handleEdit(item)}>Düzenle</button>
                      <button className="text-btn danger" onClick={() => handleDelete(item.id)}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

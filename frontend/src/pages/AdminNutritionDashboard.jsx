import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";
import { useToastContext } from "../contexts/ToastContext";
import "./AdminNutritionDashboard.css";

export default function AdminNutritionDashboard() {
  const { user, profile } = useAuth();
  const { showToast } = useToastContext();
  
  // State
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tips"); // tips, categories, tags
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    content: "",
    category: "",
    tags: [],
    is_featured: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "" });
  const [tagForm, setTagForm] = useState({ name: "" });
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);

  // Kategoriler ve etiketleri çek
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("http://localhost:5000/api/nutrition-tips/categories"),
          fetch("http://localhost:5000/api/nutrition-tips/tags"),
        ]);

        const catData = await catRes.json();
        const tagData = await tagRes.json();

        if (catData.success) setCategories(catData.categories);
        if (tagData.success) setTags(tagData.tags);
        setSelectedCatIds([]);
        setSelectedTagIds([]);
      } catch (err) {
        console.error("Metadata fetch hatası:", err);
      }
    };

    fetchMetadata();
  }, []);

  // İpuçlarını çek
  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/nutrition-tips?limit=100");
      const data = await res.json();

      if (data.success) {
        setTips(data.tips);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Tips fetch hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetadata = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("http://localhost:5000/api/nutrition-tips/categories"),
        fetch("http://localhost:5000/api/nutrition-tips/tags"),
      ]);
      const catData = await catRes.json();
      const tagData = await tagRes.json();
      if (catData.success) setCategories(catData.categories);
      if (tagData.success) setTags(tagData.tags);
      setSelectedCatIds([]);
      setSelectedTagIds([]);
    } catch (err) {
      console.error("Meta refresh hatası:", err);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === tips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tips.map((t) => t.id));
    }
  };

  const handleSelectAllCats = () => {
    if (selectedCatIds.length === categories.length) {
      setSelectedCatIds([]);
    } else {
      setSelectedCatIds(categories.map((c) => c.id));
    }
  };

  const handleSelectAllTags = () => {
    if (selectedTagIds.length === tags.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(tags.map((t) => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast("Silmek için en az bir ipucu seçin", "warning");
      return;
    }

    if (!window.confirm(`${selectedIds.length} ipucunu silmek istediğinize emin misiniz?`)) return;

    const token = await auth.currentUser.getIdToken();

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`http://localhost:5000/api/nutrition-tips/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      showToast(`${selectedIds.length} ipucu başarıyla silindi`, "info");
      setSelectedIds([]);
      fetchTips();
    } catch (err) {
      console.error("Toplu silme hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    const token = await auth.currentUser.getIdToken();
    try {
      await fetch(`http://localhost:5000/api/nutrition-tips/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Kategori başarıyla silindi", "info");
      refreshMetadata();
    } catch (err) {
      console.error("Kategori silme hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Etiketi silmek istediğinize emin misiniz?")) return;
    const token = await auth.currentUser.getIdToken();
    try {
      await fetch(`http://localhost:5000/api/nutrition-tips/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Etiket başarıyla silindi", "info");
      refreshMetadata();
    } catch (err) {
      console.error("Etiket silme hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  const handleBulkDeleteCategories = async () => {
    if (selectedCatIds.length === 0) {
      showToast("Silmek için kategori seçin", "warning");
      return;
    }
    if (!window.confirm(`${selectedCatIds.length} kategoriyi silmek istiyor musunuz?`)) return;
    const token = await auth.currentUser.getIdToken();
    try {
      await Promise.all(
        selectedCatIds.map((id) =>
          fetch(`http://localhost:5000/api/nutrition-tips/categories/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast(`${selectedCatIds.length} kategori başarıyla silindi`, "info");
      setSelectedCatIds([]);
      refreshMetadata();
    } catch (err) {
      console.error("Toplu kategori silme hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  const handleBulkDeleteTags = async () => {
    if (selectedTagIds.length === 0) {
      showToast("Silmek için etiket seçin", "warning");
      return;
    }
    if (!window.confirm(`${selectedTagIds.length} etiketi silmek istiyor musunuz?`)) return;
    const token = await auth.currentUser.getIdToken();
    try {
      await Promise.all(
        selectedTagIds.map((id) =>
          fetch(`http://localhost:5000/api/nutrition-tips/tags/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      showToast(`${selectedTagIds.length} etiket başarıyla silindi`, "info");
      setSelectedTagIds([]);
      refreshMetadata();
    } catch (err) {
      console.error("Toplu etiket silme hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const token = await auth.currentUser.getIdToken();
    const url = editingCatId
      ? `http://localhost:5000/api/nutrition-tips/categories/${editingCatId}`
      : "http://localhost:5000/api/nutrition-tips/categories";
    const method = editingCatId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          editingCatId ? "Kategori başarıyla güncellendi" : "Kategori başarıyla eklendi",
          editingCatId ? "warning" : "success"
        );
        setCategoryForm({ name: "", slug: "", icon: "" });
        setEditingCatId(null);
        setShowCategoryForm(false);
        refreshMetadata();
      }
    } catch (err) {
      console.error("Kategori submit hatası:", err);
      showToast("İşlem başarısız: " + err.message, "error");
    }
  };

  const handleSubmitTag = async (e) => {
    e.preventDefault();
    const token = await auth.currentUser.getIdToken();
    const url = editingTagId
      ? `http://localhost:5000/api/nutrition-tips/tags/${editingTagId}`
      : "http://localhost:5000/api/nutrition-tips/tags";
    const method = editingTagId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tagForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          editingTagId ? "Etiket başarıyla güncellendi" : "Etiket başarıyla eklendi",
          editingTagId ? "warning" : "success"
        );
        setTagForm({ name: "" });
        setEditingTagId(null);
        setShowTagForm(false);
        refreshMetadata();
      }
    } catch (err) {
      console.error("Etiket submit hatası:", err);
      showToast("İşlem başarısız: " + err.message, "error");
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  // Form submit - Yeni ipucu ekle veya güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await auth.currentUser.getIdToken();

    try {
      const url = editingId
        ? `http://localhost:5000/api/nutrition-tips/${editingId}`
        : "http://localhost:5000/api/nutrition-tips";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          editingId ? "İpucu başarıyla güncellendi" : "İpucu başarıyla eklendi",
          editingId ? "warning" : "success"
        );
        setFormData({
          title: "",
          short_description: "",
          content: "",
          category: "",
          tags: [],
          is_featured: false,
        });
        setEditingId(null);
        setShowForm(false);
        fetchTips();
      }
    } catch (err) {
      console.error("Submit hatası:", err);
      showToast("İşlem başarısız: " + err.message, "error");
    }
  };

  // İpucu sil
  const handleDelete = async (id) => {
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;

    const token = await auth.currentUser.getIdToken();

    try {
      const res = await fetch(`http://localhost:5000/api/nutrition-tips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        showToast("İpucu başarıyla silindi", "info");
        fetchTips();
      }
    } catch (err) {
      console.error("Delete hatası:", err);
      showToast("Silme işlemi başarısız: " + err.message, "error");
    }
  };

  // Yönetici kontrolü
  if (!user || profile?.role !== "admin") {
    return <div className="admin-guard">Bu sayfaya erişim yetkiniz yok.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>📧 Beslenme İpuçları Yönetimi</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "tips" ? "active" : ""}`}
          onClick={() => setActiveTab("tips")}
        >
          İpuçları Yönet
        </button>
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Kategoriler
        </button>
        <button
          className={`tab-btn ${activeTab === "tags" ? "active" : ""}`}
          onClick={() => setActiveTab("tags")}
        >
          Etiketler
        </button>
      </div>

      {/* İpuçları Sekmesi */}
      {activeTab === "tips" && (
        <div className="tab-content">
          <div className="toolbar">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  title: "",
                  short_description: "",
                  content: "",
                  category: "",
                  tags: [],
                  is_featured: false,
                });
              }}
            >
              ➕ Yeni İpucu Ekle
            </button>
            <div className="bulk-actions">
              <button className="btn btn-secondary" onClick={handleSelectAll}>
                {selectedIds.length === tips.length && tips.length > 0 ? "Seçimi Temizle" : "Hepsini Seç"}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
              >
                🗑️ Seçilenleri Sil ({selectedIds.length})
              </button>
            </div>
          </div>

          {showForm && (
            <form className="tip-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Başlık"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Kısa açıklama"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                required
              />
              <textarea
                placeholder="Detaylı içerik"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Kategori seç</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                Günün İpucu Olarak İşaretle
              </label>
              <div className="form-actions-row">
                <button type="submit" className="btn btn-success">
                  {editingId ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          <div className="tips-list">
            {loading ? (
              <p>Yükleniyor...</p>
            ) : tips.length === 0 ? (
              <p>Henüz ipucu yok</p>
            ) : (
              tips.map((tip) => (
                <div key={tip.id} className="tip-item">
                  <div className="tip-select">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tip.id)}
                      onChange={() => handleToggleSelect(tip.id)}
                    />
                  </div>
                  <div className="tip-info">
                    <h3>
                      {tip.is_featured && "⭐"} {tip.title}
                    </h3>
                    <p>{tip.short_description}</p>
                    <small>
                      Kategori: {categories.find(c => c.id === tip.category)?.name || tip.category} | Görüntüleme: {tip.view_count || 0}
                    </small>
                  </div>
                  <div className="tip-actions">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => {
                        setFormData(tip);
                        setEditingId(tip.id);
                        setShowForm(true);
                      }}
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(tip.id)}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Kategoriler Sekmesi */}
      {activeTab === "categories" && (
        <div className="tab-content">
          <div className="toolbar">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCategoryForm(!showCategoryForm);
                setEditingCatId(null);
                setCategoryForm({ name: "", slug: "", icon: "" });
              }}
            >
              ➕ Yeni Kategori
            </button>
            <div className="bulk-actions">
              <button className="btn btn-secondary" onClick={handleSelectAllCats}>
                {selectedCatIds.length === categories.length && categories.length > 0 ? "Seçimi Temizle" : "Hepsini Seç"}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDeleteCategories}
                disabled={selectedCatIds.length === 0}
              >
                🗑️ Seçilenleri Sil ({selectedCatIds.length})
              </button>
            </div>
          </div>

          {showCategoryForm && (
            <form className="tip-form" onSubmit={handleSubmitCategory}>
              <input
                type="text"
                placeholder="Kategori adı"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              />
              <div className="form-actions-row">
                <button type="submit" className="btn btn-success">
                  {editingCatId ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCatId(null);
                    setCategoryForm({ name: "", slug: "", icon: "" });
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          <div className="categories-list">
            {categories.map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="tip-select">
                  <input
                    type="checkbox"
                    checked={selectedCatIds.includes(cat.id)}
                    onChange={() =>
                      setSelectedCatIds((prev) =>
                        prev.includes(cat.id) ? prev.filter((x) => x !== cat.id) : [...prev, cat.id]
                      )
                    }
                  />
                </div>
                <div className="category-info">
                  <strong>{cat.icon} {cat.name}</strong>
                  <small>slug: {cat.slug}</small>
                </div>
                <div className="tip-actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCategoryForm({ name: cat.name, slug: cat.slug, icon: cat.icon });
                      setShowCategoryForm(true);
                    }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDeleteCategory(cat.id)}>
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Etiketler Sekmesi */}
      {activeTab === "tags" && (
        <div className="tab-content">
          <div className="toolbar">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowTagForm(!showTagForm);
                setEditingTagId(null);
                setTagForm({ name: "" });
              }}
            >
              ➕ Yeni Etiket
            </button>
            <div className="bulk-actions">
              <button className="btn btn-secondary" onClick={handleSelectAllTags}>
                {selectedTagIds.length === tags.length && tags.length > 0 ? "Seçimi Temizle" : "Hepsini Seç"}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDeleteTags}
                disabled={selectedTagIds.length === 0}
              >
                🗑️ Seçilenleri Sil ({selectedTagIds.length})
              </button>
            </div>
          </div>

          {showTagForm && (
            <form className="tip-form" onSubmit={handleSubmitTag}>
              <input
                type="text"
                placeholder="Etiket adı"
                value={tagForm.name}
                onChange={(e) => setTagForm({ name: e.target.value })}
                required
              />
              <div className="form-actions-row">
                <button type="submit" className="btn btn-success">
                  {editingTagId ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTagForm(false);
                    setEditingTagId(null);
                    setTagForm({ name: "" });
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          <div className="tags-list">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-item">
                <div className="tip-select">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() =>
                      setSelectedTagIds((prev) =>
                        prev.includes(tag.id) ? prev.filter((x) => x !== tag.id) : [...prev, tag.id]
                      )
                    }
                  />
                </div>
                <div className="tag-chip">#{tag.name}</div>
                <div className="tip-actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => {
                      setEditingTagId(tag.id);
                      setTagForm({ name: tag.name });
                      setShowTagForm(true);
                    }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDeleteTag(tag.id)}>
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

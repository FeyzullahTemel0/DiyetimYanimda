// frontend/src/pages/AdminRecipes.jsx

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useToastContext } from "../contexts/ToastContext";
import "./AdminRecipes.css";

export default function AdminRecipes() {
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [userStatus, setUserStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "tavuk",
    difficulty: "kolay",
    prepTime: 30,
    servings: 1,
    calories: 300,
    protein: 30,
    carbs: 30,
    fat: 10,
    fiber: 3,
    glycemicIndex: "medium",
    targetGroups: [],
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ingredients: [{ name: "", amount: "", calories: 0 }],
    instructions: [""],
    tips: ""
  });

  const targetGroupOptions = [
    { key: "diabetes", label: "🏥 Diyabet Hastası" },
    { key: "weight_loss", label: "⬇️ Kilo Verme" },
    { key: "weight_gain", label: "⬆️ Kilo Alma" },
    { key: "muscle_gain", label: "💪 Kas Gelişimi" },
    { key: "maintain", label: "⚖️ Stabil Kalma" },
    { key: "healthy_lifestyle", label: "💚 Sağlıklı Yaşam" },
    { key: "diet", label: "📋 Beslenme" },
    { key: "vegetarian", label: "🥬 Vejetaryen" }
  ];

  const categoryOptions = [
    "tavuk", "balık", "vegan", "yumurta", "içecek"
  ];

  const difficultyOptions = ["çok kolay", "kolay", "orta", "zor"];
  const glycemicIndexOptions = ["very_low", "low", "medium", "high"];

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const recipesQuery = query(
        collection(db, "recipes"),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(recipesQuery);
      const loadedRecipes = [];

      snapshot.forEach(docSnap => {
        loadedRecipes.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setRecipes(loadedRecipes);
    } catch (error) {
      console.error("Tarifler yükleme hatası:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMsg = "Tarifler yüklenemedi";
      if (error.code === 'permission-denied') {
        errorMsg = "Admin izni gerekli! Lütfen admin olduğunuzdan emin olun.";
      } else if (error.code === 'unauthenticated') {
        errorMsg = "Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Admin kontrolü
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          navigate('/');
          return;
        }

        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const profileData = await res.json();
        
        // Kullanıcı durumunu logla (debugging için)
        console.log("👤 Kullanıcı Durumu:", {
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          firebaseRole: profileData.role,
          hasEmail: !!auth.currentUser?.email
        });
        
        setUserStatus({
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          role: profileData.role,
          isAdmin: profileData.role === 'admin'
        });
        
        if (profileData.role !== 'admin') {
          navigate('/');
          return;
        }
      } catch (error) {
        console.error("Admin kontrolü hatası:", error);
        navigate('/');
      }
    };

    checkAdmin();
  }, [navigate]);

  // Tarifler yükle
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.targetGroups.length === 0) {
      showToast("Tarif adı ve hedef grup zorunludur", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Güncelle
        await updateDoc(doc(db, "recipes", editingId), {
          ...formData,
          updatedAt: new Date()
        });
        showToast("Tarif başarıyla güncellendi", "success");
      } else {
        // Yeni ekle
        await addDoc(collection(db, "recipes"), {
          ...formData,
          status: "active",
          rating: 0,
          reviews: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        showToast("Tarif başarıyla eklendi", "success");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        category: "tavuk",
        difficulty: "kolay",
        prepTime: 30,
        servings: 1,
        calories: 300,
        protein: 30,
        carbs: 30,
        fat: 10,
        fiber: 3,
        glycemicIndex: "medium",
        targetGroups: [],
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        ingredients: [{ name: "", amount: "", calories: 0 }],
        instructions: [""],
        tips: ""
      });
      loadRecipes();
    } catch (error) {
      console.error("=== TARIF KAYDETME HATASI ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Kullanıcı Durumu:", userStatus);
      console.error("==============================");
      
      let errorMsg = "Tarif kaydedilemedi";
      if (error.code === 'permission-denied') {
        errorMsg = `❌ Admin izni gerekli!\n\nÇözüm:\n1. Admin olduğunuzdan emin olun: ${userStatus?.email}\n2. Komutu çalıştırın: node backend/scripts/makeUserAdmin.js ${userStatus?.email}\n3. Uygulamayı yenileyip tekrar giriş yapın`;
      } else if (error.code === 'unauthenticated') {
        errorMsg = "⚠️ Kimlik doğrulama gerekli. Lütfen çıkış yapıp tekrar giriş yapın.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipe) => {
    setFormData(recipe);
    setEditingId(recipe.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu tarifı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, "recipes", id));
      showToast("Tarif başarıyla silindi", "success");
      loadRecipes();
    } catch (error) {
      console.error("=== TARIF SİLME HATASI ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      console.error("Kullanıcı Durumu:", userStatus);
      console.error("=== KONTROL LİSTESİ ===");
      console.error("1. Admin olarak doğrulanmış mı?", userStatus?.isAdmin);
      console.error("2. UID:", userStatus?.uid);
      console.error("3. Email:", userStatus?.email);
      console.error("4. Firestore Role:", userStatus?.role);
      console.error("========================");
      
      let errorMsg = "Tarif silinemedi";
      
      if (error.code === 'permission-denied') {
        errorMsg = `❌ Admin izni gerekli!\n\nÇözüm:\n1. Admin durumunuzu kontrol edin: ${userStatus?.email}\n2. Komutu çalıştırın: node backend/scripts/makeUserAdmin.js ${userStatus?.email}\n3. Uygulamayı yenileyip tekrar giriş yapın`;
      } else if (error.code === 'unauthenticated') {
        errorMsg = "⚠️ Kimlik doğrulama gerekli. Lütfen çıkış yapıp tekrar giriş yapın.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipeSelection = (id) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(recipes.map(r => r.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecipes.size === 0) {
      showToast("Lütfen silinecek tarifler seçin", "warning");
      return;
    }

    if (!window.confirm(`${selectedRecipes.size} tarifin silinmesini istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      setLoading(true);
      for (const id of selectedRecipes) {
        await deleteDoc(doc(db, "recipes", id));
      }
      showToast(`${selectedRecipes.size} tarif başarıyla silindi`, "success");
      setSelectedRecipes(new Set());
      loadRecipes();
    } catch (error) {
      console.error("=== TOPLU SİLME HATASI ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Kullanıcı Durumu:", userStatus);
      console.error("=========================");
      
      let errorMsg = "Tarifler silinemedi";
      if (error.code === 'permission-denied') {
        errorMsg = `❌ Admin izni gerekli!\n\nÇözüm:\n1. Admin olduğunuzdan emin olun: ${userStatus?.email}\n2. Komutu çalıştırın: node backend/scripts/makeUserAdmin.js ${userStatus?.email}\n3. Uygulamayı yenileyip tekrar giriş yapın`;
      } else if (error.code === 'unauthenticated') {
        errorMsg = "⚠️ Kimlik doğrulama gerekli. Lütfen çıkış yapıp tekrar giriş yapın.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetGroup = (group) => {
    setFormData(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(group)
        ? prev.targetGroups.filter(g => g !== group)
        : [...prev.targetGroups, group]
    }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: "", amount: "", calories: 0 }]
    });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""]
    });
  };

  const removeInstruction = (index) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar activeTab="admin-recipes" />

        <main className="main-content">
          <div className="admin-recipes-panel">
            <div className="panel-header">
              <h1>🍽️ Tarif Yönetimi</h1>
              <button 
                className="btn-add"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    description: "",
                    category: "tavuk",
                    difficulty: "kolay",
                    prepTime: 30,
                    servings: 1,
                    calories: 300,
                    protein: 30,
                    carbs: 30,
                    fat: 10,
                    fiber: 3,
                    glycemicIndex: "medium",
                    targetGroups: [],
                    vegan: false,
                    glutenFree: false,
                    dairyFree: false,
                    ingredients: [{ name: "", amount: "", calories: 0 }],
                    instructions: [""],
                    tips: ""
                  });
                }}
              >
                {showForm ? "❌ Formu Kapat" : "➕ Yeni Tarif Ekle"}
              </button>
            </div>

            <div className="admin-recipes-content">

            {showForm && (
              <form className="recipe-form" onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3>📋 Temel Bilgiler</h3>

                  <div className="form-group">
                    <label>Tarif Adı *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tarif adını girin"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Açıklama</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tarif açıklaması"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Zorluk Derecesi</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        {difficultyOptions.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hazırlama Süresi (dk)</label>
                      <input
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Porsiyon</label>
                      <input
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Hedef Grup Seçimi */}
                  <div className="form-group">
                    <label>Hedef Grup * (En az bir seçin)</label>
                    <div className="target-groups-grid">
                      {targetGroupOptions.map(group => (
                        <label key={group.key} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.targetGroups.includes(group.key)}
                            onChange={() => toggleTargetGroup(group.key)}
                          />
                          {group.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Besin Bilgisi */}
                <div className="form-section">
                  <h3>🔬 Besin Bilgisi (Porsiyon başına)</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kalori</label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Protein (g)</label>
                      <input
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Karbohidrat (g)</label>
                      <input
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Yağ (g)</label>
                      <input
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Fiber (g)</label>
                      <input
                        type="number"
                        value={formData.fiber}
                        onChange={(e) => setFormData({ ...formData, fiber: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Glisemik İndeks</label>
                      <select
                        value={formData.glycemicIndex}
                        onChange={(e) => setFormData({ ...formData, glycemicIndex: e.target.value })}
                      >
                        {glycemicIndexOptions.map(gi => (
                          <option key={gi} value={gi}>{gi}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Diyet Özellikleri */}
                <div className="form-section">
                  <h3>🥬 Diyet Özellikleri</h3>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.vegan}
                        onChange={(e) => setFormData({ ...formData, vegan: e.target.checked })}
                      />
                      Vegan
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.glutenFree}
                        onChange={(e) => setFormData({ ...formData, glutenFree: e.target.checked })}
                      />
                      Gluten Free
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.dairyFree}
                        onChange={(e) => setFormData({ ...formData, dairyFree: e.target.checked })}
                      />
                      Süt Ürünü İçermez
                    </label>
                  </div>
                </div>

                {/* Malzemeler */}
                <div className="form-section">
                  <h3>🥘 Malzemeler</h3>

                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-row">
                      <input
                        type="text"
                        placeholder="Malzeme adı"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Miktar (ör: 200g)"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Kalori"
                        value={ingredient.calories}
                        onChange={(e) => updateIngredient(index, "calories", parseInt(e.target.value) || 0)}
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeIngredient(index)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={addIngredient}
                  >
                    ➕ Malzeme Ekle
                  </button>
                </div>

                {/* Talimatlar */}
                <div className="form-section">
                  <h3>👨‍🍳 Hazırlama Adımları</h3>

                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="instruction-row">
                      <textarea
                        placeholder={`Adım ${index + 1}`}
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows="2"
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeInstruction(index)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={addInstruction}
                  >
                    ➕ Adım Ekle
                  </button>
                </div>

                {/* İpuçları */}
                <div className="form-section">
                  <h3>💡 İpuçları</h3>

                  <textarea
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    placeholder="Tarifle ilgili faydalı ipuçları"
                    rows="3"
                  />
                </div>

                {/* Submit Butonları */}
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? "Kaydediliyor..." : (editingId ? "✏️ Güncelle" : "➕ Ekle")}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}

            {/* Tarifler Listesi */}
            <div className="recipes-list">
              <div className="list-header">
                <h3>📚 Mevcut Tarifler ({recipes.length})</h3>
                {recipes.length > 0 && (
                  <div className="list-actions">
                    <label className="select-all-label">
                      <input
                        type="checkbox"
                        checked={selectedRecipes.size === recipes.length && recipes.length > 0}
                        onChange={toggleSelectAll}
                      />
                      <span>{selectedRecipes.size > 0 ? `${selectedRecipes.size} seçildi` : "Tümünü Seç"}</span>
                    </label>
                    {selectedRecipes.size > 0 && (
                      <button
                        className="btn-delete-selected"
                        onClick={handleDeleteSelected}
                        disabled={loading}
                      >
                        🗑️ Seçilenleri Sil ({selectedRecipes.size})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {loading && <p className="loading">Yükleniyor...</p>}

              {recipes.length === 0 ? (
                <p className="no-data">Henüz tarif bulunmamaktadır.</p>
              ) : (
                <div className="recipes-table">
                  {recipes.map(recipe => (
                    <div key={recipe.id} className="recipe-item">
                      <div className="recipe-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRecipes.has(recipe.id)}
                          onChange={() => toggleRecipeSelection(recipe.id)}
                        />
                      </div>

                      <div className="recipe-info">
                        <h4>{recipe.name}</h4>
                        <p className="recipe-meta">
                          <span>🍳 {recipe.category}</span>
                          <span>⏱️ {recipe.prepTime} dk</span>
                          <span>🔥 {recipe.calories} kcal</span>
                          <span>⭐ {recipe.difficulty}</span>
                        </p>
                        <div className="target-groups-display">
                          {recipe.targetGroups?.map(group => {
                            const label = targetGroupOptions.find(opt => opt.key === group)?.label;
                            return <span key={group} className="tag">{label}</span>;
                          })}
                        </div>
                      </div>

                      <div className="recipe-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(recipe)}
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(recipe.id)}
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import PlanAccess from "../components/PlanAccess";
import "./Recipes.css";

export default function Recipes() {
  const [user] = useAuthState(auth);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("tümü");
  const [selectedTargetGroup, setSelectedTargetGroup] = useState("tümü");
  const [customization, setCustomization] = useState({
    servingSize: 1,
    dietType: "normal",
    allergies: []
  });
  const [userPlan, setUserPlan] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Kategori listesi
  const categories = ["tümü", "tavuk", "balık", "vegan", "yumurta", "içecek"];

  // Hedef grup listesi
  const targetGroups = [
    { key: "tümü", label: "Tümü" },
    { key: "diabetes", label: "🏥 Diyabet Hastası" },
    { key: "weight_loss", label: "⬇️ Kilo Verme" },
    { key: "weight_gain", label: "⬆️ Kilo Alma" },
    { key: "muscle_gain", label: "💪 Kas Gelişimi" },
    { key: "maintain", label: "⚖️ Stabil Kalma" },
    { key: "healthy_lifestyle", label: "💚 Sağlıklı Yaşam" },
    { key: "diet", label: "📋 Beslenme" },
    { key: "vegetarian", label: "🥬 Vejetaryen" }
  ];

  // Kullanıcı planını kontrol et ve favori tariflerini yükle
  useEffect(() => {
    if (!user) return;

    const loadRecipes = async () => {
      try {
        setLoading(true);

        // Kullanıcı bilgilerini yükle
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPlan(userData.plan || "free");
          setFavoriteRecipes(userData.favoriteRecipes || []);
        }

        // Firestore'dan tarifler yükle
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
        setError("Tarifler yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [user]);

  // Ekran boyutuna göre mobil görünüm kontrolü
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handleChange = e => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowFilters(false);
    }
  }, [isMobile]);

  const sidebarContent = (
    <>
      {/* Tarif Arama */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tarif ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title="Aramayı temizle"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Kategoriler */}
      <div className="filter-section">
        <h3>🍳 Kategoriler</h3>
        <div className="category-buttons">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedRecipe(null);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Hedef Grup Filtreleme */}
      <div className="filter-section">
        <h3>🎯 Hedef Grup</h3>
        <div className="target-group-buttons">
          {targetGroups.map(group => (
            <button
              key={group.key}
              className={`target-btn ${selectedTargetGroup === group.key ? "active" : ""}`}
              onClick={() => {
                setSelectedTargetGroup(group.key);
                setSelectedRecipe(null);
              }}
              title={group.label}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Özelleştirme Paneli */}
      <div className="customization-section">
        <h3>⚙️ Özelleştirme</h3>
        <div className="custom-option">
          <label>Porsiyon Sayısı</label>
          <div className="portion-control">
            <button onClick={() => setCustomization({...customization, servingSize: Math.max(0.5, customization.servingSize - 0.5)})}>−</button>
            <span>{customization.servingSize}</span>
            <button onClick={() => setCustomization({...customization, servingSize: customization.servingSize + 0.5})}>+</button>
          </div>
        </div>

        <div className="custom-option">
          <label>Diet Türü</label>
          <select 
            value={customization.dietType}
            onChange={(e) => setCustomization({...customization, dietType: e.target.value})}
            className="diet-select"
          >
            <option value="normal">Normal</option>
            <option value="vegan">Vegan</option>
            <option value="glutenFree">Gluten Free</option>
            <option value="keto">Keto</option>
          </select>
        </div>

        <div className="custom-option">
          <label>Alerjiler</label>
          <div className="allergy-checkboxes">
            {["Fındık", "Süt", "Yumurta", "Balık"].map(allergy => (
              <label key={allergy} className="allergy-label">
                <input
                  type="checkbox"
                  checked={customization.allergies.includes(allergy)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCustomization({
                        ...customization,
                        allergies: [...customization.allergies, allergy]
                      });
                    } else {
                      setCustomization({
                        ...customization,
                        allergies: customization.allergies.filter(a => a !== allergy)
                      });
                    }
                  }}
                />
                {allergy}
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // Seçili kategoriye ve hedef gruba göre tarifler
  const filteredRecipes = recipes.filter(recipe => {
    const categoryMatch = selectedCategory === "tümü" || recipe.category === selectedCategory;
    const targetGroupMatch = selectedTargetGroup === "tümü" ||
      (recipe.targetGroups && recipe.targetGroups.includes(selectedTargetGroup));
    const searchMatch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.category && recipe.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && targetGroupMatch && searchMatch;
  });

  // Özelleştirme hesaplaması
  const calculateCustomized = (recipe) => {
    const multiplier = customization.servingSize / recipe.servings;
    return {
      calories: Math.round(recipe.calories * multiplier),
      protein: Math.round(recipe.protein * multiplier),
      carbs: Math.round(recipe.carbs * multiplier),
      fat: Math.round(recipe.fat * multiplier)
    };
  };

  if (loading) {
    return <div className="recipes-loading">⏳ Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="recipes-error">
        <div className="error-box">
          <h2>❌ Hata Oluştu</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlanAccess requiredPlan="premium">
      <div className="recipes-container">
        <header className="recipes-header">
          <div className="header-content">
            <h1>🍽️ Yemek Tarifleri & Özelleştirme</h1>
            <p>Premium üyelerimiz için özel olarak hazırlanmış, besin bilgisi hesaplanmış tarifler</p>
          </div>
        </header>

        <div className="recipes-layout">
          {/* Mobil filtre aç/kapat */}
          {isMobile && (
            <div className="mobile-filter-toggle">
              <button onClick={() => setShowFilters(true)}>🔍 Filtreleri Aç</button>
            </div>
          )}

          {/* Sol Panel - Kategori ve Filtreler */}
          {!isMobile && (
            <aside className="recipes-sidebar">
              {sidebarContent}
            </aside>
          )}

          {/* Mobil filtre modal */}
          {isMobile && (
            <div className={`mobile-filter-overlay ${showFilters ? "open" : ""}`}>
              <div className="mobile-filter-backdrop" onClick={() => setShowFilters(false)} />
              <div className="mobile-filter-dialog">
                <div className="mobile-filter-header">
                  <h3>Filtreler</h3>
                  <button onClick={() => setShowFilters(false)} className="mobile-filter-close">✕</button>
                </div>
                <div className="mobile-filter-body">
                  {sidebarContent}
                </div>
              </div>
            </div>
          )}

          {/* Orta Panel - Tarif Listesi */}
          <div className="recipes-main">
            {filteredRecipes.length === 0 ? (
              <div className="empty-results">
                <h2>😢 Tarif Bulunamadı</h2>
                <p>Seçilen kriterlere uygun tarif bulunmamaktadır. Filtrelerinizi değiştirerek tekrar deneyin.</p>
              </div>
            ) : (
              <div className="recipes-grid">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className={`recipe-card ${selectedRecipe?.id === recipe.id ? "selected" : ""}`}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="recipe-header">
                      <span className="recipe-image">{recipe.image || "🍽️"}</span>
                      <span className="recipe-badges">
                        {recipe.vegan && <span className="badge vegan">Vegan</span>}
                        {recipe.glutenFree && <span className="badge gluten-free">GF</span>}
                      </span>
                    </div>
                    <h3>{recipe.name}</h3>
                    <div className="recipe-quick-info">
                      <span>⏱️ {recipe.prepTime} dk</span>
                      <span>🔥 {recipe.calories} kcal</span>
                    </div>
                    <div className="recipe-macros-mini">
                      <span>P: {recipe.protein}g</span>
                      <span>C: {recipe.carbs}g</span>
                      <span>F: {recipe.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Panel - Tarif Detayı */}
          {selectedRecipe && (
            <aside className={`recipes-detail ${isMobile ? "show-mobile" : ""}`}>
              <div className="recipe-detail-container">
                <button 
                  className="close-detail"
                  onClick={() => setSelectedRecipe(null)}
                >
                  ✕
                </button>

                <h2>{selectedRecipe.name}</h2>
                <div className="detail-image">{selectedRecipe.image || "🍽️"}</div>

                {/* Özelleştirilmiş Makrolar */}
                <div className="macros-card">
                  <h3>Besin Bilgisi ({customization.servingSize} porsiyon)</h3>
                  <div className="macros-display">
                    <div className="macro-item">
                      <span className="macro-label">Kalori</span>
                      <span className="macro-value">{calculateCustomized(selectedRecipe).calories}</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Protein</span>
                      <span className="macro-value">{calculateCustomized(selectedRecipe).protein}g</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Karbohidrat</span>
                      <span className="macro-value">{calculateCustomized(selectedRecipe).carbs}g</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-label">Yağ</span>
                      <span className="macro-value">{calculateCustomized(selectedRecipe).fat}g</span>
                    </div>
                  </div>
                </div>

                {/* Malzemeler */}
                <div className="ingredients-section">
                  <h3>Malzemeler</h3>
                  <ul className="ingredients-list">
                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>
                        <span>{ingredient.name}</span>
                        <span className="ingredient-amount">{ingredient.amount} ({ingredient.calories} kcal)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Talimatlar */}
                <div className="instructions-section">
                  <h3>Hazırlama Adımları</h3>
                  <ol className="instructions-list">
                    {selectedRecipe.instructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {/* İşlemler */}
                <div className="recipe-actions">
                  <button 
                    className="btn-save-recipe"
                    onClick={async () => {
                      try {
                        const isFavorite = favoriteRecipes.includes(selectedRecipe.id);
                        if (isFavorite) {
                          await updateDoc(doc(db, "users", user.uid), {
                            favoriteRecipes: arrayRemove(selectedRecipe.id)
                          });
                          setFavoriteRecipes(favoriteRecipes.filter(id => id !== selectedRecipe.id));
                        } else {
                          await updateDoc(doc(db, "users", user.uid), {
                            favoriteRecipes: arrayUnion(selectedRecipe.id)
                          });
                          setFavoriteRecipes([...favoriteRecipes, selectedRecipe.id]);
                        }
                      } catch (error) {
                        console.error("Favori işlemi hatası:", error);
                      }
                    }}
                  >
                    {favoriteRecipes.includes(selectedRecipe.id) ? "⭐ Favoriden Çıkar" : "💾 Favori Ekle"}
                  </button>
                  <button className="btn-share-recipe">📤 Paylaş</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </PlanAccess>
  );
}

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
  const [userAllergies, setUserAllergies] = useState([]); // Kullanıcının profildeki alerjileri
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Kategori listesi
  const categories = [
    { key: "tümü", label: "Tümü" },
    { key: "Tavuk Yemekleri", label: "Tavuk" },
    { key: "Balık Yemekleri", label: "Balık" },
    { key: "Vegan Yemekleri", label: "Vegan" },
    { key: "Yumurta", label: "Yumurta" },
    { key: "İçecekler ve Shakeler", label: "İçecekler" }
  ];

  // Hedef grup listesi (backend'deki tags ile eşleşiyor)
  const targetGroups = [
    { key: "tümü", label: "Tümü" },
    { key: "Diyabet Hastası", label: "🏥 Diyabet Hastası" },
    { key: "Kilo Verme", label: "⬇️ Kilo Verme" },
    { key: "Kilo Alma", label: "⬆️ Kilo Alma" },
    { key: "Kas Gelişimi", label: "💪 Kas Gelişimi" },
    { key: "Stabil Kalma", label: "⚖️ Stabil Kalma" },
    { key: "Sağlıklı Yaşam", label: "💚 Sağlıklı Yaşam" },
    { key: "Beslenme", label: "📋 Beslenme" },
    { key: "Vejetaryen", label: "🥬 Vejetaryen" }
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
          
          // Alerjileri yükle - string'ten array'e dönüştür
          let allergies = userData.allergies || "";
          
          // String ise virgülle ayırıp trim et
          if (typeof allergies === 'string') {
            allergies = allergies
              .split(',')
              .map(item => item.trim())
              .filter(item => item.length > 0);
          }
          
          console.log("🔍 Kullanıcı alerjileri:", allergies, typeof allergies);
          setUserAllergies(allergies); // Kullanıcının alerjilerini yükle
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
              key={cat.key}
              className={`category-btn ${selectedCategory === cat.key ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(cat.key);
                setSelectedRecipe(null);
              }}
            >
              {cat.label}
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
    // Backend'de tags field'i kullanılıyor, targetGroups değil
    const targetGroupMatch = selectedTargetGroup === "tümü" ||
      (recipe.tags && recipe.tags.includes(selectedTargetGroup)) ||
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

                {/* ÖNEMLİ: Kullanıcının Alerjen Uyarısı - EN ÜSTTE */}
                {(() => {
                  // Kullanıcının alerjilerini güvenli şekilde array'e çevir
                  const allergiesArray = Array.isArray(userAllergies) 
                    ? userAllergies 
                    : (userAllergies && typeof userAllergies === 'object' 
                      ? Object.values(userAllergies) 
                      : []);
                  
                  console.log("🔍 DEBUG - Allergies Array:", allergiesArray);
                  console.log("🔍 DEBUG - Recipe Allergens:", selectedRecipe.allergens);
                  
                  // Kullanıcının alerjileri varsa kontrol et
                  if (allergiesArray.length > 0) {
                    // Tarifteki alerjenlerle kullanıcının alerjilerini karşılaştır
                    const userAllergenMatches = allergiesArray.filter(userAllergy => {
                      const userAllergyStr = String(userAllergy).toLowerCase().trim();
                      
                      if (!selectedRecipe.allergens || selectedRecipe.allergens.length === 0) {
                        return false;
                      }
                      
                      // Kelimeleri ayırıp kontrol et
                      return selectedRecipe.allergens.some(recipeAllergen => {
                        const recipeAllergenStr = String(recipeAllergen).toLowerCase().trim();
                        
                        // İçerip içermediğini kontrol et (iki yönlü)
                        return (
                          recipeAllergenStr.includes(userAllergyStr) ||
                          userAllergyStr.includes(recipeAllergenStr) ||
                          // Kısmi eşleşme
                          (userAllergyStr.split(' ').some(word => recipeAllergenStr.includes(word)) ||
                           recipeAllergenStr.split(' ').some(word => userAllergyStr.includes(word)))
                        );
                      });
                    });

                    console.log("🔍 DEBUG - Matches:", userAllergenMatches);

                    // Eşleşme varsa uyarı göster
                    if (userAllergenMatches.length > 0) {
                      return (
                        <div className="user-allergen-warning">
                          <h4>🚨 DİKKAT! Alerjik Reaksiyon Riski</h4>
                          <p className="warning-message">
                            Bu tarif sizin alerjiniz olan şu içerikleri barındırıyor:
                          </p>
                          <ul className="allergen-list">
                            {userAllergenMatches.map((allergen, idx) => (
                              <li key={idx}>{String(allergen)}</li>
                            ))}
                          </ul>
                          <p className="safety-note">
                            ⚕️ Sağlığınız bizim için önceliklidir. Bu tarifi tüketmeden önce doktorunuza danışmanızı öneririz.
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

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
                        <span>{ingredient.name || ingredient}</span>
                        <span className="ingredient-amount">
                          {ingredient.amount && `${ingredient.amount}`}
                          {ingredient.notes && <small> ({ingredient.notes})</small>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Talimatlar */}
                <div className="instructions-section">
                  <h3>Hazırlama Adımları</h3>
                  <ul className="instructions-list">
                    {selectedRecipe.instructions.map((instruction, idx) => (
                      <li key={idx}>
                        <strong>{instruction.title}</strong>
                        <p>{instruction.description || instruction}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* İpuçları */}
                {selectedRecipe.tips && selectedRecipe.tips.length > 0 && (
                  <div className="tips-section">
                    <h3>💡 İpuçları</h3>
                    <ul className="tips-list">
                      {selectedRecipe.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Özel Özellikler */}
                {selectedRecipe.description && (
                  <div className="description-section">
                    <h3>📝 Tarif Hakkında</h3>
                    <p>{selectedRecipe.description}</p>
                  </div>
                )}

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

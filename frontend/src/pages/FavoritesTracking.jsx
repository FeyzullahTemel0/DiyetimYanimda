import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import './FavoritesTracking.css';

function FavoritesTracking() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState('all'); // all, tavuk, balık, vegan, yumurta, içecek
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          // Kullanıcı favori tarif ID'lerini çek
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          const favIds = userData?.favoriteRecipes || [];
          setUserFavorites(favIds);

          // Tüm tarifleri çek
          const recipesSnap = await getDocs(collection(db, 'recipes'));
          const recipesData = recipesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAllRecipes(recipesData);

          // Favori tarifleri filtrele
          const favorites = recipesData.filter(r => favIds.includes(r.id));
          setFavoriteRecipes(favorites);

        } catch (err) {
          console.error("Favori tarifler yüklenirken hata:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Favori tariflerinizi görmek için giriş yapmalısınız.");
      }
    });

    return () => unsubscribe();
  }, []);

  const removeFavorite = async (recipeId) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);

    // Önce UI'dan kaldır
    setFavoriteRecipes(current => current.filter(r => r.id !== recipeId));
    setUserFavorites(current => current.filter(id => id !== recipeId));

    // Firestore'dan kaldır
    try {
      await updateDoc(userRef, { favoriteRecipes: arrayRemove(recipeId) });
    } catch (err) {
      console.error("Favori kaldırma hatası:", err);
      alert("Favori tarif kaldırılırken bir hata oluştu.");
      window.location.reload();
    }
  };

  const handleCardClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const filteredRecipes = filter === 'all' 
    ? favoriteRecipes 
    : favoriteRecipes.filter(r => r.category === filter);
  
  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Favori tarifleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <header className="favorites-header">
        <h1>
          <i className="fa-solid fa-heart"></i>
          Favori Tariflerim
        </h1>
        <p className="subtitle">Beğendiğiniz ve kaydettiğiniz yemek tarifleri</p>
      </header>

      {favoriteRecipes.length > 0 && (
        <div className="filter-bar">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Tümü ({favoriteRecipes.length})
          </button>
          <button 
            className={filter === 'tavuk' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('tavuk')}
          >
            🍗 Tavuk
          </button>
          <button 
            className={filter === 'balık' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('balık')}
          >
            🐟 Balık
          </button>
          <button 
            className={filter === 'vegan' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('vegan')}
          >
            🥗 Vegan
          </button>
          <button 
            className={filter === 'yumurta' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('yumurta')}
          >
            🥚 Yumurta
          </button>
          <button 
            className={filter === 'içecek' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('içecek')}
          >
            🥤 İçecek
          </button>
        </div>
      )}

      {filteredRecipes.length > 0 ? (
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="recipe-card"
              onClick={() => handleCardClick(recipe)}
            >
              <div 
                className="fav-heart filled" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  removeFavorite(recipe.id); 
                }}
                title="Favorilerden çıkar"
              >
                <i className="fa-solid fa-heart"></i>
              </div>
              <div className="recipe-card-header">
                <h3>{recipe.name}</h3>
                <span className="category-badge">{recipe.category}</span>
              </div>
              <p className="recipe-description">{recipe.description}</p>
              <div className="recipe-stats">
                <span><i className="fa-solid fa-fire"></i> {recipe.calories} kcal</span>
                <span><i className="fa-solid fa-clock"></i> {recipe.prepTime} dk</span>
                <span><i className="fa-solid fa-signal"></i> {recipe.difficulty}</span>
              </div>
              <div className="recipe-macros">
                <div className="macro-item">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">{recipe.protein}g</span>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Karb</span>
                  <span className="macro-value">{recipe.carbs}g</span>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Yağ</span>
                  <span className="macro-value">{recipe.fat}g</span>
                </div>
              </div>
              {recipe.vegan && <span className="badge">🌱 Vegan</span>}
              {recipe.glutenFree && <span className="badge">🌾 Glütensiz</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-heart-crack"></i>
          <h3>Henüz favori tarifiniz yok</h3>
          <p>Tarifler sayfasından beğendiğiniz tarifleri kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
          <a href="/recipes" className="cta-btn">
            <i className="fa-solid fa-utensils"></i> Tarifleri Keşfet
          </a>
        </div>
      )}

      {/* Tarif detay modalı */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-content recipe-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRecipe(null)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedRecipe.name}</h2>
              <div className="modal-badges">
                <span className="badge-large">{selectedRecipe.category}</span>
                <span className="badge-large">{selectedRecipe.difficulty}</span>
                {selectedRecipe.vegan && <span className="badge-large">🌱 Vegan</span>}
                {selectedRecipe.glutenFree && <span className="badge-large">🌾 Glütensiz</span>}
                {selectedRecipe.dairyFree && <span className="badge-large">🥛 Laktozsuz</span>}
              </div>
            </div>

            <div className="modal-quick-stats">
              <div className="stat-box">
                <i className="fa-solid fa-fire"></i>
                <span>{selectedRecipe.calories} kcal</span>
              </div>
              <div className="stat-box">
                <i className="fa-solid fa-clock"></i>
                <span>{selectedRecipe.prepTime} dk</span>
              </div>
              <div className="stat-box">
                <i className="fa-solid fa-users"></i>
                <span>{selectedRecipe.servings} kişilik</span>
              </div>
            </div>

            <div className="modal-section">
              <h3><i className="fa-solid fa-chart-pie"></i> Besin Değerleri</h3>
              <div className="macros-detail">
                <div className="macro-detail-item">
                  <span className="macro-detail-label">Protein</span>
                  <div className="macro-bar">
                    <div className="macro-fill protein" style={{width: `${(selectedRecipe.protein / 100) * 100}%`}}></div>
                  </div>
                  <span className="macro-detail-value">{selectedRecipe.protein}g</span>
                </div>
                <div className="macro-detail-item">
                  <span className="macro-detail-label">Karbonhidrat</span>
                  <div className="macro-bar">
                    <div className="macro-fill carbs" style={{width: `${(selectedRecipe.carbs / 100) * 100}%`}}></div>
                  </div>
                  <span className="macro-detail-value">{selectedRecipe.carbs}g</span>
                </div>
                <div className="macro-detail-item">
                  <span className="macro-detail-label">Yağ</span>
                  <div className="macro-bar">
                    <div className="macro-fill fat" style={{width: `${(selectedRecipe.fat / 100) * 100}%`}}></div>
                  </div>
                  <span className="macro-detail-value">{selectedRecipe.fat}g</span>
                </div>
                <div className="macro-detail-item">
                  <span className="macro-detail-label">Lif</span>
                  <div className="macro-bar">
                    <div className="macro-fill fiber" style={{width: `${(selectedRecipe.fiber / 20) * 100}%`}}></div>
                  </div>
                  <span className="macro-detail-value">{selectedRecipe.fiber}g</span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3><i className="fa-solid fa-carrot"></i> Malzemeler</h3>
              <ul className="ingredients-list">
                {selectedRecipe.ingredients?.map((ing, idx) => (
                  <li key={idx}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span><strong>{ing.name}</strong> - {ing.amount} ({ing.calories} kcal)</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-section">
              <h3><i className="fa-solid fa-list-ol"></i> Hazırlanışı</h3>
              <ol className="instructions-list">
                {selectedRecipe.instructions?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {selectedRecipe.tips && (
              <div className="modal-section">
                <h3><i className="fa-solid fa-lightbulb"></i> İpuçları</h3>
                <p className="tips-text">{selectedRecipe.tips}</p>
              </div>
            )}

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedRecipe(null)}
              >
                <i className="fa-solid fa-times"></i> Kapat
              </button>
              <button 
                className="btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(selectedRecipe.id);
                  setSelectedRecipe(null);
                }}
              >
                <i className="fa-solid fa-heart-crack"></i> Favorilerden Çıkar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoritesTracking;

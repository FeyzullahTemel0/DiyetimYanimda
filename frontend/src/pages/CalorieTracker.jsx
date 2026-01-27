import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { searchFoods, POPULAR_FOODS } from "../utils/foodDatabase";
import { useToastContext } from "../contexts/ToastContext";
import "./CalorieTracker.css";

const PLAN_ORDER = ["free", "basic", "premium", "plus"];

export default function CalorieTracker() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [meals, setMeals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [showFoodDropdown, setShowFoodDropdown] = useState(false);
  
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "breakfast"
  });

  // Plan kontrolü
  useEffect(() => {
    const checkPlanAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Profil alınamadı");
        const data = await res.json();
        setUserProfile(data);
        
        // Plan kontrolü: "free" ve üzeri planlar erişebilir
        // Plan adını belirle - yanlış veya boş plan alanları için "free" kullan
        let userPlan = data?.subscription?.plan || "free";
        
        // Plan adının geçerli olup olmadığını kontrol et
        if (!PLAN_ORDER.includes(userPlan)) {
          userPlan = "free";
        }
        
        // Ücretsiz plan dahil tüm planlar erişebilir
        const canAccess = PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf("free");
        setHasAccess(canAccess);
      } catch (error) {
        console.error("Plan kontrolü hatası:", error);
        // Hata durumunda erişimi izin ver (ücretsiz plan olarak kabul et)
        setHasAccess(true);
      } finally {
        setLoading(false);
      }
    };
    checkPlanAccess();
  }, [user]);

  // Geçmiş verileri yükle
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  // Firestore'dan bugünün verilerini çek
  useEffect(() => {
    if (user) {
      loadDailyData();
      loadUserGoal();
    }
  }, [user, selectedDate]);

  const loadHistory = async () => {
    if (!user) {
      console.log("Kullanıcı giriş yapmamış, geçmiş yüklenememiş");
      return;
    }
    setLoadingHistory(true);
    try {
      console.log("Kalori tracker geçmişi yükleniyor, userId:", user.uid);
      
      const q = query(collection(db, "calorieTracker"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      console.log("Geçmiş verisi bulundu:", querySnapshot.docs.length, "belge");
      
      const historyData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log("Sıralanmış geçmiş verileri:", historyData);
      setHistory(historyData);
    } catch (error) {
      console.error("Geçmiş yüklenirken hata:", error);
      showToast('Geçmiş veriler yüklenirken hata oluştu 📊', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadUserGoal = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().calorieGoal) {
        setDailyGoal(userDoc.data().calorieGoal);
      }
    } catch (error) {
      console.error("Hedef yüklenirken hata:", error);
    }
  };

  const loadDailyData = async () => {
    if (!user) {
      console.log("Kullanıcı giriş yapmamış, veri yüklenmemiş");
      return;
    }
    try {
      const docId = `${user.uid}_${selectedDate}`;
      console.log("Yemek verileri yükleniyor:", docId);
      
      const dateDoc = await getDoc(doc(db, "calorieTracker", docId));
      if (dateDoc.exists()) {
        console.log("Yemek verileri bulundu:", dateDoc.data());
        setMeals(dateDoc.data().meals || []);
      } else {
        console.log("Bu tarih için yemek verisi bulunamadı");
        setMeals([]);
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      setMeals([]);
    }
  };

  const saveDailyData = async (updatedMeals) => {
    if (!user) {
      console.error("Kullanıcı kimliği bulunamadı");
      showToast('Kullanıcı kimliği bulunamadı ⚠️', 'error');
      return;
    }
    try {
      const docId = `${user.uid}_${selectedDate}`;
      console.log("Yemek kaydediliyor:", { docId, meals: updatedMeals });
      
      await setDoc(doc(db, "calorieTracker", docId), {
        meals: updatedMeals,
        date: selectedDate,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log("Yemek başarıyla kaydedildi");
      // loadHistory çağrısını kaldırdık - meals state zaten güncellenmiş
    } catch (error) {
      console.error("Veri kaydedilirken hata:", error);
      showToast('Yemek kaydedilirken hata oluştu 💾', 'error');
    }
  };

  // Yemek ara
  const handleFoodSearch = (value) => {
    setNewMeal({ ...newMeal, name: value });
    
    if (value.trim().length > 0) {
      const results = searchFoods(value);
      setFoodSearchResults(results);
      setShowFoodDropdown(true);
    } else {
      setShowFoodDropdown(false);
      setFoodSearchResults([]);
    }
  };

  // Yemek seç ve otomatik doldur
  const handleSelectFood = (food) => {
    setNewMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      mealType: newMeal.mealType
    });
    setShowFoodDropdown(false);
    setFoodSearchResults([]);
  };

  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.calories) {
      showToast('Lütfen yemek adı ve kalori giriniz ⚠️', 'error');
      return;
    }

    const meal = {
      id: Date.now(),
      name: newMeal.name,
      calories: parseFloat(newMeal.calories) || 0,
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fat: parseFloat(newMeal.fat) || 0,
      mealType: newMeal.mealType,
      timestamp: new Date().toISOString()
    };

    const updatedMeals = [...meals, meal];
    setMeals(updatedMeals);
    await saveDailyData(updatedMeals);
    
    // Geçmiş hesaplamalarını güncelle
    await loadHistory();

    setNewMeal({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "breakfast" });
    setShowAddForm(false);
  };

  const handleDeleteMeal = (id) => {
    const updatedMeals = meals.filter(m => m.id !== id);
    setMeals(updatedMeals);
    saveDailyData(updatedMeals);
  };

  const handleDeleteHistoryItem = async (historyId) => {
    if (window.confirm("Bu günün verilerini silmek istediğinize emin misiniz?")) {
      try {
        console.log("Siliniyor:", historyId);
        await deleteDoc(doc(db, "calorieTracker", historyId));
        console.log("Başarıyla silindi");
        
        await loadHistory();
        if (historyId === `${user.uid}_${selectedDate}`) {
          setMeals([]);
        }
        showToast('Veri başarıyla silindi! 🗑️', 'success');
      } catch (error) {
        console.error("Silme işleminde hata:", error);
        showToast('Silme işleminde hata oluştu ⚠️', 'error');
      }
    }
  };

  const handleDeleteMealFromHistory = async (historyItem, mealId) => {
    if (!window.confirm("Bu yemeği silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      const updatedMeals = historyItem.meals.filter(m => m.id !== mealId);
      
      // Eğer hiç yemek kalmadıysa, tüm günü sil
      if (updatedMeals.length === 0) {
        await deleteDoc(doc(db, "calorieTracker", historyItem.id));
        setSelectedHistoryItem(null);
        showToast('Son yemek silindi, gün kaydı kaldırıldı 📅', 'info');
      } else {
        // Yemekleri güncelle
        await setDoc(
          doc(db, "calorieTracker", historyItem.id),
          {
            meals: updatedMeals,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        
        // Modal'daki item'i güncelle
        setSelectedHistoryItem({
          ...historyItem,
          meals: updatedMeals
        });
        
        showToast('Yemek silindi! 🍽️', 'success');
      }
      
      // History'yi yenile
      await loadHistory();
      
      // Eğer şu anki seçili tarihse, meals state'ini de güncelle
      if (historyItem.date === selectedDate) {
        setMeals(updatedMeals);
      }
    } catch (error) {
      console.error("Yemek silinirken hata:", error);
      showToast('Yemek silinirken hata oluştu ⚠️', 'error');
    }
  };

  const handleDeleteAllHistory = async () => {
    if (window.confirm("TÜM verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      try {
        console.log("Tüm veriler siliniyor...");
        for (const item of history) {
          await deleteDoc(doc(db, "calorieTracker", item.id));
        }
        console.log("Tüm veriler başarıyla silindi");
        await loadHistory();
        setMeals([]);
        showToast('Tüm veriler başarıyla silindi! 🗑️', 'success');
      } catch (error) {
        console.error("Toplu silme işleminde hata:", error);
        showToast('Toplu silme işleminde hata oluştu ⚠️', 'error');
      }
    }
  };

  const handleGoalChange = async () => {
    const newGoal = prompt("Günlük kalori hedefinizi girin:", dailyGoal);
    if (newGoal && !isNaN(newGoal)) {
      setDailyGoal(parseInt(newGoal));
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), { calorieGoal: parseInt(newGoal) }, { merge: true });
        } catch (error) {
          console.error("Hedef güncellenirken hata:", error);
        }
      }
    }
  };

  const loadHistoryDay = (historyItem) => {
    setSelectedDate(historyItem.date);
    setMeals(historyItem.meals || []);
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);
  const remaining = dailyGoal - totalCalories;
  const percentage = Math.min((totalCalories / dailyGoal) * 100, 100);

  const mealTypeLabels = {
    breakfast: "🌅 Kahvaltı",
    lunch: "🍽️ Öğle Yemeği",
    dinner: "🌙 Akşam Yemeği",
    snack: "🍎 Ara Öğün"
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) acc[meal.mealType] = [];
    acc[meal.mealType].push(meal);
    return acc;
  }, {});

  // Giriş yapılmamış
  if (!user) {
    return (
      <div className="calorie-tracker-page">
        <header className="tracker-header">
          <h1>📊 Günlük Kalori Tracker</h1>
          <p>Yediklerinizi takip edin, hedeflerinize ulaşın</p>
        </header>
        <div className="service-guard">
          <h2>Bu hizmeti kullanmak için giriş yapmalısınız.</h2>
          <button className="btn-nav btn-primary" onClick={() => navigate("/login")}>
            Giriş Yap
          </button>
          <Link to="/register" className="btn-nav btn-secondary" style={{ marginLeft: "1rem" }}>
            Kayıt Ol
          </Link>
        </div>
      </div>
    );
  }

  // Yükleniyor
  if (loading) {
    return (
      <div className="calorie-tracker-page">
        <header className="tracker-header">
          <h1>📊 Günlük Kalori Tracker</h1>
          <p>Yediklerinizi takip edin, hedeflerinize ulaşın</p>
        </header>
        <div className="service-guard">
          <h2>Verileriniz kontrol ediliyor...</h2>
          <p>Lütfen bekleyiniz.</p>
        </div>
      </div>
    );
  }

  // Plan kontrolü - Erişimi olmayan kullanıcı
  if (!hasAccess) {
    // Plan adını doğru şekilde al
    let displayPlan = "FREE";
    let userPlan = userProfile?.subscription?.plan || "free";
    if (PLAN_ORDER.includes(userPlan)) {
      displayPlan = userPlan.toUpperCase();
    }
    
    return (
      <div className="calorie-tracker-page">
        <header className="tracker-header">
          <h1>📊 Günlük Kalori Tracker</h1>
          <p>Yediklerinizi takip edin, hedeflerinize ulaşın</p>
        </header>
      <div className="service-guard">
          <h2>Bu hizmet tüm planlar içindir.</h2>
          <p>Mevcut planınız: <strong>{displayPlan}</strong></p>
          <p>Bu sayfaya erişmek için en azından Ücretsiz Plan'a ihtiyacınız vardır.</p>
          <Link to="/pricing" className="btn-nav btn-primary">Planları Görüntüle</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="calorie-tracker-page">
      <header className="tracker-header">
        <h1>📊 Günlük Kalori Tracker</h1>
        <p>Yediklerinizi takip edin, hedeflerinize ulaşın</p>
      </header>

      {/* Özet Kartı */}
      <div className="summary-card">
        <div className="summary-main">
          {/* Tarih Seçici - Kalori Dairesinin Solunda */}
          <div className="date-selector-inline">
            <label>Tarih:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="calorie-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="calorie-center">
              <span className="calorie-value">{totalCalories}</span>
              <span className="calorie-unit">kcal</span>
            </div>
          </div>
          
          <div className="summary-details">
            <div className="summary-row">
              <span className="label">Hedef:</span>
              <span className="value">{dailyGoal} kcal</span>
              <button className="btn-edit-goal" onClick={handleGoalChange}>✏️</button>
            </div>
            <div className="summary-row">
              <span className="label">Kalan:</span>
              <span className={`value ${remaining < 0 ? 'over' : ''}`}>
                {remaining > 0 ? remaining : 0} kcal
              </span>
            </div>
            {remaining < 0 && (
              <div className="summary-row warning">
                <span className="label">Aşılan:</span>
                <span className="value over">{Math.abs(remaining)} kcal</span>
              </div>
            )}
          </div>
        </div>

        {/* Makro Özeti */}
        <div className="macro-summary">
          <div className="macro-item">
            <div className="macro-icon">🥩</div>
            <div className="macro-info">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{totalProtein.toFixed(1)}g</span>
            </div>
          </div>
          <div className="macro-item">
            <div className="macro-icon">🍞</div>
            <div className="macro-info">
              <span className="macro-label">Karbonhidrat</span>
              <span className="macro-value">{totalCarbs.toFixed(1)}g</span>
            </div>
          </div>
          <div className="macro-item">
            <div className="macro-icon">🥑</div>
            <div className="macro-info">
              <span className="macro-label">Yağ</span>
              <span className="macro-value">{totalFat.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yemek Ekleme Butonu */}
      <div className="add-meal-section">
        <button className="btn-add-meal" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "❌ İptal" : "➕ Yemek Ekle"}
        </button>
      </div>

      {/* Yemek Ekleme Formu */}
      {showAddForm && (
        <div className="add-meal-form">
          <h3>Yeni Yemek Ekle</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Öğün Türü</label>
              <select value={newMeal.mealType} onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}>
                <option value="breakfast">Kahvaltı</option>
                <option value="lunch">Öğle Yemeği</option>
                <option value="dinner">Akşam Yemeği</option>
                <option value="snack">Ara Öğün</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Yemek Adı *</label>
              <div className="food-search-wrapper">
                <input
                  type="text"
                  placeholder="Örn: Izgara Tavuk"
                  value={newMeal.name}
                  onChange={(e) => handleFoodSearch(e.target.value)}
                  autoComplete="off"
                />
                {showFoodDropdown && foodSearchResults.length > 0 && (
                  <div className="food-dropdown">
                    {foodSearchResults.map((food, idx) => (
                      <div
                        key={idx}
                        className="food-item"
                        onClick={() => handleSelectFood(food)}
                      >
                        <div className="food-name">{food.name}</div>
                        <div className="food-calories">{food.calories} kcal</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Kalori (kcal) *</label>
              <input
                type="number"
                placeholder="250"
                value={newMeal.calories}
                onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                placeholder="30"
                value={newMeal.protein}
                onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Karbonhidrat (g)</label>
              <input
                type="number"
                placeholder="20"
                value={newMeal.carbs}
                onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Yağ (g)</label>
              <input
                type="number"
                placeholder="10"
                value={newMeal.fat}
                onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
              />
            </div>
          </div>
          <button className="btn-save-meal" onClick={handleAddMeal}>💾 Kaydet</button>
        </div>
      )}

      {/* GEÇMİŞ HESAPLAMALARIM */}
      <div className="history-section">
        <div className="history-header">
          <h2>📋 Geçmiş Hesaplamalarım</h2>
          {history.length > 0 && (
            <button 
              className="btn-delete-all" 
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            >
              🗑️ Hepsini Sil
            </button>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm">
            <p>Tüm hesaplama verilerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz!</p>
            <div className="confirm-buttons">
              <button className="btn-confirm-delete" onClick={handleDeleteAllHistory}>
                Evet, Hepsini Sil
              </button>
              <button className="btn-cancel-delete" onClick={() => setShowDeleteConfirm(false)}>
                İptal
              </button>
            </div>
          </div>
        )}

        {loadingHistory ? (
          <div className="loading">Veriler yükleniyor...</div>
        ) : history.length === 0 ? (
          <div className="empty-history">
            <p>Henüz kayıtlı hesaplama bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => {
              const itemTotal = (item.meals || []).reduce((sum, m) => sum + m.calories, 0);
              const itemProtein = (item.meals || []).reduce((sum, m) => sum + m.protein, 0);
              const itemCarbs = (item.meals || []).reduce((sum, m) => sum + m.carbs, 0);
              const itemFat = (item.meals || []).reduce((sum, m) => sum + m.fat, 0);
              const itemMealCount = item.meals ? item.meals.length : 0;

              return (
                <div key={item.id} className="history-item">
                  <div className="history-date">
                    <span className="date-text">
                      {new Date(item.date).toLocaleDateString('tr-TR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="meal-count">{itemMealCount} öğün</span>
                  </div>
                  <div className="history-stats">
                    <div className="stat">
                      <span className="stat-label">Kalori</span>
                      <span className="stat-value">{itemTotal} kcal</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Protein</span>
                      <span className="stat-value">{itemProtein.toFixed(0)}g</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Karb</span>
                      <span className="stat-value">{itemCarbs.toFixed(0)}g</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Yağ</span>
                      <span className="stat-value">{itemFat.toFixed(0)}g</span>
                    </div>
                  </div>
                  <div className="history-actions">
                    <button 
                      className="btn-load-history" 
                      onClick={() => loadHistoryDay(item)}
                      title="Bu günün verilerini yükle"
                    >
                      📂 Yükle
                    </button>
                    <button 
                      className="btn-view-history"
                      onClick={() => setSelectedHistoryItem(item)}
                      title="Bu günün detaylarını göster"
                    >
                      👁️ Detay
                    </button>
                    <button 
                      className="btn-delete-history" 
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      title="Bu günün verilerini sil"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Geçmiş Item Modal */}
      {selectedHistoryItem && (
        <div className="history-modal-overlay" onClick={() => setSelectedHistoryItem(null)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {new Date(selectedHistoryItem.date).toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <button 
                className="btn-close-modal"
                onClick={() => setSelectedHistoryItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {(!selectedHistoryItem.meals || selectedHistoryItem.meals.length === 0) ? (
                <p className="empty-meals">Bu gün için kayıtlı yemek bulunmamaktadır.</p>
              ) : (
                <div className="modal-meals-list">
                  {selectedHistoryItem.meals.map((meal) => (
                    <div key={meal.id} className="modal-meal-card">
                      <div className="modal-meal-header">
                        <span className="meal-type-badge">
                          {meal.mealType === 'breakfast' && '🌅'}
                          {meal.mealType === 'lunch' && '🍽️'}
                          {meal.mealType === 'dinner' && '🌙'}
                          {meal.mealType === 'snack' && '🍎'}
                          {meal.mealType === 'breakfast' && ' Kahvaltı'}
                          {meal.mealType === 'lunch' && ' Öğle Yemeği'}
                          {meal.mealType === 'dinner' && ' Akşam Yemeği'}
                          {meal.mealType === 'snack' && ' Ara Öğün'}
                        </span>
                        <button 
                          className="btn-delete-meal-modal"
                          onClick={() => handleDeleteMealFromHistory(selectedHistoryItem, meal.id)}
                          title="Bu yemeği sil"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="modal-meal-details">
                        <div className="meal-detail-row">
                          <span className="detail-label">Yemek:</span>
                          <span className="detail-value">{meal.name}</span>
                        </div>
                        <div className="meal-detail-row">
                          <span className="detail-label">Kalori:</span>
                          <span className="detail-value">{meal.calories} kcal</span>
                        </div>
                        <div className="meal-detail-row">
                          <span className="detail-label">Protein:</span>
                          <span className="detail-value">{meal.protein}g</span>
                        </div>
                        <div className="meal-detail-row">
                          <span className="detail-label">Karbonhidrat:</span>
                          <span className="detail-value">{meal.carbs}g</span>
                        </div>
                        <div className="meal-detail-row">
                          <span className="detail-label">Yağ:</span>
                          <span className="detail-value">{meal.fat}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-close-modal-btn"
                onClick={() => setSelectedHistoryItem(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İpuçları */}
      <div className="tips-section">
        <h3>💡 İpuçları</h3>
        <ul>
          <li>Düzenli takip yaparak kalori hedeflerinize kolayca ulaşın</li>
          <li>Makro besinlerin dengeli dağılımına dikkat edin</li>
          <li>Öğün saatlerini atlamayın, metabolizmanızı hızlı tutun</li>
          <li>Hedef kalorinizdeki ±200 kcal sapma normal kabul edilir</li>
          <li>Geçmiş verilerinizi inceleyerek ilerlemenizi takip edin</li>
        </ul>
      </div>
    </div>
  );
}

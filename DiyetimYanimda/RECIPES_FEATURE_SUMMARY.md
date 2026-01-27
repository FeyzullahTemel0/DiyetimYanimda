# Yemek Tariflerine Erişim ve Özelleştirme - Uygulama Özeti

## 📋 Genel Bakış
Premium planı yapısında yeni bir özellik olan **"Yemek Tariflerine Erişim ve Özelleştirme"** sayfası oluşturulmuştur. Bu sayfa, kullanıcılara kapsamlı tarif kütüphanesi, filtreleme seçenekleri, besin bilgisi hesaplaması ve favori tarifler özelliği sunar.

---

## 🎨 Frontend Uygulaması

### 1. **Recipes.jsx** - Ana Tarif Sayfası
**Dosya Konumu:** `frontend/src/pages/Recipes.jsx`

**Özellikleri:**
- ✅ PlanAccess bileşeni ile premium kontrolü
- ✅ 5 örnek tarif (tavuk, balık, vegan, keto, low-carb kategorilerine ayrılmış)
- ✅ 3 panel layout: sol (filtreleme), orta (tarif listesi), sağ (tarif detayı)
- ✅ Dinamik porsiyon hesaplaması (0.5 - ∞ arası ayarlanabilir)
- ✅ Diet türü seçimi (Normal, Vegan, Gluten Free, Keto)
- ✅ Alerji seçenekleri (Fındık, Süt, Yumurta, Balık)
- ✅ Kategori filtreleme
- ✅ Favori tarifler (Firestore'a kaydedilir)

**State Yönetimi:**
```javascript
const [recipes, setRecipes] = useState([]);
const [selectedRecipe, setSelectedRecipe] = useState(null);
const [selectedCategory, setSelectedCategory] = useState("tümü");
const [customization, setCustomization] = useState({
  servingSize: 1,
  dietType: "normal",
  allergies: []
});
const [favoriteRecipes, setFavoriteRecipes] = useState([]);
const [userPlan, setUserPlan] = useState(null);
```

**Anahtar Fonksiyonlar:**
- `calculateCustomized()` - Porsiyon sayısına göre makro hesaplaması
- Favori tarif kaydetme/çıkarma (Firestore integrasyon)

### 2. **Recipes.css** - Stil Dosyası
**Dosya Konumu:** `frontend/src/pages/Recipes.css`

**Stil Özellikleri:**
- 📱 Responsive tasarım (1600px, 1024px, 768px, 480px breakpoints)
- 🎨 Gradient arka planlar ve border renkler (#4ca175 yeşil tema)
- ✨ Hover efektleri ve smooth transitions
- 🔄 Sticky sidebar ve detail paneli
- 📊 Makro display kartları
- 🏷️ Badge sistemi (Vegan, Gluten Free vb.)

**Önemli CSS Sınıfları:**
```css
.recipes-container          /* Ana konteyner */
.recipes-layout             /* 3 panel grid */
.recipes-sidebar            /* Sol filtre paneli */
.recipes-main               /* Orta tarif grid */
.recipes-detail             /* Sağ detay paneli */
.recipe-card                /* Tarif kartları */
.macros-card                /* Besin bilgisi kartı */
```

### 3. **recipeService.js** - API Servisi
**Dosya Konumu:** `frontend/src/services/recipeService.js`

**API Fonksiyonları:**
```javascript
getRecipes(category, filters)              // Tarifler listesi
getRecipeDetail(recipeId)                  // Tarif detayı
toggleFavoriteRecipe(recipeId, isFavorite) // Favori toggle
getFavoriteRecipes()                       // Kullanıcı favori tarifler
getRecipeSuggestions(cal, diet, allergies) // Özelleştirilmiş öneriler
```

---

## 🔧 Backend Uygulaması

### 1. **routes/recipes.js** - Tarif API Endpoints
**Dosya Konumu:** `backend/src/routes/recipes.js`

**API Endpoints:**
```
GET  /api/recipes                    - Tüm tarifler (kategori/filtre)
GET  /api/recipes/:id                - Tarif detayı
POST /api/recipes/:id/favorite       - Tarifin favorisini kaydet
DELETE /api/recipes/:id/favorite     - Tarifin favorisini sil
GET  /api/recipes/user/favorites     - Kullanıcı favori tarifler
POST /api/recipes/suggest            - Özelleştirilmiş öneriler
```

**Tarif Veri Modeli:**
```javascript
{
  id: number,
  name: string,
  category: "tavuk" | "balık" | "vegan" | "low-carb" | "keto",
  calories: number,
  protein: number,        // gram
  carbs: number,         // gram
  fat: number,           // gram
  prepTime: number,      // dakika
  servings: number,
  ingredients: [{
    name: string,
    amount: string,
    calories: number
  }],
  instructions: string[],
  difficulty: "kolay" | "orta" | "zor",
  vegan: boolean,
  glutenFree: boolean,
  dairyFree: boolean,
  tags: string[]
}
```

**Önemli Fonksiyonlar:**
- Kategori filtresi
- Vegan/Gluten Free/Dairy Free kontrol
- Favori tarifler Firestore entegrasyonu
- Kalori hedefine göre akıllı tarif önerileri

### 2. **index.js** - Route Kaydı
**Değişiklik:** `backend/src/index.js`

```javascript
const recipesRoutes = require("./routes/recipes");
app.use("/api/recipes", recipesRoutes);
```

---

## 📊 Veri Yapısı - Firestore

### Users Collection - favoriteRecipes Alanı
```javascript
users/{userId} {
  ...
  favoriteRecipes: [1, 3, 5],  // Tarif IDs
  plan: "premium",              // Premium plan kontrolü
  ...
}
```

---

## 🔐 Güvenlik & Erişim Kontrolü

### Premium Plan Kontrolü
- **Frontend:** `PlanAccess` bileşeni ile sayfa korunuyor
  ```jsx
  <PlanAccess requiredPlan="premium">
    {/* Sayfa içeriği */}
  </PlanAccess>
  ```

- **Backend:** `verifyToken` middleware ile API korunuyor
  ```javascript
  router.get("/", verifyToken, async (req, res) => {
    // Gelen istek kontrol edilir
  });
  ```

---

## 🎯 Kullanıcı Akışı

### 1️⃣ Premium Kullanıcı Sayfaya Erişirse:
- HomePage → Tarifler Linki → `/recipes` yönlendirmesi
- Premium plan kontrolü yapılır
- Firestore'dan kullanıcının favori tarifler yüklenir

### 2️⃣ Tarifler Sayfasında:
- Kategori seçimi yapılır
- Filtreleme seçenekleri uygulanır (vegan, gluten-free, alerji)
- Tarif kartından seçilir
- Detay panelinde besin bilgisi gösterilir
- Porsiyon sayısı değiştirilerek makrolar dinamik hesaplanır
- ⭐ Favori butonuyla Firestore'a kaydedilir

### 3️⃣ Profil Entegrasyonu (İleride):
- Profile sayfasında "Favori Tariflerim" tabı
- Kaydedilen tarifler listelenir
- Hızlı erişim sağlanır

---

## 📱 Responsive Tasarım

### Desktop (1600px+)
- 3 panel layout (sidebar + main + detail)
- Sticky paneller

### Tablet (1024px)
- Sidebar + main görünüm
- Detail paneli kapalı (seçilince modal benzeri)

### Mobile (768px)
- Full width tarif grid
- Sidebar kartlar hale dönüşür
- Stack layout

### Mobil Cihaz (480px)
- Tek sütun layout
- Tüm elementler optimize edilmiş

---

## 🚀 Gelecek Geliştirmeler

1. **Backend Tarif Veritabanı**
   - Tarifler Firestore'da saklanabilir
   - Admin panelden tarif yönetimi
   - Dinamik tarif ekleme/düzenleme

2. **Gelişmiş Filtreleme**
   - Zaman bazlı filtreleme
   - Difficulty level
   - Arama fonksiyonu
   - Tags ile filtreleme

3. **Şef Notları**
   - Kullanıcılar tarife not ekleyebilir
   - Kişisel modifikasyonlar kaydedilebilir

4. **Beslenme Takibi Entegrasyonu**
   - Tarifler CalorieTracker'a eklenebilir
   - Günlük makro planlaması

5. **Sosyal Özellikler**
   - Tarifler paylaşılabilir
   - Yorum/rating sistemi
   - Kullanıcı tarafından oluşturulan tarifler

6. **Resimler**
   - Her tarif için yüksek kaliteli fotoğraf
   - CDN entegrasyonu

---

## ✅ Tamamlanan Görevler

- [x] Frontend Recipes.jsx sayfası
- [x] Responsive CSS tasarımı
- [x] Backend recipes.js route'u
- [x] Firestore favori tarifler entegrasyonu
- [x] Dinamik porsiyon hesaplaması
- [x] Diet türü filtreleme
- [x] Alerji yönetimi
- [x] API servisi oluşturması
- [x] Backend index.js güncellemesi
- [x] Premium plan koruması

---

## 🔗 İlgili Dosyalar

**Frontend:**
- `frontend/src/pages/Recipes.jsx`
- `frontend/src/pages/Recipes.css`
- `frontend/src/services/recipeService.js`
- `frontend/src/components/PlanAccess.jsx`

**Backend:**
- `backend/src/routes/recipes.js`
- `backend/src/index.js`
- `backend/src/middleware/verifyToken.js`

**Firebase:**
- `users/{userId}/favoriteRecipes` (array)

---

## 📞 Destek ve Hata Ayıklama

### Yaygın Sorunlar:

**1. Tarifler yüklenmiyor:**
- Backend sunucusunun çalıştığından emin olun
- API_URL çevre değişkenini kontrol edin
- Token'ın geçerli olup olmadığını kontrol edin

**2. Favori kaydetme başarısız:**
- Firestore kurallarını kontrol edin
- Kullanıcı UID'sinin doğru olup olmadığını kontrol edin
- Network bağlantısını kontrol edin

**3. Styling sorunları:**
- CSS dosyasının import edilip edilmediğini kontrol edin
- Responsive breakpoints kontrol edin
- Browser cache'i temizleyin

---

## 📄 Sürüm Bilgisi

- **Versiyon:** 1.0.0
- **Tarih:** Ocak 2026
- **Status:** ✅ Production Ready
- **Premium Plan:** Gerekli

---


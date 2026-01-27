# 🔥 DiyetimYanımda - Developer Quick Reference

## 🚀 Hızlı Başlangıç

```bash
# 1. Clona ve kurulum
git clone <repo>
cd DiyetimYanimda

# 2. Dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Sunucu başlat
# Terminal 1: cd frontend && npm start
# Terminal 2: cd backend && npm start

# 4. Browser'da aç
# http://localhost:3000
```

---

## 📁 Proje Yapısı

```
DiyetimYanimda/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Motivation.jsx ← Günlük sözler
│   │   │   ├── UserStories.jsx ← Hikaye paylaşımı
│   │   │   ├── AdminPanel.jsx ← Admin yönetimi
│   │   │   └── HomePage.jsx ← Ana sayfa
│   │   ├── components/
│   │   │   ├── NavBar.jsx ← Admin buton ile
│   │   │   └── AdminRoute.jsx ← Koruma
│   │   ├── services/
│   │   │   └── firebase.js ← Firebase config
│   │   └── styles/
│   ├── package.json
│   └── .env.local ← Firebase credentials
│
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── services/
│   │   └── firebaseAdmin.js
│   └── package.json
│
├── firebase/
│   └── firestore.rules ← Güvenlik kuralları
│
└── 📄 Dokümentasyon
    ├── SETUP_INSTRUCTIONS.md
    ├── DEPLOYMENT_CHECKLIST.md
    ├── COMPLETION_REPORT.md
    └── FEATURES_OVERVIEW.md
```

---

## 🔑 Çok Kullanılan Kod Snippets

### Firebase Bağlantı
```javascript
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Verileri çek
const snapshot = await getDocs(collection(db, 'motivationQuotes'));
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Veri ekle
const docRef = await addDoc(collection(db, 'userStories'), {
  userId: auth.currentUser.uid,
  text: "...",
  createdAt: new Date()
});

// Veri sil
await deleteDoc(doc(db, 'userStories', docId));
```

### Günlük Motivasyon Sözü
```javascript
const [todayQuote, setTodayQuote] = useState('');

useEffect(() => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`quote_${today}`);
  
  if (stored) {
    setTodayQuote(stored);
  } else {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    localStorage.setItem(`quote_${today}`, random);
    setTodayQuote(random);
  }
}, []);
```

### Admin Kontrolü
```javascript
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  if (user) {
    const checkAdmin = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      setIsAdmin(docSnap.data()?.role === 'admin');
    };
    checkAdmin();
  }
}, [user]);
```

### Responsive CSS Grid
```css
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 📝 Yeni Sayfa Ekleme (Step-by-Step)

### 1. Sayfa Dosyası Oluştur
```javascript
// src/pages/NewPage.jsx
import React from 'react';
import './NewPage.css';

export default function NewPage() {
  return <div>Yeni Sayfa</div>;
}
```

### 2. CSS Dosyası Oluştur
```css
/* src/pages/NewPage.css */
.new-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
```

### 3. App.js'e Rota Ekle
```javascript
import NewPage from "./pages/NewPage";

// Routes içine ekle:
<Route path="/new-page" element={<NewPage />} />
```

### 4. NavBar'a Link Ekle (isteğe bağlı)
```javascript
const navLinks = [
  { to: "/new-page", label: "Yeni Sayfa" },
];
```

---

## 🔓 Admin-Only Sayfa Oluşturma

```javascript
// /admin/NewAdminPage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NewAdminPage() {
  const { profile } = useAuth();
  
  if (profile?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <div>Admin sayfası</div>;
}

// App.js'e ekle:
<Route
  path="/admin/new"
  element={
    <ProtectedRoute>
      <AdminRoute>
        <NewAdminPage />
      </AdminRoute>
    </ProtectedRoute>
  }
/>
```

---

## 🗄️ Firestore Koleksiyonu Oluşturma

### Firestore Console'da:
1. "Koleksiyon Oluştur" butonuna tıkla
2. Koleksiyon adını gir (örn: `newCollection`)
3. İlk dokümanı ekle:
   ```json
   {
     "name": "Örnek",
     "createdAt": "2024-01-01",
     "active": true
   }
   ```

### Firestore Rules'a Ekle:
```javascript
match /newCollection/{docId} {
  allow read: if isUser();
  allow write: if isAdmin();
  allow create: if isAdmin();
  allow delete: if isAdmin();
}
```

---

## 🎨 Stil İpuçları

### Dark Theme Uygulamak
```css
:root {
  --bg-dark: #0a1f1f;
  --bg-dark-secondary: #121212;
  --text-primary: #e0e0e0;
  --text-white: #ffffff;
  --accent-color: #2dd4bf;
  --border-dark: #2a2a2a;
}

.component {
  background: var(--bg-dark);
  color: var(--text-primary);
}
```

### Responsive Buton
```css
.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 576px) {
  .btn {
    width: 100%;
    padding: 0.5rem 1rem;
  }
}
```

---

## 🐛 Debugging Tekikleri

### Console Logging
```javascript
// Component mount
useEffect(() => {
  console.log('✅ Component mounted');
  return () => console.log('❌ Component unmounted');
}, []);

// State değişiklik
useEffect(() => {
  console.log('Data:', data);
}, [data]);
```

### Error Handling
```javascript
try {
  const data = await getDocs(collection(db, 'collection'));
  console.log('✅ Data loaded:', data);
} catch (error) {
  console.error('❌ Error:', error);
  alert('Bir hata oluştu: ' + error.message);
}
```

### Network Inspector
- F12 → Network sekmesi
- Firestore isteklerini ara
- Status ve response kontrolü

---

## 📊 Veri Yapısı Template'leri

### Story Object
```javascript
{
  id: "doc123",
  userId: "user123",
  userName: "Ahmet",
  userEmail: "ahmet@mail.com",
  title: "Başlık",
  description: "Açıklama...",
  weight_before: 90,
  weight_after: 75,
  duration: "3 ay",
  images: ["url1", "url2", "url3", "url4"],
  createdAt: Timestamp,
  likes: 42
}
```

### Quote Object
```javascript
{
  id: "quote123",
  text: "Söz metni",
  author: "Yazar",
  category: "motivasyon",
  createdAt: Timestamp
}
```

### Program Object
```javascript
{
  id: "prog123",
  name: "Keto",
  description: "Açıklama",
  calories: 2000,
  macros: { protein: 150, carbs: 50, fat: 100 },
  accessLevel: "premium",
  price: 99,
  createdAt: Timestamp
}
```

---

## 🧪 Test Senaryoları

### Admin Özellikleri Test Etme
```javascript
// 1. Admin hesabıyla giriş yap
// 2. NavBar'da "🔧 Yönetim" buton görüntülense
// 3. /admin sayfasına erişim sağlanırsa
// 4. Programları ekle/sil
// 5. Sözleri ekle/sil
// ✓ Tüm işlemler başarılı
```

### Kullanıcı Hikayesi Test Etme
```javascript
// 1. Giriş yap (normal kullanıcı)
// 2. /user-stories git
// 3. Forma doldur
// 4. 4 resim yükle
// 5. Gönder
// 6. Firestore'da doküman oluşturuldu mu?
// 7. Motivasyon sayfasında görünüyor mu?
```

### Motivasyon Sözü Test Etme
```javascript
// 1. Browser console aç (F12)
// 2. localStorage.clear()
// 3. /motivation git
// 4. Günün sözü gösteriliyor mu?
// 5. localStorage.getItem('quote_...') çalışıyor mu?
// 6. Sayfayı yenile (F5)
// 7. Aynı söz mi gösteriliyor?
// 8. Saati değiştir ve tekrar test et
```

---

## ⚡ Performance İpuçları

### Lazy Loading
```javascript
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Kullan:
<Suspense fallback={<div>Yükleniyor...</div>}>
  <AdminPanel />
</Suspense>
```

### Memoization
```javascript
import { memo } from 'react';

const StoryCard = memo(({ story }) => (
  <div>{story.title}</div>
));

export default StoryCard;
```

### Query Optimization
```javascript
// Sadece ihtiyacın olan alanları al
const q = query(
  collection(db, 'userStories'),
  limit(10),
  orderBy('createdAt', 'desc')
);
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] Firebase credentials .env dosyasında
- [ ] API keys genel değişkenlerde değil
- [ ] Firestore kuralları production modunda
- [ ] Admin kontrolü frontend'te ve backend'te
- [ ] CORS ayarları kontrol edildi
- [ ] XSS koruması aktif
- [ ] SQL injection hataları yok

---

## 📱 Mobile Testing

### Browser DevTools
1. F12 → Device Emulation
2. iPhone 12/13 seç
3. Tüm sayfaları test et:
   - Navigasyon çalışıyor mu?
   - Butonlar klikleniyor mu?
   - Metinler okunuyor mu?
   - Resimler yükleniyor mu?

### Real Device
```bash
# Local machine IP bulma
ipconfig getifaddr en0  # Mac
ipconfig              # Windows

# URL'e gir:
http://YOUR_IP:3000
```

---

## 🚀 Deployment Kontrol Listesi

### Frontend
```bash
npm run build
# Dosyalar: build/

# Firebase Hosting'e deploy et:
firebase deploy --only hosting
```

### Backend
```bash
# Heroku'ya deploy et
git push heroku main
```

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

## 📞 Sık Sorulan Sorular

**S: Admin olmayan kullanıcı /admin'e girerse?**
A: AdminRoute component otomatik yönlendir.

**S: Motivasyon sözü yüklenmez mi?**
A: Firestore koleksiyonunu kontrol et, sözler ekle.

**S: Hikaye resimleri yüklenmez mi?**
A: Cloud Storage izinlerini kontrol et.

**S: Localhost'ta çalışır ama production'da çalışmaz mı?**
A: Firestore rules ve CORS ayarlarını kontrol et.

---

## 🔗 Faydalı Linkler

- [Firebase Console](https://console.firebase.google.com)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)
- [MDN Web Docs](https://developer.mozilla.org)
- [CSS Tricks](https://css-tricks.com)

---

**Versiyon**: 2.0  
**Son Update**: 2024  
**Durum**: ✅ Ready to Deploy

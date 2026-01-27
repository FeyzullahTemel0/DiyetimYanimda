# 🔧 DiyetimYanımda - Sorun Giderme Rehberi

## ❌ Admin Paneline Erişilemiyorsa

### Problem: "Admin paneline erişim reddedildi"

**Nedenler:**
1. Admin rolü atanmamış
2. Firestore'da `role` alanı yanlış
3. Frontend cache'i temizlenmemiş

**Çözüm:**
```javascript
// 1. Firestore Console'a git
// 2. users koleksiyonunu aç
// 3. Kullanıcı dokümanına git
// 4. Aşağıdaki alanları kontrol et:

{
  "role": "admin",      // "user" değilse değiştir
  "status": "active"    // "banned" değilse
}

// 5. Sayfayı yenile (Ctrl+F5)
```

**Alternatif Çözüm:**
```javascript
// Backend'den admin oluştur:
// firebase console → Functions tab
// Custom claim set:
admin.auth().setCustomUserClaims(uid, {role: 'admin'})
```

---

## ❌ Motivasyon Sözleri Yüklenmiyorsa

### Problem: Motivasyon sayfasında sözler görmüyorum

**Nedenler:**
1. Sözler Firestore'a eklenmemiş
2. Koleksiyon yanlış isimlendirilmiş
3. Firestore kuralları hata alıyor

**Çözüm:**
```javascript
// 1. Admin paneline git (/admin)
// 2. "Motivasyon Sözleri" sekmesine tıkla
// 3. En az 5 söz ekle:

Söz 1: "Başarı bir hedef değil, bir süreçtir."
Söz 2: "Motivasyon seni başlatır, disiplin seni devam ettirir."
Söz 3: "Senin vücudun dün bıraktığın seçimlerin sonucu."
Söz 4: "Değişim acı veriyor ama hiçbir şey yapmamak daha çok acı verir."
Söz 5: "Asıl korkulacak şey, asla denememiş olmaktır."

// 4. Motivasyon sayfasını yenile
// 5. Sözler görüntüleniyor mu?
```

**Firestore Kontrol:**
```javascript
// Browser Console'da:
db.collection('motivationQuotes').get().then(snapshot => {
  console.log('Söz sayısı:', snapshot.size);
  snapshot.docs.forEach(doc => console.log(doc.data()));
});
```

---

## ❌ Kullanıcı Hikayeleri Görüntülenemiyorsa

### Problem: /user-stories sayfası açılmıyor veya boş

**Nedenler:**
1. UserStories.jsx dosyası yanlış yolu
2. Firestore izinleri yeterli değil
3. Resimlerin URL'leri invalid

**Çözüm 1 - Import Kontrol:**
```javascript
// App.js'de check:
import UserStories from "./pages/UserStories"; // Doğru mu?

// Routes'ta check:
<Route path="/user-stories" element={<UserStories />} />
```

**Çözüm 2 - Firestore Rules:**
```javascript
// firebase/firestore.rules'da check:
match /userStories/{storyId} {
  allow read: if isUser();      // Okuma çalışıyor mu?
  allow write: if ...(condition);
}
```

**Çözüm 3 - Test Verisi Ekle:**
```javascript
// Firestore Console'da userStories koleksiyonuna ekle:
{
  "userId": "test123",
  "userName": "Test Kullanıcı",
  "userEmail": "test@example.com",
  "title": "Test Hikayesi",
  "description": "Test açıklaması",
  "weight_before": 90,
  "weight_after": 75,
  "duration": "3 ay",
  "images": [
    "https://via.placeholder.com/400x400?text=before",
    "https://via.placeholder.com/400x400?text=step1",
    "https://via.placeholder.com/400x400?text=step2",
    "https://via.placeholder.com/400x400?text=after"
  ],
  "createdAt": "2024-01-01",
  "likes": 0
}
```

---

## ❌ Firestore Bağlantı Hatası

### Problem: "Firebase connection error" veya "permission denied"

**Hata Mesajleri:**
```
Error: Missing or insufficient permissions.
Error: The supplied auth credential is malformed.
Error: Could not load Cloud Firestore.
```

**Çözüm 1 - Firebase Config Kontrol:**
```javascript
// src/services/firebase.js check:
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

**Çözüm 2 - .env.local Kontrol:**
```
REACT_APP_API_KEY=YOUR_KEY
REACT_APP_AUTH_DOMAIN=YOUR_DOMAIN
REACT_APP_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_STORAGE_BUCKET=YOUR_BUCKET
REACT_APP_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_APP_ID=YOUR_APP_ID
```

**Çözüm 3 - Firestore Rules Test:**
```javascript
// Firebase Console → Firestore → Rules Test
// Mode: Cloud Firestore Security Rules
// Path: users/{useruid}
// Method: GET
// Auth: User (uid: test123)
```

---

## ❌ localStorage Hatası

### Problem: "Bugünün Sözü" değişmiyor

**Nedenler:**
1. localStorage devre dışı
2. Tarayıcı özel mod
3. Storage quota aşılmış

**Çözüm 1 - Browser Test:**
```javascript
// Console'da test:
localStorage.setItem('test', 'test');
localStorage.getItem('test');  // "test" döndürmelidir
localStorage.removeItem('test');
```

**Çözüm 2 - Cache Temizle:**
```javascript
// Browser'da:
Ctrl+Shift+Del (Windows/Linux)
Cmd+Shift+Del (Mac)

// Ve seç:
✓ Cookies and other site data
✓ Cached images and files
```

**Çözüm 3 - Kod Debug:**
```javascript
// Motivation.jsx'de ekle:
useEffect(() => {
  const today = new Date().toDateString();
  console.log('Today:', today);
  const stored = localStorage.getItem(`quote_${today}`);
  console.log('Stored:', stored);
  
  if (stored) {
    setTodayQuote(stored);
    console.log('✅ Quote from localStorage');
  } else {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    localStorage.setItem(`quote_${today}`, random);
    setTodayQuote(random);
    console.log('✅ Quote saved to localStorage');
  }
}, []);
```

---

## ❌ Responsive Tasarım Bozuk

### Problem: Mobil cihazda sayfa bozuk görünüyor

**Çözüm 1 - Browser Inspector:**
```javascript
// F12 → Device Emulation
// iPhone 12 seç
// Zoom: 100%
// Sayfaları test et
```

**Çözüm 2 - CSS Debug:**
```css
/* Tüm elementleri göster */
* {
  outline: 1px solid red;
}

/* Grid'leri kontrol et */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Responsive test */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

**Çözüm 3 - Viewport Tag:**
```html
<!-- public/index.html'de check: -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## ❌ Resim Yüklenmiyorsa

### Problem: Admin panelinde resim yükleme çalışmıyor

**Nedenler:**
1. Cloud Storage izinleri yok
2. Resim boyutu çok büyük
3. Dosya formatı desteklenmiyor

**Çözüm 1 - Cloud Storage Rules:**
```javascript
// firebase/storage.rules:
service firebase.storage {
  match /b/{bucket}/o {
    match /userImages/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

**Çözüm 2 - Resim Boyutu:**
```javascript
// Maksimum boyut: 5MB
if (file.size > 5 * 1024 * 1024) {
  alert('Resim çok büyük! (Max 5MB)');
  return;
}
```

**Çözüm 3 - Dosya Tipi:**
```javascript
// İzin verilen tipler:
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!allowedTypes.includes(file.type)) {
  alert('Sadece JPEG, PNG veya WebP destekleniyor');
  return;
}
```

---

## ❌ Admin Buton Görünmüyorsa

### Problem: NavBar'da Admin buton gözükmüyor

**Çözüm:**
```javascript
// NavBar.jsx'de check:
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  if (user) {
    const checkAdmin = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      const userRole = docSnap.data()?.role;
      console.log('User role:', userRole);  // Debug
      setIsAdmin(userRole === 'admin');
    };
    checkAdmin();
  }
}, [user]);

// Render'da:
{isAdmin && (
  <Link to="/admin" className="btn-nav btn-admin">
    🔧 Yönetim
  </Link>
)}
```

---

## ❌ Form Gönderme Başarısız

### Problem: "Form submission failed"

**Çözüm 1 - Error Logging:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Validation
    if (!formData.name) {
      alert('Ad gerekli!');
      return;
    }
    
    // Database
    console.log('Saving:', formData);
    const docRef = await addDoc(collection(db, 'collection'), formData);
    console.log('✅ Saved with ID:', docRef.id);
    alert('Başarıyla kaydedildi!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Hata: ' + error.message);
  }
};
```

**Çözüm 2 - Firestore Rules:**
```javascript
// Rules'da write izni var mı?
match /collection/{docId} {
  allow write: if isAdmin();  // ← Check this
}
```

---

## 📊 Debugging Checklist

Sorun çözmeden önce bunu kontrol et:

- [ ] Browser console'da error var mı? (F12)
- [ ] Network sekmesinde başarısız request var mı?
- [ ] Firebase credentials doğru mu?
- [ ] Firestore kuralları production modunda mı?
- [ ] Kullanıcı giriş yapmış mı?
- [ ] Admin rolü ayarlanmış mı?
- [ ] localStorage temizlendi mi?
- [ ] Page refresh ettim mi? (Ctrl+F5)
- [ ] Başka tarayıcı denemedi mi?
- [ ] Özel mod denemedi mi?

---

## 🔍 Advanced Debug Tekikleri

### Console Logging
```javascript
// Bileşen lifecycle
console.log('✅ Component mounted');

// State değişiklikler
console.log('State updated:', newValue);

// Async işlemler
console.log('Fetching from Firestore...');
getDocs(query).then(snapshot => {
  console.log('✅ Got', snapshot.size, 'documents');
});

// Hata yakalama
try {
  // operation
} catch (error) {
  console.error('❌ Error:', {
    message: error.message,
    code: error.code,
    details: error
  });
}
```

### Network Debugging
```javascript
// F12 → Network tab
// XHR filter
// Firestore requests ara
// Request/Response headers kontrol et
// Status codes: 200 (OK), 403 (Forbidden), 500 (Server error)
```

### Firestore Emulator (Local Testing)
```bash
# Emulator'ü başlat
firebase emulators:start

# Code'da kullan
import { connectFirestoreEmulator } from 'firebase/firestore';
connectFirestoreEmulator(db, 'localhost', 8080);
```

---

## 📞 Destek Kaynakları

1. **Firebase Docs**: https://firebase.google.com/docs
2. **React Docs**: https://react.dev
3. **MDN Web Docs**: https://developer.mozilla.org
4. **Stack Overflow**: Soru sor (tag: firebase, react)
5. **GitHub Issues**: Proje repo'suna bakın

---

## ✅ Sorunlu Olmayan Şeyler

Bu başarısız DEĞİLDİR, normal davranıştır:

- ✅ Sayfa 2-3 saniye yüklenirse normal
- ✅ ilk yükleme'de sözler boşsa normal (localStorage yeni)
- ✅ Resimleri yüklemek 5 saniye alırsa normal
- ✅ Console'da warning varsa uyarı, error değil
- ✅ Firestore emulator hataları test modunda normal

---

**Sorununuz çözüldü mü?**
- ✅ EVET → Tebrikler! 🎉
- ❌ HAYIR → Lütfen doktorlama kılavuzu tekrar okuyun

---

**Son Güncelleme**: 2024  
**Versiyon**: 2.0  
**Durum**: ✅ Bakım Altında

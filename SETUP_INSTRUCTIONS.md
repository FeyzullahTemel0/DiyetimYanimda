# 🎯 DiyetimYanımda - Kurulum ve Yönetim Rehberi

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Yeni Özellikler](#yeni-özellikler)
3. [Kurulum Adımları](#kurulum-adımları)
4. [Admin Paneli Kullanımı](#admin-paneli-kullanımı)
5. [Veritabanı Yapısı](#veritabanı-yapısı)
6. [Firestore Kuralları](#firestore-kuralları)

---

## 🎉 Genel Bakış

**DiyetimYanımda** artık tamamen yenilendi! Sahte testimoniallar yerine gerçek kullanıcı hikayelerini gösteriyor ve profesyonel bir yönetim paneli ile tüm içeriği kolayca yönetebiliyorsunuz.

### Temel Değişiklikler:
- ✅ **Gerçek Kullanıcı Hikayeleri**: Kullanıcılar kendi başarı yolculuklarını 4 fotoğraf ve yazı ile paylaşabiliyor
- ✅ **Günlük Motivasyon Sözleri**: Her gün farklı bir motivasyon sözü gösteriliyor
- ✅ **Profesyonel Admin Paneli**: Kod yazmadan içerik yönetimi
- ✅ **Gelişmiş Firestore Güvenliği**: Admin ve kullanıcı izinleri düzenlendi

---

## 🚀 Yeni Özellikler

### 1. **Kullanıcı Hikayeler Sayfası** (`/user-stories`)
- 📸 Kullanıcılar kendi başarı hikayelerini paylaşabiliyor
- 📸 Her hikaye için 4 fotoğraf (Öncesi, Aşama 1, Aşama 2, Sonrası)
- ✏️ Hikayeler güncellenebilir ve silinebilir
- 🔍 Responsive grid layout

### 2. **Günlük Motivasyon Sözleri** (`/motivation`)
- 💡 Her gün yeni bir motivasyon sözü gösteriliyor
- 💾 LocalStorage ile caching (aynı gün aynı söz görüntülenir)
- 🔄 Sözler Firebase Firestore'dan çekiliyor
- 👥 Gerçek kullanıcı hikayelerinin gösterimi

### 3. **Profesyonel Admin Paneli** (`/admin`)
- 🔐 Sadece Admin rolüne sahip kullanıcılar erişebiliyor
- 📋 4 ana bölüm:
  - **Diyet Programları**: Program ekle, düzenle, sil
  - **Motivasyon Sözleri**: Sözler ekle ve yönet
  - **Kullanıcı Yönetimi**: Kullanıcıları görüntüle, engelle/aktivleştir
  - **Fiyatlandırma**: Planları yönet

### 4. **Ev Sayfası Güncellemesi** (`/`)
- Sahte testimonial kartları kaldırıldı
- Gerçek kullanıcı hikayelerine yönlendiren buton eklendi
- "Tüm Hikayeleri Gördür" CTA

---

## 🔧 Kurulum Adımları

### **Adım 1: Projeyi Başlat**

```bash
# Frontend kurulum
cd frontend
npm install

# Backend kurulum
cd ../backend
npm install
```

### **Adım 2: Firebase Konfigürasyonu**

1. Firebase Console'a git: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Projesini aç veya yeni bir proje oluştur
3. Firestore Database'i etkinleştir
4. Aşağıdaki Firestore kurallarını uygula:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isUser() {
      return request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if isUser() && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin() || (isUser() && userId == request.auth.uid);
      allow create: if isUser();
    }
    
    match /dietPrograms/{programId} {
      allow read: if isUser();
      allow write: if isAdmin();
    }
    
    match /userStories/{storyId} {
      allow read: if isUser();
      allow write: if isUser() && resource.data.userId == request.auth.uid;
      allow delete: if isUser() && resource.data.userId == request.auth.uid;
    }
    
    match /motivationQuotes/{quoteId} {
      allow read: if isUser();
      allow write: if isAdmin();
    }
    
    match /pricing/{priceId} {
      allow read: if isUser();
      allow write: if isAdmin();
    }
  }
}
```

### **Adım 3: Admin Kullanıcısı Oluştur**

1. Firebase Console'da Authentication'a git
2. Yeni bir kullanıcı oluştur
3. Firestore'da `users` koleksiyonunda kullanıcının dokümanını aç
4. Aşağıdaki alanları ekle:

```json
{
  "role": "admin",
  "email": "admin@example.com",
  "displayName": "Admin",
  "status": "active"
}
```

### **Adım 4: Motivasyon Sözlerini Ekle**

1. Admin Paneline git: `/admin`
2. "Motivasyon Sözleri" sekmesine tıkla
3. Söz metni ve yazarı gir
4. "Söz Ekle" butonuna tıkla

**Örnek Sözler:**
```
"Başarı bir hedef değil, bir süreçtir."
"Senin vücudun dün bıraktığın seçimlerin sonucu."
"Motivasyon seni başlatır, disiplin seni devam ettirir."
"Bu yolculuğunda sayfalarını yazmak sana düşüyor."
"Değişim acı veriyor ama hiçbir şey yapmamak daha çok acı verir."
```

### **Adım 5: Diyet Programlarını Ekle**

1. Admin Paneline git: `/admin`
2. "Diyet Programları" sekmesine tıkla
3. Program bilgilerini doldur:
   - Program Adı
   - Açıklama
   - Günlük Kalori
   - Erişim Seviyesi (Free/Premium/Plus)
   - Fiyat

### **Adım 6: Frontend'i Başlat**

```bash
cd frontend
npm start
```

Tarayıcı otomatik olarak açılacak: [http://localhost:3000](http://localhost:3000)

### **Adım 7: Backend'i Başlat**

```bash
cd backend
npm start
```

Backend port 5000'de çalışacak.

---

## 💼 Admin Paneli Kullanımı

### **Admin Paneline Erişim**
- Giriş yap (admin hesabı ile)
- Navbar'da "🔧 Yönetim" butonuna tıkla
- Ya da `/admin` adresine git

### **Diyet Programları Yönetimi**

#### Program Ekleme:
1. "📋 Diyet Programları" sekmesine tıkla
2. Form alanlarını doldur
3. "➕ Program Ekle" butonuna tıkla

#### Program Silme:
1. Program listesinde "🗑️ Sil" butonuna tıkla
2. Onayı vermek için "OK" tıkla

### **Motivasyon Sözleri Yönetimi**

#### Söz Ekleme:
1. "💡 Motivasyon Sözleri" sekmesine tıkla
2. Söz metni gir
3. (Opsiyonel) Yazar adını gir
4. Kategori seç
5. "➕ Söz Ekle" butonuna tıkla

#### Söz Silme:
1. Sözler listesinde "🗑️ Sil" butonuna tıkla
2. Onayı vermek için "OK" tıkla

**Not**: Motivasyon sözleri Firestore'dan rastgele seçilir ve her gün localStorage'da önbelleğe alınır.

### **Kullanıcı Yönetimi**

#### Kullanıcı Görüntüleme:
1. "👥 Kullanıcı Yönetimi" sekmesine tıkla
2. Tüm kayıtlı kullanıcıları gördür

#### Kullanıcı Engelleme/Aktivleştirme:
1. İstediğin kullanıcının yanındaki butona tıkla
2. "⛔ Engelle" veya "✅ Aktivleştir"

### **Fiyatlandırma Yönetimi**

1. "💰 Fiyatlandırma" sekmesine tıkla
2. Her plan için bilgileri güncelle
3. "💾 Fiyatlandırmayı Güncelle" butonuna tıkla

---

## 🗄️ Veritabanı Yapısı

### **Firestore Koleksiyonları**

#### 1. **users** (Kullanıcılar)
```json
{
  "uid": "user_id",
  "email": "user@example.com",
  "displayName": "Kullanıcı Adı",
  "role": "user" | "admin",
  "status": "active" | "banned",
  "subscription": "free" | "premium" | "plus",
  "createdAt": "2024-01-01"
}
```

#### 2. **userStories** (Kullanıcı Hikayeleri)
```json
{
  "userId": "user_id",
  "userName": "Kullanıcı Adı",
  "userEmail": "email@example.com",
  "title": "Hikaye Başlığı",
  "description": "Detaylı açıklama...",
  "weight_before": 85,
  "weight_after": 70,
  "duration": "3 ay",
  "images": ["url1", "url2", "url3", "url4"],
  "createdAt": "2024-01-15",
  "likes": 42
}
```

#### 3. **dietPrograms** (Diyet Programları)
```json
{
  "name": "Keto Diyet",
  "description": "Açıklama...",
  "calories": 2000,
  "macros": {
    "protein": 150,
    "carbs": 50,
    "fat": 100
  },
  "accessLevel": "premium",
  "price": 99,
  "weeklyMenu": [],
  "tips": [],
  "createdAt": "2024-01-01"
}
```

#### 4. **motivationQuotes** (Motivasyon Sözleri)
```json
{
  "text": "Söz metni...",
  "author": "Yazar Adı",
  "category": "genel" | "motivasyon" | "başarı" | "sağlık" | "disiplin",
  "createdAt": "2024-01-01"
}
```

#### 5. **pricing** (Fiyatlandırma)
```json
{
  "planId": "free" | "premium" | "plus",
  "price": 0,
  "features": [],
  "description": "Plan açıklaması",
  "updatedAt": "2024-01-01"
}
```

---

## 🔐 Firestore Kuralları

Güvenlik kuralları `firebase/firestore.rules` dosyasında tanımlanmıştır.

### Temel İlkeler:
- ✅ **Sadece giriş yapmış kullanıcılar** içeriği okuyabilir
- ✅ **Admin kullanıcılar** tüm yazma işlemlerini yapabilir
- ✅ **Kullanıcılar** yalnızca kendi hikayelerini değiştirebilir/silebilir
- ✅ **Anonim kullanıcılar** hiçbir şey yapamaz

### Admin Kullanıcılar:
Admin rolü almak için `users/{userId}` dokümanında `role: "admin"` alanı olmalı.

---

## 🎨 Responsive Tasarım

Tüm yeni sayfalar tam responsive:
- 📱 **Mobile**: 320px - 576px
- 📱 **Tablet**: 577px - 768px
- 💻 **Desktop**: 769px+

---

## 🚨 Sorun Giderme

### **Admin Paneline Erişemiyor mu?**
1. Admin hesabında giriş yaptığından emin ol
2. Firestore'da `users` koleksiyonunda `role: "admin"` olduğundan emin ol
3. Sayfayı yenile (F5)

### **Motivasyon Sözleri Yüklenmemişse?**
1. Admin Panelinde sözler ekle
2. Firestore'da `motivationQuotes` koleksiyonu olduğundan emin ol
3. Browser console'da hatalar kontrol et

### **Kullanıcı Hikayesi Görüntülenemiyorsa?**
1. Resimlerin URL'lerinin doğru olduğundan emin ol
2. Firestore kurallarını kontrol et
3. `userStories` koleksiyonu var mı kontrol et

---

## 📞 İletişim ve Destek

Herhangi bir sorun olursa:
1. Browser console'da hataları kontrol et (F12)
2. Firestore kurallarını kontrol et
3. Firebase Authentication durumunu kontrol et

---

## ✨ İpuçları

- 💡 **Motivasyon Sözü Rotasyonu**: Her gün farklı söz görmek için sözler veri tabanına ekle
- 👥 **Kullanıcı Hikayelerini Teşvik Et**: Anasayfada prominent linkler kullan
- 📊 **Analytics**: Firestore'da ne kadar kullanıcı ve hikaye olduğunu kontrol et
- 🔄 **Düzenli Güncelleme**: Programları ve fiyatları düzenli olarak güncelle

---

**Son Güncelleme**: 2024  
**Sürüm**: 2.0 - Gerçek Hikayeler & Admin Paneli

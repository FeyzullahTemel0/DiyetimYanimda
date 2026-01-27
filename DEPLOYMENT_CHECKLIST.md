# ✅ DiyetimYanımda - Kurulum Kontrol Listesi

## 🎯 Ön Kurulum Kontrolleri

- [ ] Node.js v16+ kurulu mu? (`node -v`)
- [ ] npm kurulu mu? (`npm -v`)
- [ ] Firebase projesi oluşturdum
- [ ] Firebase credentials'ı aldım

## 📦 Kurulum Adımları

### Frontend Kurulumu
- [ ] `cd frontend && npm install` çalıştırdım
- [ ] `.env.local` dosyası oluşturdum (Firebase credentials)
- [ ] `npm start` ile başlattım ve çalışıyor

### Backend Kurulumu
- [ ] `cd backend && npm install` çalıştırdım
- [ ] `npm start` ile başlattım ve port 5000'de çalışıyor
- [ ] Database bağlantısı test edildi

## 🔐 Firebase Kurulumu

### Authentication
- [ ] Email/Password kimlik doğrulama etkinleştirildi
- [ ] Google Sign-In etkinleştirildi (opsiyonel)
- [ ] Test kullanıcısı oluşturdum

### Firestore Database
- [ ] Database oluşturdum (Test modu)
- [ ] Firestore kurallarını güncelledim
- [ ] Koleksiyonlar oluşturdum:
  - [ ] `users`
  - [ ] `userStories`
  - [ ] `dietPrograms`
  - [ ] `motivationQuotes`
  - [ ] `pricing`

### Admin Kurulumu
- [ ] Admin kullanıcısı oluşturdum
- [ ] Firestore'da `users/{adminUserId}` dokümanına `role: "admin"` ekledim
- [ ] Admin panele başarıyla erişebildim (`/admin`)

## 📝 İçerik Yönetimi

### Motivasyon Sözleri
- [ ] En az 5 motivasyon sözü Firestore'a ekledim
- [ ] Sözler Motivation sayfasında görüntüleniyor
- [ ] Günlük rotasyon çalışıyor

### Diyet Programları
- [ ] En az 3 diyet programı ekledim
- [ ] Programlar sayfasında görüntüleniyor
- [ ] Admin panelinde CRUD işlemleri çalışıyor

### Fiyatlandırma
- [ ] Fiyatlandırma planları tanımlandı
- [ ] Pricing sayfası çalışıyor

## 🌐 Frontend Kontrolleri

### Sayfalar
- [ ] Ana sayfa (`/`) - Yeni hikayeler bölümü gösteriliyor
- [ ] Motivasyon (`/motivation`) - Günün sözü ve gerçek hikayeler gösteriliyor
- [ ] Kullanıcı Hikayeleri (`/user-stories`) - Sayfaya erişim sağlanıyor
- [ ] Giriş (`/login`) - Çalışıyor
- [ ] Kayıt (`/register`) - Çalışıyor
- [ ] Profil (`/profile`) - Giriş yaptıktan sonra erişilebiliyor
- [ ] Fiyatlandırma (`/pricing`) - Planlar gösteriliyor
- [ ] Admin Paneli (`/admin`) - Sadece admin'ler görebiliyor

### Bileşenler
- [ ] NavBar - Admin buton gösteriliyor (admin hesapla)
- [ ] Footer - Çalışıyor
- [ ] Responsive tasarım - Tüm cihazlarda test edildim

## 🔧 Admin Paneli Fonksiyonları

- [ ] **Diyet Programları**
  - [ ] Program ekleme çalışıyor
  - [ ] Program silme çalışıyor
  - [ ] Program listesi güncelleniyor

- [ ] **Motivasyon Sözleri**
  - [ ] Söz ekleme çalışıyor
  - [ ] Söz silme çalışıyor
  - [ ] Söz listesi güncelleniyor
  - [ ] Motivasyon sayfasında yeni söz gösteriliyor

- [ ] **Kullanıcı Yönetimi**
  - [ ] Kullanıcı listesi yükleniyor
  - [ ] Kullanıcı engelleme/aktivleştirme çalışıyor

- [ ] **Fiyatlandırma**
  - [ ] Fiyatlandırma güncelleme formu çalışıyor

## 🎨 UI/UX Kontrolleri

- [ ] Renk şeması (koyu tema + teal accent) uygulanmış
- [ ] Responsive breakpoint'ler test edildi:
  - [ ] 320px (Mobile)
  - [ ] 576px (Mobile landscape)
  - [ ] 768px (Tablet)
  - [ ] 1024px (Desktop)
- [ ] Tüm butonlar çalışıyor
- [ ] Form validasyonu çalışıyor
- [ ] Error mesajları gösteriliyor

## 🐛 Test ve Hata Ayıklama

- [ ] Browser console'da hata yok
- [ ] Network sekmesinde başarısız istekler yok
- [ ] LocalStorage quote caching çalışıyor
- [ ] Firestore yazma/okuma izinleri çalışıyor

## 📱 Responsive Test

- [ ] Mobile (320px): Tüm sayfalar çalışıyor
- [ ] Tablet (768px): Layout düzgün görünüyor
- [ ] Desktop (1200px+): Maksimum genişlik ayarı uygulanmış

## 🚀 Deployment Hazırlığı

- [ ] Environment variables kontrol edildi
- [ ] Firebase kuralları production moduna alındı
- [ ] Özel şifreler `.env` dosyasında gizlendi
- [ ] Build test edildi: `npm run build`
- [ ] Build dosyaları oluşturuldu

## 📊 Veri Kontrolleri

### Firestore Koleksiyonları
- [ ] `users` - Admin hesap var
- [ ] `userStories` - Test hikayesi var
- [ ] `dietPrograms` - Test programı var
- [ ] `motivationQuotes` - Test sözü var
- [ ] `pricing` - Plan bilgileri var

## 🎓 Kullanıcı Yönetim Kılavuzu

- [ ] Kullanıcılardan hikaye gönderme talebinin nasıl yapılacağını bildim
- [ ] Admin panel kullanımını öğrettim
- [ ] Geribildirimi nasıl toplayacağımı planladım

---

## 🎉 Son Adımlar

1. **Test Hesapları Oluştur**
   ```
   Demo Hesap: demo@diyetimyanımda.com / password123
   Admin Hesap: admin@diyetimyanımda.com / password123
   ```

2. **Seed Data Ekle** (Opsiyonel)
   - Firestore'a test verileri ekle
   - Tüm sayfaları test et

3. **Performance Kontrol**
   - Lighthouse score kontrol et
   - Sayfa yükleme süresi ölç
   - Veritabanı indeksleri oluştur

4. **Güvenlik Kontrol**
   - XSS ve CSRF koruması kontrol et
   - API rate limiting kontrol et
   - Firestore kuralları test et

---

## 📞 Başarı Kriterleri

✅ Tüm kontrol listesi maddeleri tamamlandıysa proje hazırdır!

- **✅ Sistem Hazır**: Tüm 80+ madde tamamlandı
- **⚠️ Kısmen Hazır**: 60-79 madde tamamlandı
- **❌ Henüz Hazır Değil**: 60'tan az madde tamamlandı

---

**Kurulum Tarihi**: _______________  
**Kontrol Eden Kişi**: _______________  
**Notlar**: _______________

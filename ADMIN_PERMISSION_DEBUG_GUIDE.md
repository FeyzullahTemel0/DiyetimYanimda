# Admin Yetkisi Sorun Giderme Rehberi

## 🔴 Problem: "Yetkiniz Yok" Hatası Alıyorum

Admin panelinde tarif eklerken, güncellerken veya silerken "Yetkiniz yok" hatası alıyorsanız bu rehberi takip edin.

---

## 📋 Sorun Checklisti

### Adım 1: Kullanıcı Bilgilerini Kontrol Edin
1. Tarayıcıyı açın
2. **F12** tuşuna basarak Developer Tools'u açın
3. **Console** sekmesine gidin
4. Admin panelde herhangi bir işlem yapmayı deneyin
5. Console'da **"👤 Kullanıcı Durumu:"** yazısını arayın

Aşağıdaki bilgileri kontrol edin:
```
{
  uid: "xxxxx...",           // UID
  email: "user@example.com", // Email
  firebaseRole: "admin",     // Firebase'deki role değeri
  hasEmail: true,            // Email bulundu mu?
}
```

### Adım 2: Admin Rolü Kontrolü
Console'daki bilgilere bakarak:

**✅ Eğer `firebaseRole: "admin"` ise:**
- Kullanıcı zaten admin olarak işaretlenmiş
- Problem Firestore güvenlik kurallarında olabilir
- Tarayıcınızı tamamen kapatıp yeniden açın (tüm sekmeler dahil)
- Uygulamayı yenileyip tekrar giriş yapın

**❌ Eğer `firebaseRole: "user"` veya başka bir değer ise:**
- Kullanıcı henüz admin olarak ayarlanmamış
- **Adım 3'e geçin**

---

## 🔧 Adım 3: Admin Rolü Ayarlama

### Yöntem 1: Komut Satırı (Önerilen)

Terminali açın ve aşağıdaki komutu çalıştırın:

```bash
node backend/scripts/makeUserAdmin.js user@example.com
```

**Örnek:**
```bash
node backend/scripts/makeUserAdmin.js ali@gmail.com
```

Eğer başarılıysa:
```
✅ Başarılı! ali@gmail.com artık admin!
📋 Kullanıcı ID: abc123...
🎉 Artık /admin sayfasına erişebilirsiniz!
```

### Yöntem 2: Firebase Console (Manuel)

1. [Firebase Console](https://console.firebase.google.com/) açın
2. Projenizi seçin
3. Sol menüden **Firestore Database** tıklayın
4. **Collections** sekmesinde `users` koleksiyonunu açın
5. Kullanıcının belgesini bulun (email ile arayabilirsiniz)
6. Belgeyi açın
7. Aşağıdaki alanı ekleyin veya güncelleyin:
   - **Alan adı:** `role`
   - **Tür:** String
   - **Değer:** `admin`
8. Kaydedin

---

## 🔄 Adım 4: Oturumunuzu Yenileyin

Admin rolü ayarladıktan sonra:

1. **Uygulamayı tamamen kapatın** (tüm sekmeler)
2. **Tarayıcınızı kapatın**
3. **Tarayıcıyı yeniden açın**
4. Uygulamaya giriş yapın
5. Admin panele gidin

> ⚠️ **Önemli:** Token yenilenmesi gerektiğinden, basit yenileme (F5) yeterli olmayabilir. Tarayıcıyı tamamen kapatıp açmalısınız!

---

## 🧪 Adım 5: Doğrulayın

Admin panele gittikten sonra:

1. F12 → Console açın
2. Tarif eklemek / silmek / güncellemek yapmayı deneyin
3. Console'da hatasız "**Başarılı**" mesajını görmeli veya başarı toastı görmelisiniz

**Eğer hâlâ "permission-denied" hatası alıyorsanız:**
- Console'da tam hata mesajını not edin
- Tarayıcınızın cache'ini temizleyin (Ctrl+Shift+Delete)
- Tekrar deneyin

---

## 🔍 Firestore Güvenlik Kuralları

Admin olmasına rağmen hâlâ hata alıyorsanız, Firestore güvenlik kuralları kontrol edin:

### Doğru Kurulum:
```
match /recipes/{recipeId} {
  allow read: if isUser();
  allow create, write, update, delete: if isAdmin();
}

function isAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Kuralları Güncelleme:
1. Firebase Console → Firestore Database → Rules sekmesi
2. Yukarıdaki kuralları yapıştırın
3. **Publish** tıklayın

---

## 📞 Hata Mesajları

| Hata | Çözüm |
|------|-------|
| `permission-denied` | Kullanıcı admin değil → Adım 3'e gidin |
| `unauthenticated` | Giriş yapılmamış → Çıkış yapıp yeniden giriş yapın |
| `deadline-exceeded` | Sunucu yavaş → Tekrar deneyin |
| Diğer hatalar | Console'daki tam mesajı okuyun |

---

## 🚀 Hızlı Çözüm Özeti

```bash
# Terminal'de çalıştırın
node backend/scripts/makeUserAdmin.js user@email.com

# Sonra:
# 1. Tarayıcıyı tamamen kapatın
# 2. Yeniden açın
# 3. Tekrar giriş yapın
# 4. Admin panele gidin ✅
```

---

## ✅ Başarı İşaretleri

Admin yetkisini başarıyla aldığınızda:

- ✅ F12 Console'da `firebaseRole: "admin"` görürsünüz
- ✅ Tarif ekleyebilirsiniz
- ✅ Tarif güncelleyebilirsiniz
- ✅ Tarif silebilirsiniz
- ✅ Toplu silme yapabilirsiniz
- ✅ Başarı mesajları görürsünüz

---

## 🆘 Sorun Devam Ediyorsa

Lütfen aşağıdakileri kontrol edin:

1. **Email doğru mu?**
   - `makeUserAdmin.js` dosyasını çalıştırırken tam email adresini yazın
   
2. **Firestore Rules deploy edildi mi?**
   - Firebase Console → Rules → Publish'e tıklanmış mı?

3. **Kullanıcı belgesi var mı?**
   - Firebase Console → Firestore → Collections → users
   - Kullanıcıyı email ile arayın

4. **Cache sorun mu?**
   - Ctrl+Shift+Delete (cache temizle)
   - Uygulamayı yeniden yükle

5. **Token sorunu mu?**
   - Tarayıcıyı tamamen kapatıp açın (F5 yeterli değil!)

---

## 📝 Örnek İşlem Akışı

### Senaryo: ali@gmail.com'u admin yapmak istiyorum

```bash
# Terminal
cd backend
node scripts/makeUserAdmin.js ali@gmail.com

# Çıktı:
# ✅ Başarılı! ali@gmail.com artık admin!
# 📋 Kullanıcı ID: user123abc
# 🎉 Artık /admin sayfasına erişebilirsiniz!
```

Sonra:
1. Tarayıcıyı kapatın
2. Yeniden açın  
3. Uygulamaya giriş yapın (ali@gmail.com)
4. /admin/recipes'e gidin
5. Tarif ekleyin/silin ✅

---

**Son Güncelleme:** Hata mesajları ve konsol çıktıları artık daha detaylı bilgi sağlıyor!

💡 **İpucu:** Console'daki "👤 Kullanıcı Durumu" ve hata mesajlarından korunması için her zaman ekran görüntüsü alabilirsiniz.

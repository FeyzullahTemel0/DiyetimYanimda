# 🚀 Hızlı Başlangıç - Warp ile Proje Sergileme

## 📋 Tek Adımda Kurulum

### Warp Açıkken

```powershell
# 1. Proje klasörüne git
cd "C:\Users\Feyzullah Temel\Desktop\DiyetimYanimda"

# 2. IP'leri otomatik ayarla
node warp-helper.js

# 3. Backend başlat (Terminal 1)
cd backend && npm run dev

# 4. Frontend başlat (Terminal 2)
cd frontend && npm start

# 5. Tarayıcı otomatik açılacak veya http://[YOUR_IP]:3000 ziyaret et
```

### Warp Kapalıyken

```powershell
node warp-helper.js --localhost
# Sonra normal şekilde başlat
```

---

## 🔍 Yapılandırma Nedir?

### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:5000     # Backend API URL
REACT_APP_FRONTEND_URL=http://localhost:3000    # Frontend URL
```

Çoğu fetch call artık bunları kullanır:
```javascript
import { getApiUrl } from '../config/apiConfig';
fetch(getApiUrl('/api/profile'))  // Otomatik URL yapı
```

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000              # CORS için
```

**CORS:** Development modunda tüm originleri kabul eder.

---

## 🌐 Ağ Üzerinde Erişim

IP'niz `192.168.1.100` ise:

| Device | URL |
|--------|-----|
| Makineniz | http://192.168.1.100:3000 |
| Telefon (aynı ağda) | http://192.168.1.100:3000 |
| Backend API | http://192.168.1.100:5000 |

---

## ⚡ Yapılan Değişiklikler

✅ **Frontend:**
- Yeni config dosyası: `frontend/src/config/apiConfig.js`
- Tüm hardcoded `localhost:5000` URL'leri `getApiUrl()` kullanacak şekilde güncellendi
- `.env` dosyası eklendi (environment variables için)

✅ **Backend:**
- CORS ayarları dinamik hale getirildi (development'da tüm originleri kabul)
- `NODE_ENV` kontrol ediyor (production vs development)

✅ **Helper Tools:**
- `warp-helper.js`: Otomatik IP detection ve .env güncelleme
- `WARP_SETUP.md`: Detaylı kurulum rehberi

---

## 🐛 Common Issues

| Problem | Çözüm |
|---------|-------|
| "Cannot reach backend" | `node warp-helper.js` yeniden çalıştır ve sunucuları restart et |
| CORS error | Backend logs'u kontrol et, `.env` dosyasındaki IP'yi doğrula |
| "localhost refused" | Warp'ı kapat ve `node warp-helper.js --localhost` çalıştır |
| Firebase auth fail | Development mode'da otomatik çalışmalı, logs'u kontrol et |

---

## 📚 Daha Fazla Bilgi

Detaylı rehber için: `WARP_SETUP.md` dosyasını oku

---

**Özet:** Warp aktiken `node warp-helper.js` + dev sunucular = Şimdi ağ üzerinden erişebilir! 🎉

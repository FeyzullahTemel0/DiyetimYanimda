# Warp VPN Desteği - Configuration Guide

Warp VPN aktifken projenizi sergilemek ve geliştirmek için bu rehberi izleyin.

## 🔍 Problem

Warp VPN aktif olduğunda:
- `localhost` ve `127.0.0.1` adresleri düzgün çalışmayabilir
- Frontend ve Backend arasındaki iletişim bozulabilir
- CORS hataları oluşabilir

## ✅ Çözüm

### 1. **Otomatik IP Deteksiyonu** (Önerilen)

Warp aktikken dev sunucularınızı başlatmadan önce:

```powershell
cd "C:\Users\Feyzullah Temel\Desktop\DiyetimYanimda"
node warp-helper.js
```

Bu komut:
- Makinenizin yerel IP adresini otomatik olarak tespit eder
- Frontend `.env` dosyasını güncelleştirir (`REACT_APP_BACKEND_URL`)
- Backend `.env` dosyasını güncelleştirir (`FRONTEND_URL`)

**Sonra dev sunucularını başlatın:**

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm start
```

### 2. **Manual Yapılandırma**

Eğer otomatik script işlemiyorsa, manuel olarak yapın:

#### Frontend: `frontend/.env`
```
REACT_APP_BACKEND_URL=http://192.168.1.XXX:5000
REACT_APP_FRONTEND_URL=http://192.168.1.XXX:3000
```

#### Backend: `backend/.env`
```
FRONTEND_URL=http://192.168.1.XXX:3000
PORT=5000
```

`192.168.1.XXX` yerine makinenizin gerçek IP adresini yazın.

### 3. **Warp Kapatıldığında Geri Dön**

Warp'ı kapatırken localhost'a geri dönmek için:

```powershell
node warp-helper.js --localhost
```

## 🔧 Makinenizin IP Adresini Bulma

### Windows (PowerShell):
```powershell
ipconfig
```

Arayın: **IPv4 Address** (genelde `192.168.x.x` veya `10.x.x.x`)

### Mac/Linux:
```bash
ifconfig | grep "inet "
```

## 🌐 Proje Erişim

IP'niz `192.168.1.100` ise:

- **Frontend**: http://192.168.1.100:3000
- **Backend API**: http://192.168.1.100:5000

### Farklı Cihazdan Erişim

Aynı ağ üzerindeki başka bir cihazdan (telefon, tablet):
- `http://192.168.1.100:3000` adresini ziyaret edin
- Backend otomatik olarak doğru IP'ye bağlanacak

## ⚙️ Gelişmiş: CORS Ayarları

Backend `NODE_ENV=development` modunda otomatik olarak tüm originleri kabul eder.
Production'da daha katı ayarlar vardır:

```javascript
// backend/src/index.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || "http://localhost:3000")
    : true,  // Tüm originleri kabul et (development)
  credentials: true
};
app.use(cors(corsOptions));
```

## 🐛 Troubleshooting

### "Cannot reach backend"

1. Backend işçisinin çalıştığını kontrol edin:
   ```powershell
   netstat -ano | findstr ":5000"
   ```

2. `.env` dosyalarının doğru IP'yi içerdiğini kontrol edin:
   ```powershell
   cat frontend\.env
   cat backend\.env
   ```

3. Firewall'ın portu engellemediğini kontrol edin

### "CORS errors"

1. Browser console'un Network tab'ında Origin başlığını kontrol edin
2. Backend logs'u kontrol edin (CORS errors loglanacak)
3. `warp-helper.js` yeniden çalıştırın

### Hala sorun varsa

1. Warp'ı kapatın ve `--localhost` modu test edin
2. İnternet bağlantısını kontrol edin
3. Firewall kurallarını kontrol edin

## 📝 Workflow Özeti

```
1. Warp'ı aç
2. Terminal'de: node warp-helper.js
3. Backend başlat: npm run dev (backend klasöründe)
4. Frontend başlat: npm start (frontend klasöründe)
5. http://[YOUR_IP]:3000 adresine git
6. Tarayıcı autoload yapacak
```

## 🎯 Firebase Authentication

Firebase auth otomatik olarak tüm domain'leri kabul eder (development mode).
Production'da `Authentication > Settings > Authorized Domains`'e IP/domain ekleyin.

---

**Sorular?** Logs'u kontrol edin ve errors'a dikkat edin. Backend ve Frontend logs ayrıntılı hata mesajları gösterecek.

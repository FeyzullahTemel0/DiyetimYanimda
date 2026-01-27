# 🎨 DiyetimYanimda - Renk Paleti Rehberi

## Genel Bakış
Bu proje için özel olarak **sağlık, diyabet ve diyet** temalı, profesyonel ve erişilebilir bir renk paleti oluşturulmuştur.

---

## 🌟 Temel Renk Prensipleri

✅ **Uygulanmış:**
- ✓ Pastel ve doğal tonlar kullanımı
- ✓ Aşırı kırmızıdan kaçınma (sadece acil uyarılarda)
- ✓ Yeterli kontrast (WCAG standartları)
- ✓ Bol beyaz alan kullanımı
- ✓ Göz yormayan renk geçişleri

---

## 🎯 ANA RENK PALETİ

### 1. **YEŞİL TONLARI** (Ana Renk - Sağlık & Denge)
Anlamı: Sağlık, denge, doğallık, huzur

```css
--primary-50: #EEF6F3    /* En açık yeşil */
--primary-100: #DFF3EA   /* Açık mint yeşili */
--primary-200: #C8E6DC   /* Pastel yeşil açık */
--primary-400: #A8D5BA   /* Ana pastel yeşil */
--primary-600: #6BA292   /* Zeytin yeşili vurgu */
```

**Kullanım Alanları:**
- Ana butonlar (CTA)
- Form focus durumları
- Hover efektleri
- Başarı mesajları
- Vurgu elementleri

---

### 2. **MAVİ TONLARI** (İkincil Renk - Güven & Profesyonellik)
Anlamı: Güven, sakinlik, tıbbi güvenilirlik

```css
--secondary-50: #F0F7FC   /* En açık mavi */
--secondary-100: #E6F2F8  /* Açık mavi */
--secondary-200: #D0E8F2  /* Yumuşak mavi */
--secondary-400: #8EC6E8  /* Orta mavi */
--secondary-600: #5B7C99  /* Griye yakın mavi */
```

**Kullanım Alanları:**
- Bilgilendirme mesajları
- İkincil butonlar
- Linkler
- Tag'ler ve etiketler
- Dekoratif elementler

---

### 3. **NÖTR RENKLER** (Arka Plan & Metin)
```css
--white: #FFFFFF              /* Beyaz */
--broken-white: #F9FAF7       /* Kırık beyaz (ana arka plan) */
--gray-light: #F1F5F9         /* Açık gri arka plan */
--gray-50: #F8F9FA           /* Çok açık gri */
--gray-100: #E8EAED          /* Açık border gri */
--gray-200: #D0D5DD          /* Orta gri border */
--gray-300: #CBD5E1          /* Gri border */
--gray-400: #94A3B8          /* Orta gri metin */
--gray-500: #64748B          /* Gri metin */
--gray-600: #475569          /* Koyu gri metin */
--gray-700: #333333          /* Ana koyu gri metin */
--gray-900: #1A1A1A          /* Neredeyse siyah */
```

**Kullanım Alanları:**
- Ana metin: `#333333`
- İkincil metin: `#475569`
- Açıklama metni: `#64748B`
- Border'lar: `#CBD5E1`, `#E8EAED`
- Arka planlar: `#F9FAF7`, `#F1F5F9`

---

### 4. **VURGU RENKLERİ** (Aksiyon & Enerji)
```css
--accent-orange: #F4A261   /* Açık turuncu - CTA butonlar */
--accent-yellow: #F6D365   /* Yumuşak sarı - Öne çıkarma */
```

**Kullanım Alanları:**
- CTA (Call-to-Action) butonları
- Önemli bildirimler
- Odak noktaları
- Fiyatlandırma vurguları

---

### 5. **DURUM RENKLERİ** (Semantic)
```css
--success: #10B981    /* Başarı yeşili */
--warning: #F59E0B    /* Uyarı amber */
--danger: #EF4444     /* Tehlike kırmızısı (az kullan!) */
--info: #3B82F6       /* Bilgi mavisi */
```

**Kullanım Kuralları:**
- ❌ **Kırmızı**: SADECE acil durumlar (hata mesajları, silme onayı)
- ⚠️ **Turuncu/Sarı**: Uyarılar ve dikkat çekme
- ✅ **Yeşil**: Başarı ve pozitif geri bildirim
- ℹ️ **Mavi**: Bilgilendirme mesajları

---

## 📝 RENK KULLANIM ÖRNEKLERİ

### Ana Buton (Primary Button)
```css
.btn-primary {
  background: linear-gradient(135deg, #A8D5BA 0%, #6BA292 100%);
  color: white;
}
```

### İkincil Buton (Secondary Button)
```css
.btn-secondary {
  background: white;
  border: 1px solid #CBD5E1;
  color: #333333;
}

.btn-secondary:hover {
  background: #F9FAF7;
  border-color: #A8D5BA;
  color: #6BA292;
}
```

### Form Input Focus
```css
input:focus {
  border-color: #A8D5BA;
  box-shadow: 0 0 0 3px rgba(168, 213, 186, 0.15);
  background: #F9FAF7;
}
```

### Card/Panel
```css
.card {
  background: white;
  border: 1px solid #E8EAED;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

---

## 🔄 ESKİ RENKTEN YENİ RENGE DÖNÜŞÜM

| Eski Renk | Yeni Renk | Kullanım |
|-----------|-----------|----------|
| `#2563eb` (mavi) | `#A8D5BA` (yeşil) | Ana butonlar, linkler |
| `#1d4ed8` (koyu mavi) | `#6BA292` (koyu yeşil) | Hover durumları |
| `#0f172a` (siyah-gri) | `#333333` (koyu gri) | Ana başlıklar |
| `#1f2937` (koyu gri) | `#333333` (koyu gri) | Metin |
| `#64748b` (gri) | `#475569` (koyu gri) | İkincil metin |
| `#94a3b8` (açık gri) | `#94A3B8` (standardize) | Placeholder |
| `#f3f4f6` (açık bg) | `#F9FAF7` (kırık beyaz) | Arka plan |
| `#e5e7eb` (border) | `#E8EAED` (açık gri) | Border |

---

## ✨ UYGULAMA ÖNERİLERİ

### Typografi
- **Ana başlıklar**: `#333333` (koyu gri)
- **Alt başlıklar**: `#475569` (orta gri)
- **Gövde metni**: `#475569` (orta gri)
- **Placeholder**: `#94A3B8` (açık gri)

### Arka Planlar
- **Ana sayfa bg**: `#F9FAF7` (kırık beyaz)
- **Card bg**: `#FFFFFF` (beyaz)
- **Hover bg**: `#F1F5F9` (açık gri)

### Border'lar
- **Ana border**: `#E8EAED` (açık gri)
- **Focus border**: `#A8D5BA` (yeşil)
- **Hover border**: `#CBD5E1` (orta gri)

---

## 🎨 GRADIENT KULLANIMI

### Primary Gradient
```css
background: linear-gradient(135deg, #A8D5BA 0%, #6BA292 100%);
```

### Tag/Etiket Gradient
```css
background: linear-gradient(135deg, #DFF3EA 0%, #E8F3FF 100%);
```

### Hero Section Gradient
```css
background: linear-gradient(135deg, #F9FAF7 0%, #EEF6F3 100%);
```

---

## 📱 RESPONSIVE & ACCESSIBILITY

### Kontrast Oranları (WCAG AA)
- Metin → Arka plan: minimum 4.5:1
- Büyük metin → Arka plan: minimum 3:1
- İkonlar → Arka plan: minimum 3:1

### Dark Mode Desteği (Opsiyonel)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --text-primary: #F0F0F0;
  }
}
```

---

## 🚀 UYGULANMIŞ DOSYALAR

✅ Güncellendi:
- `src/styles/colors.css` (YENİ - Ana renk değişkenleri)
- `src/index.css` (Import ve global renkler)
- `src/App.css` (Container arka plan)
- `src/pages/Community.css` (Tüm renk paleti)
- `src/components/PostCard.css` (Tüm renk paleti)

📌 Güncellenmesi Gerekenler:
- `src/pages/Login.css`
- `src/pages/Register.css`
- `src/components/Header.css`
- `src/components/NavBar.css`
- `src/components/Footer.css`
- `src/pages/HomePage.css`
- Diğer sayfa CSS dosyaları

---

## 💡 BEST PRACTICES

1. **CSS değişkenlerini kullan**: `var(--primary-400)` yerine doğrudan renk kodu kullanmak
2. **Gradient'ler tutarlı olmalı**: Her zaman 135deg açısı kullan
3. **Hover efektleri**: 0.2s-0.3s arası transition süresi
4. **Shadow'lar**: Hafif ve tutarlı (0.05-0.1 opacity)
5. **Beyaz alan**: Bol padding ve margin kullan

---

## 🔍 HIZLI REFERANS

**Hızlı Kopyala - En Çok Kullanılanlar:**
```css
/* Butonlar */
Ana: #A8D5BA → #6BA292 (gradient)
Hover: box-shadow: 0 8px 16px rgba(107, 162, 146, 0.3)

/* Metin */
Başlık: #333333
Gövde: #475569
Açıklama: #64748B

/* Arka Plan */
Ana: #F9FAF7
Card: #FFFFFF
Hover: #F1F5F9

/* Border */
Normal: #E8EAED
Hover: #CBD5E1
Focus: #A8D5BA

/* Shadow */
Küçük: 0 1px 3px rgba(0, 0, 0, 0.05)
Orta: 0 4px 6px rgba(0, 0, 0, 0.07)
Büyük: 0 10px 15px rgba(0, 0, 0, 0.1)
```

---

## 📞 DESTEK & DOKÜMANTASYON

Renk paletini güncellemek için:
1. `src/styles/colors.css` dosyasını düzenle
2. CSS değişkenlerini kullan: `var(--primary-400)`
3. Test et: Kontrast, responsive, accessibility

**Son Güncelleme**: 17 Ocak 2026
**Versiyon**: 1.0.0
**Tasarım Sistemi**: Sağlık & Diyabet Temalı

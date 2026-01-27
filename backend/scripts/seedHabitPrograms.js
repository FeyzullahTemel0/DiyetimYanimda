// backend/scripts/seedHabitPrograms.js
const { admin, firestore } = require("../src/services/firebaseAdmin");

const habitPrograms = [
  {
    title: "Sabah Rutini Kurma",
    subtitle: "Enerjik bir güne başla",
    description: "Sabah 6:30-7:00 arası 30 dakikalık rutinle günü en iyi şekilde başlayın. Uyandıktan sonra 1 bardak su, 5 dakika germe egzersizi, 10 dakika meditasyon ve kişisel gelişim okuması içerir.",
    category: "wellness",
    difficulty: "kolay",
    frequencyPerWeek: 7,
    durationWeeks: 4,
    focus: ["beslenme", "zihin", "nefes"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "30 Gün Su Tüketimi Mücadelesi",
    subtitle: "Günde 3 litre su içme hedefi",
    description: "Her gün 3 litre su tüketme alışkanlığı kazanın. Sabah, öğlen ve akşam olmak üzere 1 litre su içme görevleri. Cilt sağlığı, sindirimi iyileştirme ve metabolizmayı hızlandırma faydaları.",
    category: "nutrition",
    difficulty: "kolay",
    frequencyPerWeek: 7,
    durationWeeks: 4,
    focus: ["beslenme", "su tüketimi"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "30 Gün Egzersiz Programı",
    subtitle: "Kademeli fitness seviyesi arttırma",
    description: "İlk hafta 10 dakika, ikinci hafta 15 dakika, üçüncü hafta 20 dakika, dördüncü hafta 25 dakika günlük egzersiz. Ev içi basit hareketler, koşu veya spor aktiviteleri içerir.",
    category: "fitness",
    difficulty: "orta",
    frequencyPerWeek: 5,
    durationWeeks: 4,
    focus: ["egzersiz", "uyku"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Günlük Meditasyon Alışkanlığı",
    subtitle: "Zihinsel sakinlik ve odaklanma",
    description: "Her gün aynı saatte 10-15 dakikalık meditasyon yapın. Stres azaltma, konsantrasyon artırma, anksiyete kontrolü ve ruh sağlığı iyileştirmesi amaçlıdır. Uygulamalar: Insight Timer, Calm, Headspace.",
    category: "mindset",
    difficulty: "kolay",
    frequencyPerWeek: 7,
    durationWeeks: 6,
    focus: ["stres", "zihin", "nefes"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Uyku Hijyeni Protokolü",
    subtitle: "Kaliteli uyku alışkanlığı",
    description: "Her akşam 22:30'da yatış, sabah 6:30'da kalkış. Yatıştan 1 saat önce ekran kullanmayı bırakma, koyu ortamda uyuma, uygun sıcaklık. 7-8 saat kaliteli uyku hedefi.",
    category: "sleep",
    difficulty: "orta",
    frequencyPerWeek: 7,
    durationWeeks: 3,
    focus: ["uyku", "beslenme"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Dengeli Beslenme Alışkanlığı",
    subtitle: "Makro dengesi ile beslen",
    description: "Her öğün %40 protein, %30 yağ, %30 karbonhidrat oranı. Günde 5 öğün küçük porsiyonlar. Kahvaltı, 2 ara öğün, öğle yemeği, akşam yemeği. Hazır gıdalardan uzak durun.",
    category: "nutrition",
    difficulty: "orta",
    frequencyPerWeek: 7,
    durationWeeks: 8,
    focus: ["beslenme", "su tüketimi"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Stres Yönetimi Rutini",
    subtitle: "Günlük stres kontrol teknikleri",
    description: "Sabah: 5 dakika nefes egzersizi, Öğlen: 10 dakika yürüyüş, Akşam: 10 dakika yoga. Haftada 2 gün masaj veya hot yoga opsiyonel. Sakinleştirici müzik dinleme, günlük yazma.",
    category: "mindset",
    difficulty: "orta",
    frequencyPerWeek: 6,
    durationWeeks: 4,
    focus: ["stres", "nefes", "zihin"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Haftalık Yürüyüş Mücadelesi",
    subtitle: "Günde 10.000 adım hedefi",
    description: "Haftanın her günü minimum 10.000 adım yürüyün. Sabah, öğlen veya akşam tercih ettiğiniz saatte yapabilirsiniz. Fitbit, Apple Watch veya telefon ile izlenebilir. Kardiyovasküler sağlık ve kilo yönetimi için ideal.",
    category: "fitness",
    difficulty: "kolay",
    frequencyPerWeek: 6,
    durationWeeks: 6,
    focus: ["egzersiz", "uyku"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Nefes Egzersizi Günlüğü",
    subtitle: "Doğal stres hafifletme",
    description: "4-7-8 Nefes Tekniği: 4 saniye nefes al, 7 saniye tut, 8 saniye çık. Sabah, öğlen ve akşam günde 3 kez, her seferinde 5 tur. Panik ataklar, anksiyete ve stres azaltma için etkilidir.",
    category: "wellness",
    difficulty: "kolay",
    frequencyPerWeek: 7,
    durationWeeks: 3,
    focus: ["nefes", "zihin", "stres"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Keto Diyeti Başlangıcı",
    subtitle: "Düşük karbonhidrat yolculuğu",
    description: "Haftada 5 gün keto diyeti, haftada 2 gün esneme günü. Yağ oranı %70, protein %25, karbonhidrat %5. Kaç veya erişte yerine sebze, et ve sağlıklı yağ tüketin.",
    category: "nutrition",
    difficulty: "zor",
    frequencyPerWeek: 5,
    durationWeeks: 8,
    focus: ["beslenme"],
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
  },
];

async function seedHabits() {
  try {
    console.log("🌱 Alışkanlık programları ekleniyor...");
    
    const batch = firestore.batch();
    const habitsRef = firestore.collection("habitPrograms");

    for (const program of habitPrograms) {
      const docRef = habitsRef.doc();
      batch.set(docRef, program);
    }

    await batch.commit();
    console.log(`✅ ${habitPrograms.length} alışkanlık programı başarıyla eklendi!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Veri ekleme hatası:", error);
    process.exit(1);
  }
}

seedHabits();

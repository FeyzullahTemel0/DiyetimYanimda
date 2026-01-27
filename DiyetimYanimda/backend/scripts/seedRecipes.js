// backend/scripts/seedRecipes.js
// Firestore'a kapsamlı tarif verileri yüklemek için script

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK başlatma
const serviceAccountPath = path.join(__dirname, '../src/services/firebaseAdminKey.json');
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// Kapsamlı tarif veri seti
const recipes = [
  // ===== DİYABET HASTASI TARIFLER =====
  {
    name: "Tavuk Göğsü Salatası (Diyabet)",
    category: "tavuk",
    targetGroups: ["diabetes", "diet"],
    difficulty: "kolay",
    prepTime: 20,
    servings: 2,
    calories: 280,
    protein: 42,
    carbs: 8,
    fat: 9,
    fiber: 3,
    glycemicIndex: "low",
    description: "Düşük glisemik indeksli, kontrollü karbonhidrat içeren lezzetli tavuk salatası",
    ingredients: [
      { name: "Tavuk göğsü (pişmiş)", amount: "400g", calories: 440, carbs: 0 },
      { name: "Marul", amount: "150g", calories: 22, carbs: 4 },
      { name: "Domates", amount: "100g", calories: 18, carbs: 4 },
      { name: "Salatalık", amount: "100g", calories: 16, carbs: 3 },
      { name: "Zeytin yağı", amount: "1 tbsp", calories: 120, carbs: 0 },
      { name: "Limon suyu", amount: "2 tbsp", calories: 7, carbs: 2 }
    ],
    instructions: [
      "Tavuk göğsünü haşlayıp küp şeklinde kesin",
      "Sebzeleri yıkayıp dilimleyin",
      "Salatayı hazırlayıp tavuk ekleyin",
      "Zeytin yağı ve limon sosuyla servis yapın"
    ],
    tips: "Karbonhidrat miktarı minimum tutulmuştur. Öğün başında tüketiniz.",
    vegan: false,
    glutenFree: true,
    dairyFree: true
  },
  {
    name: "Somon & Zeytinyağlı Sebzeler (Diyabet)",
    category: "balık",
    targetGroups: ["diabetes"],
    difficulty: "kolay",
    prepTime: 30,
    servings: 1,
    calories: 450,
    protein: 45,
    carbs: 12,
    fat: 22,
    fiber: 4,
    glycemicIndex: "low",
    description: "Omega-3 açısından zengin, kan şekeri kontrolüne yardımcı olan balık yemeği",
    ingredients: [
      { name: "Somon filesi", amount: "180g", calories: 330, carbs: 0 },
      { name: "Brokoli", amount: "150g", calories: 50, carbs: 9 },
      { name: "Havuç", amount: "80g", calories: 31, carbs: 7 },
      { name: "Zeytin yağı", amount: "1 tbsp", calories: 120, carbs: 0 },
      { name: "Sarımsak", amount: "2 diş", calories: 9, carbs: 2 }
    ],
    instructions: [
      "Fırını 200°C'ye ısıtın",
      "Somonun üzerine limon ve sarımsak koyun",
      "Sebzeleri tepsiye dizin",
      "25-30 dakika fırında pişirin"
    ],
    tips: "Omega-3 yağları HDL kolesterolü arttırır. Haftada 2-3 kez tüketilmesi önerilir.",
    vegan: false,
    glutenFree: true,
    dairyFree: true
  },
  {
    name: "Keto Omlet (Diyabet & Kilo Verme)",
    category: "yumurta",
    targetGroups: ["diabetes", "weight_loss"],
    difficulty: "çok kolay",
    prepTime: 10,
    servings: 1,
    calories: 320,
    protein: 28,
    carbs: 2,
    fat: 24,
    fiber: 0,
    glycemicIndex: "very_low",
    description: "Neredeyse sıfır karbonhidrat, protein yüksek hızlı kahvaltı",
    ingredients: [
      { name: "Yumurta", amount: "3 adet", calories: 210, carbs: 2 },
      { name: "Spinak", amount: "100g", calories: 23, carbs: 3 },
      { name: "Cheddar peyniri", amount: "30g", calories: 120, carbs: 0 },
      { name: "Tereyağı", amount: "10g", calories: 72, carbs: 0 }
    ],
    instructions: [
      "Tereyağını tavada eritin",
      "Yumurtaları çırpın ve tavaya dökün",
      "Spinağı ve peyniri ekleyin",
      "Kıvamını aldığında servis yapın"
    ],
    tips: "Sabah enerji depolanması için ideal. Kan şekerini minimal etkilemektedir.",
    vegan: false,
    glutenFree: true,
    dairyFree: false
  },
  // ===== KILO VERME DİYETİ TARIFLER =====
  {
    name: "Düşük Kalori Tavuk Döner",
    category: "tavuk",
    targetGroups: ["weight_loss", "diet"],
    difficulty: "orta",
    prepTime: 40,
    servings: 4,
    calories: 320,
    protein: 42,
    carbs: 15,
    fat: 10,
    fiber: 2,
    glycemicIndex: "medium",
    description: "Kalori kontrollü, protein yüksek döner alternatifi",
    ingredients: [
      { name: "Tavuk göğsü", amount: "600g", calories: 660, carbs: 0 },
      { name: "Yoğurt (az yağlı)", amount: "100g", calories: 100, carbs: 7 },
      { name: "Domates", amount: "100g", calories: 18, carbs: 4 },
      { name: "Marul", amount: "100g", calories: 15, carbs: 3 },
      { name: "Sarımsak", amount: "3 diş", calories: 13, carbs: 3 },
      { name: "Tatlı biber", amount: "1 adet", calories: 30, carbs: 7 }
    ],
    instructions: [
      "Tavuğu baharat ve yoğurtla marine edin",
      "Fırında 180°C'de 35 dakika pişirin",
      "Dilimlemeye hazır hale gelmesini bekleyin",
      "Taze sebzelerle servis yapın"
    ],
    tips: "Döner sos yerine yoğurt tercih edin. Soğuk ağaçla tüketin.",
    vegan: false,
    glutenFree: true,
    dairyFree: false
  },
  {
    name: "Vejetaryen Burger (Kilo Verme)",
    category: "vegan",
    targetGroups: ["weight_loss", "vegetarian"],
    difficulty: "orta",
    prepTime: 35,
    servings: 2,
    calories: 280,
    protein: 15,
    carbs: 32,
    fat: 8,
    fiber: 8,
    glycemicIndex: "medium",
    description: "Fiber yüksek, kalori kontrollü vejetaryen burger",
    ingredients: [
      { name: "Adzuki fasulyesi (haşlanmış)", amount: "200g", calories: 130, carbs: 24 },
      { name: "Buğday unu", amount: "30g", calories: 95, carbs: 21 },
      { name: "Siyah fasulye (haşlanmış)", amount: "100g", calories: 85, carbs: 16 },
      { name: "Soğan", amount: "50g", calories: 18, carbs: 4 },
      { name: "Sarımsak", amount: "2 diş", calories: 9, carbs: 2 },
      { name: "Tahini", amount: "1 tbsp", calories: 90, carbs: 3 }
    ],
    instructions: [
      "Fasulyeleri ezin",
      "Soğan, sarımsak, unu ekleyip karıştırın",
      "Patty şekline getirin",
      "Tavada pişirin veya fırında 20 dakika 180°C'de"
    ],
    tips: "Tam buğday ekmeği ile tüketin. Taze sebzeler ekleyin.",
    vegan: true,
    glutenFree: false,
    dairyFree: true
  },
  // ===== KILO ALMA DİYETİ TARIFLER =====
  {
    name: "Yüksek Kalori Beslenme Shake'i",
    category: "içecek",
    targetGroups: ["weight_gain"],
    difficulty: "çok kolay",
    prepTime: 5,
    servings: 1,
    calories: 550,
    protein: 25,
    carbs: 55,
    fat: 18,
    fiber: 3,
    glycemicIndex: "high",
    description: "Kalori yoğun, kas gelişimi için ideal shake",
    ingredients: [
      { name: "Tam yağlı süt", amount: "300ml", calories: 195, carbs: 14 },
      { name: "Fındık ezmesi", amount: "30g", calories: 180, carbs: 7 },
      { name: "Muzlu porsiyon", amount: "1 orta", calories: 105, carbs: 27 },
      { name: "Çikolata tozuşu", amount: "15g", calories: 50, carbs: 11 },
      { name: "Yer fistigi yağı", amount: "1 tbsp", calories: 95, carbs: 3 }
    ],
    instructions: [
      "Tüm malzemeleri blenderda karıştırın",
      "Pürüzsüz tekstür elde edene kadar çalıştırın",
      "Hemen servis yapın"
    ],
    tips: "Antrenman sonrası için ideal. Günde 2 fincan önerilir.",
    vegan: false,
    glutenFree: true,
    dairyFree: false
  },
  {
    name: "Kas Gelişimi İçin Tavuk Pasta",
    category: "tavuk",
    targetGroups: ["weight_gain", "muscle_gain"],
    difficulty: "kolay",
    prepTime: 30,
    servings: 3,
    calories: 580,
    protein: 50,
    carbs: 60,
    fat: 12,
    fiber: 3,
    glycemicIndex: "high",
    description: "Kalori ve protein yüksek kas gelişimi için formule edilmiş",
    ingredients: [
      { name: "Tavuk göğsü", amount: "600g", calories: 660, carbs: 0 },
      { name: "Tahvil Pasta", amount: "200g", calories: 700, carbs: 140 },
      { name: "Zeytinyağı", amount: "2 tbsp", calories: 240, carbs: 0 },
      { name: "Parmesan peyniri", amount: "50g", calories: 200, carbs: 4 },
      { name: "Domates sosu", amount: "150g", calories: 50, carbs: 10 }
    ],
    instructions: [
      "Pastayı pakette yazılı şekilde pişirin",
      "Tavuğu tavada pişirin",
      "Sosu ve peyniri ekleyin",
      "Güzelce karıştırıp servis yapın"
    ],
    tips: "Antrenman sonrası 1-2 saat içinde tüketin.",
    vegan: false,
    glutenFree: false,
    dairyFree: false
  },
  // ===== STABIL KILO - DENGELI DİYET TARIFLER =====
  {
    name: "Dengeli Akdeniz Kasıklama",
    category: "balık",
    targetGroups: ["maintain", "healthy_lifestyle"],
    difficulty: "orta",
    prepTime: 45,
    servings: 2,
    calories: 420,
    protein: 38,
    carbs: 28,
    fat: 16,
    fiber: 6,
    glycemicIndex: "low",
    description: "Dengeli beslenme için mükemmel akdeniz diyeti yemeği",
    ingredients: [
      { name: "Levrek filesi", amount: "300g", calories: 297, carbs: 0 },
      { name: "Tam buğday", amount: "100g", calories: 340, carbs: 72 },
      { name: "Zeytinler", amount: "20g", calories: 50, carbs: 1 },
      { name: "Domates", amount: "150g", calories: 27, carbs: 6 },
      { name: "Zeytin yağı", amount: "1 tbsp", calories: 120, carbs: 0 },
      { name: "Limon", amount: "1 adet", calories: 17, carbs: 5 }
    ],
    instructions: [
      "Levreği fırında 20 dakika 180°C'de pişirin",
      "Buğdayı pişirin",
      "Taze domates ve zeytinlerle servis yapın"
    ],
    tips: "Kalp sağlığı için ideal. Hafta içinde 3-4 kez tüketilmesi önerilir.",
    vegan: false,
    glutenFree: false,
    dairyFree: true
  },
  {
    name: "Dengeli Nohut Köfte",
    category: "vegan",
    targetGroups: ["maintain", "healthy_lifestyle", "vegetarian"],
    difficulty: "orta",
    prepTime: 35,
    servings: 4,
    calories: 380,
    protein: 18,
    carbs: 45,
    fat: 12,
    fiber: 10,
    glycemicIndex: "medium",
    description: "Vegetaryen, dengeli beslenme için fiber ve protein zengin",
    ingredients: [
      { name: "Nohut (haşlanmış)", amount: "300g", calories: 255, carbs: 45 },
      { name: "Soğan", amount: "80g", calories: 29, carbs: 7 },
      { name: "Sarımsak", amount: "3 diş", calories: 13, carbs: 3 },
      { name: "Buğday unu", amount: "40g", calories: 127, carbs: 28 },
      { name: "Fesleğen", amount: "1 tutam", calories: 1, carbs: 0 },
      { name: "Zeytin yağı", amount: "1 tbsp", calories: 120, carbs: 0 }
    ],
    instructions: [
      "Nohutları hafifçe ezin",
      "Soğan, sarımsak, baharat ekleyin",
      "Köfte şekline getirin",
      "Fırında 25 dakika 180°C'de veya tavada pişirin"
    ],
    tips: "Taze yogurt ve sebzelerle servis yapın.",
    vegan: true,
    glutenFree: false,
    dairyFree: true
  },
  // ===== EXTRA DİYABET & SAĞLIK TARIFLER =====
  {
    name: "Zerdeçallı Tavuk Göğsü",
    category: "tavuk",
    targetGroups: ["diabetes", "healthy_lifestyle"],
    difficulty: "kolay",
    prepTime: 25,
    servings: 2,
    calories: 310,
    protein: 45,
    carbs: 5,
    fat: 11,
    fiber: 1,
    glycemicIndex: "low",
    description: "Anti-inflamatuar zerdeçal içeren, kan şekeri kontrolünde yardımcı",
    ingredients: [
      { name: "Tavuk göğsü", amount: "400g", calories: 440, carbs: 0 },
      { name: "Zerdeçal", amount: "1 tsp", calories: 8, carbs: 1 },
      { name: "Karabiber", amount: "0.5 tsp", calories: 3, carbs: 1 },
      { name: "Limon", amount: "1 adet", calories: 17, carbs: 5 },
      { name: "Zeytin yağı", amount: "1 tbsp", calories: 120, carbs: 0 }
    ],
    instructions: [
      "Tavuğu temizleyin",
      "Zerdeçal, karabiber, limon karışımıyla marinasyon yapın",
      "Tavada veya ızgarada pişirin",
      "Sıcak veya soğuk olarak servis yapın"
    ],
    tips: "Zerdeçal HbA1c seviyesini düşürmeye yardım eder.",
    vegan: false,
    glutenFree: true,
    dairyFree: true
  },
  {
    name: "Çiğ Spirulin Suyunda Yeşil Smoothie",
    category: "içecek",
    targetGroups: ["diabetes", "healthy_lifestyle"],
    difficulty: "çok kolay",
    prepTime: 5,
    servings: 1,
    calories: 180,
    protein: 8,
    carbs: 25,
    fat: 3,
    fiber: 4,
    glycemicIndex: "low",
    description: "Detoks ve anti-oksidan yoğun, düşük glisemik içecek",
    ingredients: [
      { name: "Çiğ nane yaprakları", amount: "20g", calories: 3, carbs: 1 },
      { name: "Islak ıspanak", amount: "100g", calories: 23, carbs: 3 },
      { name: "Limon suyu", amount: "1 adet", calories: 11, carbs: 3 },
      { name: "Su", amount: "250ml", calories: 0, carbs: 0 },
      { name: "Spirulin tozu", amount: "1 tsp", calories: 5, carbs: 0 }
    ],
    instructions: [
      "Tüm malzemeleri blenderda karıştırın",
      "Düzgün bir kıvamdı elde edene kadar çalıştırın",
      "Hemen tüketin"
    ],
    tips: "Sabah ilk olarak içilmesi önerilir.",
    vegan: true,
    glutenFree: true,
    dairyFree: true
  }
];

async function seedRecipes() {
  try {
    console.log('🌱 Tarifler yükleniyor...');
    
    const recipesCollection = db.collection('recipes');
    
    for (const recipe of recipes) {
      await recipesCollection.add({
        ...recipe,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        rating: 0,
        reviews: 0
      });
      console.log(`✅ ${recipe.name} eklendi`);
    }
    
    console.log(`\n✨ Toplam ${recipes.length} tarif başarıyla yüklendi!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Tarif yükleme hatası:', error);
    process.exit(1);
  }
}

seedRecipes();

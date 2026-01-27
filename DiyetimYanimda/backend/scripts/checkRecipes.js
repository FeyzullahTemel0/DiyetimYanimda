// Script to check current recipe count and complete to 250 if needed
const admin = require("firebase-admin");
const serviceAccount = require("../src/services/firebaseAdminKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diet-app-1b4a7.firebaseio.com"
});

const db = admin.firestore();

async function checkAndCompleteRecipes() {
  try {
    console.log("📊 Tarif sayısını kontrol ediliyor...");
    
    // Check current recipe count
    const snapshot = await db.collection("recipes").get();
    const currentCount = snapshot.size;
    
    console.log(`✅ Mevcut tarif sayısı: ${currentCount}`);
    
    if (currentCount >= 250) {
      console.log(`🎉 Zaten ${currentCount} tarif var! Yeterli.`);
      process.exit(0);
    }
    
    const neededRecipes = 250 - currentCount;
    console.log(`📝 ${neededRecipes} tarif daha eklenmesi gerekiyor.`);
    
    // Turkish recipe templates for variety
    const recipeTemplates = [
      {
        name: "Sağlıklı Böbrek Pillavı",
        category: "tahıl",
        difficulty: "kolay",
        prepTime: 25,
        servings: 4,
        calories: 320,
        protein: 12,
        carbs: 48,
        fat: 8,
        fiber: 4,
        vegan: false,
        glutenFree: false,
        dairyFree: true,
        image: "🍚"
      },
      {
        name: "Mercimek Çorbası",
        category: "çorba",
        difficulty: "kolay",
        prepTime: 20,
        servings: 4,
        calories: 180,
        protein: 8,
        carbs: 25,
        fat: 3,
        fiber: 6,
        vegan: true,
        glutenFree: true,
        dairyFree: true,
        image: "🥣"
      },
      {
        name: "Kuru Fasulye Yemeği",
        category: "et",
        difficulty: "orta",
        prepTime: 45,
        servings: 6,
        calories: 280,
        protein: 15,
        carbs: 32,
        fat: 8,
        fiber: 5,
        vegan: false,
        glutenFree: true,
        dairyFree: true,
        image: "🍲"
      },
      {
        name: "Sebze Salatası",
        category: "salata",
        difficulty: "çok kolay",
        prepTime: 10,
        servings: 2,
        calories: 95,
        protein: 3,
        carbs: 12,
        fat: 4,
        fiber: 3,
        vegan: true,
        glutenFree: true,
        dairyFree: true,
        image: "🥗"
      },
      {
        name: "Tavuk Döner",
        category: "tavuk",
        difficulty: "orta",
        prepTime: 30,
        servings: 4,
        calories: 380,
        protein: 42,
        carbs: 15,
        fat: 16,
        fiber: 2,
        vegan: false,
        glutenFree: false,
        dairyFree: true,
        image: "🌮"
      },
      {
        name: "Fırınlı Sebze Karışımı",
        category: "sebze",
        difficulty: "kolay",
        prepTime: 35,
        servings: 3,
        calories: 145,
        protein: 4,
        carbs: 18,
        fat: 6,
        fiber: 4,
        vegan: true,
        glutenFree: true,
        dairyFree: true,
        image: "🥘"
      },
      {
        name: "Yapraklı Turşu",
        category: "turşu",
        difficulty: "çok kolay",
        prepTime: 15,
        servings: 2,
        calories: 35,
        protein: 1,
        carbs: 6,
        fat: 0.5,
        fiber: 1,
        vegan: true,
        glutenFree: true,
        dairyFree: true,
        image: "🥒"
      },
      {
        name: "Balık Omega-3 Kaynağı",
        category: "balık",
        difficulty: "orta",
        prepTime: 25,
        servings: 2,
        calories: 450,
        protein: 50,
        carbs: 10,
        fat: 22,
        fiber: 1,
        vegan: false,
        glutenFree: true,
        dairyFree: true,
        image: "🐟"
      },
      {
        name: "Yoğurtta Salatası",
        category: "salata",
        difficulty: "çok kolay",
        prepTime: 10,
        servings: 2,
        calories: 120,
        protein: 8,
        carbs: 10,
        fat: 5,
        fiber: 2,
        vegan: false,
        glutenFree: true,
        dairyFree: false,
        image: "🥒"
      },
      {
        name: "Fırınlı Tavuk Kanat",
        category: "tavuk",
        difficulty: "kolay",
        prepTime: 40,
        servings: 3,
        calories: 320,
        protein: 38,
        carbs: 8,
        fat: 15,
        fiber: 1,
        vegan: false,
        glutenFree: true,
        dairyFree: true,
        image: "🍗"
      }
    ];
    
    // Add recipes
    let added = 0;
    const batch = db.batch();
    
    for (let i = 0; i < neededRecipes; i++) {
      const template = recipeTemplates[i % recipeTemplates.length];
      const recipeRef = db.collection("recipes").doc();
      
      batch.set(recipeRef, {
        ...template,
        name: `${template.name} #${currentCount + i + 1}`,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        targetGroups: ["healthy_lifestyle", "maintain"],
        ingredients: [
          { name: "Ana Malzeme", amount: "200g", calories: Math.round(template.calories * 0.6) },
          { name: "Sebze", amount: "150g", calories: Math.round(template.calories * 0.3) },
          { name: "Baharat", amount: "1 tatlı kaşığı", calories: Math.round(template.calories * 0.1) }
        ],
        instructions: [
          "Malzemeleri hazırlayın",
          "Uygun ısıda pişirin",
          "Baharat ve tuzla tatlandırın",
          "Sıcak servis yapın"
        ]
      });
      
      added++;
      if (added % 50 === 0) console.log(`  ➕ ${added}/${neededRecipes} tarif eklendi...`);
    }
    
    await batch.commit();
    console.log(`✅ Tüm ${neededRecipes} tarif başarıyla eklendi!`);
    console.log(`🎉 Toplam tarif sayısı: 250`);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
  
  process.exit(0);
}

checkAndCompleteRecipes();

// backend/src/routes/meals.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { firestore } = require("../services/firebaseAdmin");

// Tüm meals rotalarında kimlik doğrulama gerekli
router.use(verifyToken);

/**
 * GET /api/meals
 * Kullanıcının son 30 güne ait yemek günlüğü verilerini döndürür
 * Response: { success: true, meals: [...], summary: {...} }
 */
router.get("/", async (req, res) => {
  try {
    const uid = req.user.uid;
    console.log('🔍 /api/meals endpoint çağrıldı - UID:', uid);
    
    // Son 30 günü hesapla (YYYY-MM-DD formatında)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    console.log('📅 30 gün önce (date string):', thirtyDaysAgoStr);
    
    // Firestore'dan kullanıcının calorieTracker verilerini çek
    // NOT: timestamp yerine date field'ını kullanıyoruz (string karşılaştırması)
    const q = firestore.collection("calorieTracker")
      .where("userId", "==", uid);
    
    console.log('🔄 Firestore query çalıştırılıyor...');
    const snapshot = await q.get();
    console.log('✅ Snapshot alındı - Döküman sayısı:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('⚠️ Hiç meal bulunamadı');
      return res.status(200).json({
        success: true,
        meals: [],
        summary: {
          totalDays: 0,
          totalMeals: 0,
          averageCalories: 0,
          averageProtein: 0,
          averageCarbs: 0,
          averageFat: 0
        }
      });
    }
    
    // Veriyi dönüştür
    const meals = [];
    const dailyStats = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // date field'ı YYYY-MM-DD formatında string
      const dateStr = data.date;
      
      // Son 30 günü filtrele (string karşılaştırması)
      if (!dateStr || dateStr < thirtyDaysAgoStr) {
        return; // Bu kaydı atla
      }
      
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0
        };
      }
      
      // Bu belge tek bir günün tüm meals'lerini içeriyor
      const mealsArray = data.meals || [];
      
      mealsArray.forEach(meal => {
        // Günlük toplamları güncelle
        dailyStats[dateStr].calories += (meal.calories || 0);
        dailyStats[dateStr].protein += (meal.protein || 0);
        dailyStats[dateStr].carbs += (meal.carbs || 0);
        dailyStats[dateStr].fat += (meal.fat || 0);
        dailyStats[dateStr].mealCount += 1;
        
        // Meal nesnesini oluştur
        meals.push({
          id: `${doc.id}_${meal.mealType}_${Date.now()}_${Math.random()}`,
          date: dateStr,
          mealType: meal.mealType || "other",
          name: meal.name || "Öğün",
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          servingSize: meal.servingSize || 1,
          unit: meal.unit || "gram",
          timestamp: `${dateStr}T12:00:00.000Z` // Tarihten timestamp oluştur
        });
      });
    });
    
    // Özet istatistikleri hesapla
    const daysCount = Object.keys(dailyStats).length;
    const totalMeals = meals.length;
    
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    Object.values(dailyStats).forEach(day => {
      totalCalories += day.calories;
      totalProtein += day.protein;
      totalCarbs += day.carbs;
      totalFat += day.fat;
    });
    
    const summary = {
      totalDays: daysCount,
      totalMeals: totalMeals,
      averageCalories: daysCount > 0 ? Math.round(totalCalories / daysCount) : 0,
      averageProtein: daysCount > 0 ? Math.round(totalProtein / daysCount * 10) / 10 : 0,
      averageCarbs: daysCount > 0 ? Math.round(totalCarbs / daysCount * 10) / 10 : 0,
      averageFat: daysCount > 0 ? Math.round(totalFat / daysCount * 10) / 10 : 0,
      dailyStats: dailyStats
    };
    
    // Meals'i timestamp'e göre sırala (en yeni önce)
    meals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('✅ Response hazırlandı - Meal sayısı:', meals.length);
    
    res.status(200).json({
      success: true,
      meals: meals,
      summary: summary
    });
  } catch (error) {
    console.error("❌ GET /api/meals error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Yemek verileri getirilirken bir hata oluştu.",
      message: error.message
    });
  }
});

/**
 * GET /api/meals/:days
 * Son N gün için meal verilerini döndürür
 * Example: GET /api/meals/7 -> son 7 gün
 */
router.get("/:days", async (req, res) => {
  try {
    const uid = req.user.uid;
    const days = parseInt(req.params.days) || 30;
    
    // Belirtilen gün kadar gerileri hesapla
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = firestore.collection("calorieTracker")
      .where("userId", "==", uid)
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "desc");
    
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        meals: [],
        period: days,
        summary: {
          totalDays: 0,
          totalMeals: 0,
          averageCalories: 0,
          averageProtein: 0,
          averageCarbs: 0,
          averageFat: 0
        }
      });
    }
    
    // Veriyi dönüştür
    const meals = [];
    const dailyStats = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateStr = new Date(data.timestamp.toDate()).toISOString().split('T')[0];
      
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0
        };
      }
      
      dailyStats[dateStr].calories += (data.calories || 0);
      dailyStats[dateStr].protein += (data.protein || 0);
      dailyStats[dateStr].carbs += (data.carbs || 0);
      dailyStats[dateStr].fat += (data.fat || 0);
      dailyStats[dateStr].mealCount += 1;
      
      meals.push({
        id: doc.id,
        date: dateStr,
        mealType: data.mealType || "other",
        name: data.foodName || "Öğün",
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        servingSize: data.servingSize || 1,
        unit: data.unit || "gram",
        timestamp: data.timestamp.toDate().toISOString()
      });
    });
    
    // Özet istatistikleri hesapla
    const daysCount = Object.keys(dailyStats).length;
    const totalMeals = meals.length;
    
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    Object.values(dailyStats).forEach(day => {
      totalCalories += day.calories;
      totalProtein += day.protein;
      totalCarbs += day.carbs;
      totalFat += day.fat;
    });
    
    const summary = {
      totalDays: daysCount,
      totalMeals: totalMeals,
      averageCalories: daysCount > 0 ? Math.round(totalCalories / daysCount) : 0,
      averageProtein: daysCount > 0 ? Math.round(totalProtein / daysCount * 10) / 10 : 0,
      averageCarbs: daysCount > 0 ? Math.round(totalCarbs / daysCount * 10) / 10 : 0,
      averageFat: daysCount > 0 ? Math.round(totalFat / daysCount * 10) / 10 : 0,
      dailyStats: dailyStats
    };
    
    res.status(200).json({
      success: true,
      meals: meals,
      period: days,
      summary: summary
    });
  } catch (error) {
    console.error("❌ GET /api/meals/:days error:", error);
    res.status(500).json({
      success: false,
      error: "Yemek verileri getirilirken bir hata oluştu."
    });
  }
});

module.exports = router;

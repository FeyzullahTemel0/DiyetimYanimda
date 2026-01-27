import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getApiUrl } from '../config/apiConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import '../styles/PersonalizedNutritionRecommendations.css';

// Özel Tooltip Bileşeni
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '15px',
        border: '2px solid #4CAF50',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '5px 0', color: entry.color, fontSize: '13px', fontWeight: '500' }}>
            {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PersonalizedNutritionRecommendations() {
  const [userProfile, setUserProfile] = useState(null);
  const [mealData, setMealData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1W'); // 1W, 2W, 3W, 1M, 3M, 6M, 1Y
  const navigate = useNavigate();

  // Grafik veri hazırlama fonksiyonları
  const prepareChartData = (meals) => {
    console.log('🔍 prepareChartData called with:', meals);
    let mealsList = meals?.meals || meals || [];
    console.log('📦 mealsList extracted:', mealsList);
    
    // Eğer veri yoksa dummy data ekle (test için)
    if (!mealsList || mealsList.length === 0) {
      console.log('⚠️ Meal verisi boş - Dummy data kullanılıyor');
      const today = new Date();
      mealsList = [];
      for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        mealsList.push({
          date: dateStr,
          calories: 1800 + Math.random() * 400,
          protein: 90 + Math.random() * 20,
          carbs: 200 + Math.random() * 50,
          fat: 60 + Math.random() * 20,
          mealType: 'breakfast'
        });
      }
    }

    const dailyData = {};

    mealsList.forEach(meal => {
      const date = meal.date || new Date().toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          count: 0
        };
      }
      dailyData[date].calories += meal.calories || 0;
      dailyData[date].protein += meal.protein || 0;
      dailyData[date].carbs += meal.carbs || 0;
      dailyData[date].fat += meal.fat || 0;
      dailyData[date].count += 1;
    });

    const result = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(day => ({
        ...day,
        date: new Date(day.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
      }));
    console.log('✅ prepareChartData returning:', result);
    return result;
  };

  const getFilteredChartData = (data, period) => {
    if (!data) {
      console.log('❌ getFilteredChartData: data is null/undefined');
      return [];
    }
    const days = { '1W': 7, '2W': 14, '3W': 21, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }[period] || 7;
    const filtered = data.slice(-days);
    console.log('📊 getFilteredChartData:', { data_length: data.length, days, period, filtered_length: filtered.length, filtered });
    return filtered;
  };

  const getAverageStats = (data, period) => {
    const filtered = getFilteredChartData(data, period);
    if (filtered.length === 0) return { name: 'Veri Yok', calories: 0, protein: 0, carbs: 0, fat: 0 };
    const totals = filtered.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return {
      name: 'Ortalama',
      calories: totals.calories / filtered.length,
      protein: totals.protein / filtered.length,
      carbs: totals.carbs / filtered.length,
      fat: totals.fat / filtered.length
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        console.log('👤 Kullanıcı UID:', auth.currentUser.uid);
        console.log('📧 Kullanıcı Email:', auth.currentUser.email);

        // 1. Profil verilerini çek
        const profileRes = await fetch(getApiUrl('/api/profile'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error('Profil yüklenemedi');
        const profile = await profileRes.json();
        
        console.log('✅ Profil yüklendi:', profile.name || profile.email);

        // Abonelik kontrolü - plan ve status kontrolü
        if (!profile.subscription || !['basic', 'pro', 'premium', 'plus'].includes(profile.subscription.plan) || profile.subscription.status !== 'active') {
          console.log('⛔ Abonelik yetersiz - Profile yönlendiriliyor');
          navigate('/profile', { replace: true });
          return;
        }

        setUserProfile(profile);

        // 2. Yemek verilerini çek
        console.log('🔄 Yemek verileri çekiliyor...');
        const mealsRes = await fetch(getApiUrl('/api/meals'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meals = mealsRes.ok ? await mealsRes.json() : { meals: [], summary: {} };
        console.log('✅ Yemek verileri alındı:', meals);
        setMealData(meals);

        // 3. Analiz ve öneriler oluştur
        const recs = generateRecommendations(profile, meals);
        setRecommendations(recs);

        // 4. Grafik verilerini hazırla
        const graphData = prepareChartData(meals);
        console.log('📊 Grafik verileri hazırlandı:', graphData);
        setChartData(graphData);

        setLoading(false);
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchData();
    } else {
      navigate('/login');
    }
  }, [navigate]);
  const generateRecommendations = (profile, meals) => {
    console.log('🔍 generateRecommendations çağrıldı');
    console.log('📋 Profile:', profile);
    console.log('🍽️ Meals data:', meals);
    
    // Kullanıcı bilgilerinden analiz
    const bmi = profile.height && profile.weight 
      ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
      : null;

    // Son 7 günün ortalama istatistikleri
    const avgStats = calculateMealStats(meals);
    console.log('📊 Haftalık istatistikler (Son 7 gün):', avgStats);

    // Günlük hedef kaloriyi haftalık verilere göre hesapla
    const targetCalories = calculateDailyCalories(profile, avgStats);
    console.log('🎯 Hedef kalori:', targetCalories);
    
    // Kişiselleştirilmiş öneriler
    const nutritionRecommendations = [];
    
    if (avgStats.avgCalories < targetCalories * 0.9) {
      nutritionRecommendations.push({
        title: '📊 Kalori İntakı',
        severity: 'warning',
        message: `Günlük ortalama ${avgStats.avgCalories.toFixed(0)} kalori tüketiyorsunuz. Hedefiniz ${targetCalories} kaloridir. Daha fazla kalori almanız gerekiyor.`,
        tip: 'Beslenme planınıza protein ağırlıklı ara öğünler ekleyin.'
      });
    } else if (avgStats.avgCalories > targetCalories * 1.1) {
      nutritionRecommendations.push({
        title: '📊 Kalori İntakı',
        severity: 'warning',
        message: `Günlük ortalama ${avgStats.avgCalories.toFixed(0)} kalori tüketiyorsunuz. Hedefiniz ${targetCalories} kaloridir. Biraz daha az kalori almalısınız.`,
        tip: 'Porsiyon kontrollü beslenmeye dikkat edin.'
      });
    } else {
      nutritionRecommendations.push({
        title: '📊 Kalori İntakı',
        severity: 'success',
        message: `Kalori alımınız hedef aralıkta (${avgStats.avgCalories.toFixed(0)} kal). Harika iş çıkarıyorsunuz!`,
        tip: 'Devam et!'
      });
    }

    // Makro önerileri (1 HAFTALIK VERIYE DAYALI)
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 MAKRO NUTRİENT ANALİZİ (1 HAFTALIK VERIYE DAYALI):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🥩 PROTEIN: Haftalık ortalama =', avgStats.avgProtein.toFixed(1), 'g/gün | Hedef =', (targetCalories * 0.25 / 4).toFixed(1), 'g/gün');
    console.log('🌾 KARBONHİDRAT: Haftalık ortalama =', avgStats.avgCarbs.toFixed(1), 'g/gün | Hedef =', (targetCalories * 0.5 / 4).toFixed(1), 'g/gün');
    console.log('🫒 YAĞ: Haftalık ortalama =', avgStats.avgFat.toFixed(1), 'g/gün | Hedef =', (targetCalories * 0.25 / 9).toFixed(1), 'g/gün');
    console.log('═══════════════════════════════════════════════════════════');
    
    // PROTEIN
    const proteinTarget = targetCalories * 0.25 / 4;
    if (avgStats.avgProtein < proteinTarget * 0.9) {
      nutritionRecommendations.push({
        title: '🥚 Protein',
        severity: 'warning',
        message: `Protein tüketimi yetersiz (${avgStats.avgProtein.toFixed(0)}g/gün). Hedef ${proteinTarget.toFixed(0)}g/gün.`,
        tip: 'Tavuk, balık, yumurta, süt ürünleri tüketimini artırın.'
      });
    } else {
      nutritionRecommendations.push({
        title: '🥚 Protein',
        severity: 'success',
        message: `Protein alımınız hedef aralıkta (${avgStats.avgProtein.toFixed(0)}g/gün). Harika iş çıkarıyorsunuz!`,
        tip: 'Devam et!'
      });
    }

    // KARBONHİDRAT
    const carbsTarget = targetCalories * 0.5 / 4;
    if (avgStats.avgCarbs < carbsTarget * 0.9) {
      nutritionRecommendations.push({
        title: '🌾 Karbonhidrat',
        severity: 'warning',
        message: `Karbonhidrat tüketimi yetersiz (${avgStats.avgCarbs.toFixed(0)}g/gün). Hedef ${carbsTarget.toFixed(0)}g/gün.`,
        tip: 'Tam tahıl ürünleri ve sebzeler tercih edin.'
      });
    } else if (avgStats.avgCarbs > carbsTarget * 1.1) {
      nutritionRecommendations.push({
        title: '🌾 Karbonhidrat',
        severity: 'info',
        message: `Karbonhidrat tüketimi biraz yüksek (${avgStats.avgCarbs.toFixed(0)}g/gün). Hedef ${carbsTarget.toFixed(0)}g/gün.`,
        tip: 'Basit karbonhidratları sınırlayın, kompleks karbonhidratları tercih edin.'
      });
    } else {
      nutritionRecommendations.push({
        title: '🌾 Karbonhidrat',
        severity: 'success',
        message: `Karbonhidrat alımınız mükemmel (${avgStats.avgCarbs.toFixed(0)}g/gün). Devam edin!`,
        tip: 'Devam et!'
      });
    }

    // YAĞ
    const fatTarget = targetCalories * 0.25 / 9;
    if (avgStats.avgFat < fatTarget * 0.9) {
      nutritionRecommendations.push({
        title: '🫒 Yağ',
        severity: 'info',
        message: `Yağ tüketimi biraz düşük (${avgStats.avgFat.toFixed(0)}g/gün). Hedef ${fatTarget.toFixed(0)}g/gün.`,
        tip: 'Sağlıklı yağları ekleyin (zeytinyağı, fındık, avokado).'
      });
    } else if (avgStats.avgFat > fatTarget * 1.1) {
      nutritionRecommendations.push({
        title: '🫒 Yağ',
        severity: 'warning',
        message: `Yağ tüketimi yüksek (${avgStats.avgFat.toFixed(0)}g/gün). Hedef ${fatTarget.toFixed(0)}g/gün.`,
        tip: 'Kalorili yağlı gıdaları sınırlandırın.'
      });
    } else {
      nutritionRecommendations.push({
        title: '🫒 Yağ',
        severity: 'success',
        message: `Yağ alımınız dengelenmiş (${avgStats.avgFat.toFixed(0)}g/gün). Mükemmel!`,
        tip: 'Devam et!'
      });
    }

    // Yaş ve cinsiyete göre öneriler
    const ageRecommendations = generateAgeBasedRecommendations(profile);

    // Beslenme planı önerileri
    const mealPlanRecommendations = generateMealPlanRecommendations(profile, avgStats);
    
    // Kişiselleştirilmiş ipuçları (BMI ve kilo durumuna dayalı)
    const personalizedTips = generatePersonalizedTips(profile, { bmi, targetCalories: Math.round(targetCalories), avgStats }, avgStats);

    return {
      bmi,
      targetCalories: Math.round(targetCalories),
      avgStats,
      nutritionRecommendations,
      ageRecommendations,
      mealPlanRecommendations,
      personalizedTips
    };
  };

  const calculateDailyCalories = (profile, avgStats) => {
    // 1. HAFTALIK VERIYE DAYALI HESAPLAMA
    // Eğer haftalık veri varsa, onu base al
    if (avgStats && avgStats.avgCalories > 0) {
      // Kullanıcının son 7 gün ortalama tüketimi
      const userAvgIntake = avgStats.avgCalories;
      const targetCalories = Math.round(userAvgIntake * 1.1);
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🎯 GÜNLÜK KALORI HEDEFI HESAPLAMASI:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ 1 HAFTALIK VERIYE DAYALI HESAPLAMA');
      console.log('  ├─ Kullanıcının haftalık ortalama tüketimi:', userAvgIntake, 'kcal');
      console.log('  ├─ Hedef (ortalama + %10):', targetCalories, 'kcal');
      console.log('  └─ İşlem: Haftalık veriler → Hedef belirlendi');
      console.log('═══════════════════════════════════════════════════════════');
      
      return targetCalories;
    }
    
    // Eğer veri yoksa Harris-Benedict kullan
    const { weight, height, gender, activity = 'moderate' } = profile;
    
    if (!weight || !height) {
      console.log('⚠️ HARRIS-BENEDICT KULLANILDI (Veri yetersiz)');
      return 2000;
    }

    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * 30);
    }

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9
    };

    const targetCalories = Math.round(bmr * (multipliers[activity] || 1.55));
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 GÜNLÜK KALORI HEDEFI HESAPLAMASI:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️ HARRIS-BENEDICT FORMÜLÜ KULLANILDI (Haftalık veri yok)');
    console.log('  ├─ BMR:', Math.round(bmr));
    console.log('  ├─ Aktivite seviyesi:', activity);
    console.log('  ├─ Hedef kalori:', targetCalories, 'kcal');
    console.log('═══════════════════════════════════════════════════════════');
    
    return targetCalories;
  };

  const calculateMealStats = (meals) => {
    // Meals API'nin { meals: [...], summary: {...} } yapısını işle
    const mealsList = meals?.meals || meals || [];
    
    console.log('📝 calculateMealStats - Toplam meal sayısı:', mealsList.length);
    
    if (!mealsList || mealsList.length === 0) {
      console.log('⚠️ Meal verisi bulunamadı');
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalMeals: 0,
        skippedMeals: [],
        dailyBreakdown: {},
        daysTracked: 0
      };
    }

    // SON 7 GÜNÜ FİLTRELE
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    console.log('📅 7 gün önce tarihi:', sevenDaysAgoStr);
    
    const last7DaysMeals = mealsList.filter(meal => {
      return meal.date >= sevenDaysAgoStr;
    });
    
    console.log('✅ Son 7 günlük meal sayısı:', last7DaysMeals.length);

    if (last7DaysMeals.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalMeals: 0,
        skippedMeals: [],
        dailyBreakdown: {},
        daysTracked: 0
      };
    }

    // Son 7 günü grupla
    const dailyData = {};
    last7DaysMeals.forEach(meal => {
      const date = meal.date;
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          meals: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealTypes: {}
        };
      }
      dailyData[date].meals.push(meal);
      dailyData[date].calories += meal.calories || 0;
      dailyData[date].protein += meal.protein || 0;
      dailyData[date].carbs += meal.carbs || 0;
      dailyData[date].fat += meal.fat || 0;
      
      const mealType = meal.mealType || 'other';
      dailyData[date].mealTypes[mealType] = (dailyData[date].mealTypes[mealType] || 0) + 1;
    });

    // Atlanmış öğünleri tespit et
    const expectedMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const skippedMeals = [];
    
    Object.entries(dailyData).forEach(([date, data]) => {
      expectedMealTypes.forEach(mealType => {
        if (!data.mealTypes[mealType]) {
          skippedMeals.push({
            date,
            mealType,
            day: new Date(date).toLocaleDateString('tr-TR', { weekday: 'long' })
          });
        }
      });
    });

    // Haftalık ortalamaları hesapla
    const daysCount = Object.keys(dailyData).length;
    const totalCalories = Object.values(dailyData).reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = Object.values(dailyData).reduce((sum, day) => sum + day.protein, 0);
    const totalCarbs = Object.values(dailyData).reduce((sum, day) => sum + day.carbs, 0);
    const totalFat = Object.values(dailyData).reduce((sum, day) => sum + day.fat, 0);

    const avgCalories = daysCount > 0 ? Math.round(totalCalories / daysCount) : 0;
    const avgProtein = daysCount > 0 ? Math.round((totalProtein / daysCount) * 10) / 10 : 0;
    const avgCarbs = daysCount > 0 ? Math.round((totalCarbs / daysCount) * 10) / 10 : 0;
    const avgFat = daysCount > 0 ? Math.round((totalFat / daysCount) * 10) / 10 : 0;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 HAFTALIK HESAPLAMALAR (Son 7 Gün):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📅 İzlenen gün sayısı:', daysCount);
    console.log('🍽️ Toplam yemek kaydı (7 gün):', last7DaysMeals.length);
    console.log('');
    console.log('KALORI:');
    console.log('  ├─ Toplam kalori (7 gün):', totalCalories);
    console.log('  ├─ Ortalama kalori/gün:', avgCalories);
    console.log('');
    console.log('PROTEIN:');
    console.log('  ├─ Toplam protein (7 gün):', totalProtein.toFixed(1), 'g');
    console.log('  ├─ Ortalama protein/gün:', avgProtein, 'g');
    console.log('');
    console.log('KARBONHİDRAT:');
    console.log('  ├─ Toplam karbonhidrat (7 gün):', totalCarbs.toFixed(1), 'g');
    console.log('  ├─ Ortalama karbonhidrat/gün:', avgCarbs, 'g');
    console.log('');
    console.log('YAĞ:');
    console.log('  ├─ Toplam yağ (7 gün):', totalFat.toFixed(1), 'g');
    console.log('  ├─ Ortalama yağ/gün:', avgFat, 'g');
    console.log('');
    console.log('ATlanmış ÖĞÜNler:', skippedMeals.length);
    console.log('═══════════════════════════════════════════════════════════');

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      totalMeals: last7DaysMeals.length,
      skippedMeals,
      dailyBreakdown: dailyData,
      daysTracked: daysCount
    };
  };

  const generateAgeBasedRecommendations = (profile) => {
    const recs = [];

    if (profile.gender === 'female') {
      recs.push({
        icon: '👩',
        title: 'Kadınlara Özel',
        items: [
          'Demir rich gıdalar (kırmızı et, ıspanak, kuru kayısı)',
          'Kalsiyum (süt ürünleri, karbonatlı su)',
          'Folik asit (yeşil sebzeler, fasulye)'
        ]
      });
    }

    recs.push({
      icon: '🏃',
      title: 'Aktivite Düzeyine Göre',
      items: [
        'Egzersiz sonrası protein + karbonhidrat kombinasyonu',
        'Yeterli hidrasyon (günde 2.5-3 lt su)',
        'Öğün zamanlaması (egzersizden 1.5-2 saat sonra yemek)'
      ]
    });

    return recs;
  };

  const generatePersonalizedTips = (profile, recommendations, avgStats) => {
    const bmi = parseFloat(recommendations.bmi);
    const targetCalories = recommendations.targetCalories;
    const avgCalories = avgStats.avgCalories;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 KIŞISELLEŞTIRILMIŞ İPUÇLARI (BMI ve Kilo/Kalori Verilerine Dayalı):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 BMI:', bmi);
    console.log('🎯 Hedef kalori:', targetCalories);
    console.log('📈 Ortalama alım:', avgCalories);
    
    let weightStatus = '';
    let weightTips = [];
    
    if (bmi < 18.5) {
      weightStatus = 'ZAYIF';
      weightTips = [
        '🥇 Hedef: Sağlıklı şekilde kilo almak',
        '📊 Günde 300-500 kalori fazlası hedeflenen kilo alma sağlar',
        '🥛 Yoğun beslenecek gıdalar: Avokado, kuruyemişler, çiçek yağı',
        '🥚 Protein alımını artırın (kas gelişimi için)',
        '💪 Düzenli egzersiz yapın (özellikle direnç antrenmanı)'
      ];
      console.log('⚠️ DURUM: Kilo alması gerekiyor');
      console.log('  ├─ Hedefiniz günde +300-500 kalori almaktır');
    } else if (bmi < 25) {
      weightStatus = 'NORMAL';
      weightTips = [
        '✅ BMI değeriniz ideal aralıkta (18.5-24.9)',
        '🎯 Hedef: Güncel ağırlığı korumak',
        '⚖️ Şu andaki beslenme planını devam ettirin',
        '🏃 Düzenli aktivite ile sağlığınızı koruyun',
        '📅 Değişiklikler için aylık kontroller yapın'
      ];
      console.log('✅ DURUM: Normal kiloda');
      console.log('  ├─ Hedefiniz mevcut kiloyı korumaktır');
    } else if (bmi < 30) {
      weightStatus = 'FAZLA KİLO';
      weightTips = [
        '⚠️ Hedef: Sağlıklı şekilde kilo vermek',
        '📊 Günde 300-500 kalori açığı oluşturmayı hedefleyin',
        '🔄 Kalori açığı = hedef - 400 kalori günlük',
        '💧 Su tüketimini artırın (tokluk hissi verir)',
        '🥗 Öğünlere daha fazla sebze ekleyin (düşük kalori, yüksek hacim)',
        '🚶 Günde 10.000 adım hedefleyin'
      ];
      console.log('⚠️ DURUM: Fazla kilo alması gerekiyor');
      console.log('  ├─ Hedefiniz günde -300-500 kalori yaratmaktır');
    } else {
      weightStatus = 'OBESİTE';
      weightTips = [
        '🆘 Hedef: Kilo kaybıyla sağlığı iyileştirmek',
        '📊 Deneyimli beslenme uzmanına danışmanız önerilir',
        '🏥 Doktor kontrolünde kilo verme programı başlatın',
        '⏱️ Yavaş ve kararlı kilo kaybı hedefleyin (haftada 0.5-1 kg)',
        '🚶 Başlamak için günde 30 dakika yürüyüş yeterlidir',
        '💪 Zamanla egzersiz süresini ve şiddetini artırın'
      ];
      console.log('🆘 DURUM: Obez');
      console.log('  ├─ Tıbbi desteğe ihtiyaç duyabilirsiniz');
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    
    return {
      weightStatus,
      weightTips,
      generalTips: [
        '💧 Hidrasyon: Günde 2.5-3 litre su içini',
        '🕐 Uyku: Gece 7-9 saat uyku hedefleyin',
        '📊 Takip: Haftalık terazi ölçümü yapın',
        '📱 Beslenme uygulamalarını kullanın'
      ]
    };
  };

  const generateMealPlanRecommendations = (profile, avgStats) => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📅 ÖNERILEN BESLENME PLANI (Kullanıcı Verilerine Dayalı):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Plan, kullanıcının 1 haftalık yemek alışkanlıklarına göre özelleştirilmiştir.');
    console.log('📊 Hesaplanan günlük hedef kalori:', Math.round(avgStats.avgCalories * 1.1), 'kcal');
    console.log('═══════════════════════════════════════════════════════════');
    
    return [
      {
        meal: 'Kahvaltı',
        recommendation: 'Yumurta, tam tahıl ekmek, meyve, zeytinyağı',
        timing: '07:00 - 09:00',
        calories: Math.round(profile.subscription?.plan === 'premium' ? 500 : 400)
      },
      {
        meal: 'Ara Öğün 1',
        recommendation: 'Yoğurt, fındık, meyve veya proteinli bar',
        timing: '10:30 - 11:30',
        calories: 150
      },
      {
        meal: 'Öğle',
        recommendation: 'Protein (tavuk/balık), pirinç/patates, sebze',
        timing: '12:30 - 13:30',
        calories: Math.round(profile.subscription?.plan === 'premium' ? 650 : 550)
      },
      {
        meal: 'Ara Öğün 2',
        recommendation: 'Meyva, kuruyemişler veya sucu yapılmış limon',
        timing: '15:30 - 16:30',
        calories: 150
      },
      {
        meal: 'Akşam',
        recommendation: 'Protein, sebze, sağlıklı yağlar (balık, zeytinyağı)',
        timing: '19:00 - 20:00',
        calories: Math.round(profile.subscription?.plan === 'premium' ? 600 : 500)
      }
    ];
  };

  if (loading) return <div className="prn-loading">Öneriler hazırlanıyor...</div>;
  if (error) return <div className="prn-error">Hata: {error}</div>;
  if (!recommendations) return <div className="prn-error">Veri bulunamadı.</div>;

  return (
    <div className="prn-container">
      <Header />
      
      <main className="prn-content">
        <div className="prn-header">
          <h1>🥗 Kişiselleştirilmiş Beslenme Önerileri</h1>
          <p>Sizin için hazırlanmış özel beslenme analizi ve önerileri</p>
        </div>

        {/* TAB SEÇİCİ */}
        <div className="prn-tabs">
          <button 
            className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            📊 Özet & Analitikler
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'nutrition' ? 'active' : ''}`}
            onClick={() => setSelectedTab('nutrition')}
          >
            🥗 Beslenme Analizi
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'mealplan' ? 'active' : ''}`}
            onClick={() => setSelectedTab('mealplan')}
          >
            📅 Önerilen Beslenme Planı
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'tips' ? 'active' : ''}`}
            onClick={() => setSelectedTab('tips')}
          >
            💡 İpuçları
          </button>
        </div>

        {/* ÖZET & ANALİTİKLER SEKMESİ */}
        {selectedTab === 'overview' && (
          <div className="prn-tab-content">
            {/* İSTATİSTİKLER */}
            <div className="prn-stats-grid">
              <div className="prn-stat-card">
                <h3>📏 BMI</h3>
                <p className="prn-stat-value">{recommendations.bmi || 'N/A'}</p>
                <p className="prn-stat-label">Vücut Kitle İndeksi</p>
              </div>
              <div className="prn-stat-card">
                <h3>🔥 Günlük Hedef Kalori</h3>
                <p className="prn-stat-value">{recommendations.targetCalories}</p>
                <p className="prn-stat-label">kcal</p>
              </div>
              <div className="prn-stat-card">
                <h3>📈 Ortalama Alım</h3>
                <p className="prn-stat-value">{recommendations.avgStats.avgCalories.toFixed(0)}</p>
                <p className="prn-stat-label">kcal/gün</p>
              </div>
              <div className="prn-stat-card">
                <h3>🍽️ Toplam Kayıt</h3>
                <p className="prn-stat-value">{recommendations.avgStats.totalMeals}</p>
                <p className="prn-stat-label">Yemek</p>
              </div>
            </div>

            {/* GRAFİKLER BÖLÜMÜ */}
            {console.log('📊 Analytics Tab - chartData:', chartData, 'length:', chartData?.length)}
            {chartData && chartData.length > 0 && (
              <>
                {/* ZAMAN ARALIĞI SEÇİCİ */}
                <div className="prn-period-selector">
                  <h3>📊 Zaman Aralığı Seç</h3>
                  <div className="prn-period-buttons">
                    {[
                      { key: '1W', label: '1 Hafta' },
                      { key: '2W', label: '2 Hafta' },
                      { key: '3W', label: '3 Hafta' },
                      { key: '1M', label: '1 Ay' },
                      { key: '3M', label: '3 Ay' },
                      { key: '6M', label: '6 Ay' },
                      { key: '1Y', label: '1 Sene' }
                    ].map(period => (
                      <button
                        key={period.key}
                        className={`period-btn ${selectedPeriod === period.key ? 'active' : ''}`}
                        onClick={() => setSelectedPeriod(period.key)}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KALORİ GRAFİĞİ */}
                <div className="prn-chart-container">
                  <h3>🔥 Kalori Alımı Trendi ({selectedPeriod})</h3>
                  {(() => {
                    const filteredData = getFilteredChartData(chartData, selectedPeriod);
                    console.log('🎨 Chart 1 Render Check:', { 
                      hasData: !!filteredData, 
                      dataLength: filteredData?.length,
                      data: filteredData 
                    });
                    return filteredData && filteredData.length > 0;
                  })() ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <AreaChart 
                        width={Math.max(800, window.innerWidth - 150)} 
                        height={450} 
                        data={getFilteredChartData(chartData, selectedPeriod)} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff7300" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                          label={{ value: 'Kalori (kcal)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="#ff7300" 
                          fillOpacity={1}
                          fill="url(#colorCalories)"
                          strokeWidth={3}
                          name="Kalori (kcal)"
                          dot={{ fill: '#ff7300', r: 4 }}
                          activeDot={{ r: 6, fill: '#ff5500' }}
                        />
                      </AreaChart>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <p style={{ fontSize: '16px', marginBottom: '10px' }}>📊 Veri bulunamadı</p>
                      <p style={{ fontSize: '14px' }}>Yemek kayıtlarınız eklenince grafik görünecek</p>
                    </div>
                  )}
                </div>

                {/* MAKRO NUTRİENT GRAFİĞİ */}
                <div className="prn-chart-container">
                  <h3>🥗 Makro Nutrient Analizi ({selectedPeriod})</h3>
                  {getFilteredChartData(chartData, selectedPeriod) && getFilteredChartData(chartData, selectedPeriod).length > 0 ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <LineChart 
                        width={Math.max(800, window.innerWidth - 150)} 
                        height={450} 
                        data={getFilteredChartData(chartData, selectedPeriod)} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                          label={{ value: 'Gram (g)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="protein" 
                          stroke="#e74c3c" 
                          strokeWidth={3}
                          dot={{ fill: '#e74c3c', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Protein (g)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="carbs" 
                          stroke="#3498db" 
                          strokeWidth={3}
                          dot={{ fill: '#3498db', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Karbonhidrat (g)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="fat" 
                          stroke="#f39c12" 
                          strokeWidth={3}
                          dot={{ fill: '#f39c12', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Yağ (g)"
                        />
                      </LineChart>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <p style={{ fontSize: '16px', marginBottom: '10px' }}>📊 Veri bulunamadı</p>
                      <p style={{ fontSize: '14px' }}>Yemek kayıtlarınız eklenince grafik görünecek</p>
                    </div>
                  )}
                </div>

                {/* GÜNLÜK ORTALAMA KARŞILAŞTIRMAsI */}
                <div className="prn-chart-container">
                  <h3>� Dönemsel Ortalama Karşılaştırma ({selectedPeriod})</h3>
                  {getFilteredChartData(chartData, selectedPeriod) && getFilteredChartData(chartData, selectedPeriod).length > 0 ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <BarChart 
                        width={Math.max(800, window.innerWidth - 150)} 
                        height={450} 
                        data={[getAverageStats(chartData, selectedPeriod) || { name: 'Ortalama', calories: 1900, protein: 98, carbs: 222, fat: 70 }]} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                        />
                        <YAxis 
                          yAxisId="left" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                          label={{ value: 'Kalori (kcal)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickLine={{ stroke: '#ccc' }}
                          axisLine={{ stroke: '#ccc' }}
                          label={{ value: 'Gram (g)', angle: 90, position: 'insideRight', style: { fill: '#666' } }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Bar 
                          dataKey="calories" 
                          fill="#ff7300" 
                          yAxisId="left" 
                          name="Kalori (kcal)"
                          radius={[8, 8, 0, 0]}
                          barSize={60}
                        />
                        <Bar 
                          dataKey="protein" 
                          fill="#e74c3c" 
                          yAxisId="right" 
                          name="Protein (g)"
                          radius={[8, 8, 0, 0]}
                          barSize={60}
                        />
                        <Bar 
                          dataKey="carbs" 
                          fill="#3498db" 
                          yAxisId="right" 
                          name="Karbonhidrat (g)"
                          radius={[8, 8, 0, 0]}
                          barSize={60}
                        />
                        <Bar 
                          dataKey="fat" 
                          fill="#f39c12" 
                          yAxisId="right" 
                          name="Yağ (g)"
                          radius={[8, 8, 0, 0]}
                          barSize={60}
                        />
                      </BarChart>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <p style={{ fontSize: '16px', marginBottom: '10px' }}>📊 Veri bulunamadı</p>
                      <p style={{ fontSize: '14px' }}>Yemek kayıtlarınız eklenince grafik görünecek</p>
                    </div>
                  )}
                </div>

                {/* İSTATİSTİKLER ÖZETİ */}
                <div className="prn-stats-summary">
                  <h3>📊 İstatistikler ({selectedPeriod})</h3>
                  <div className="prn-stats-grid">
                    {(() => {
                      const avgStats = getAverageStats(chartData, selectedPeriod);
                      return (
                        <>
                          <div className="prn-stat-box">
                            <h4>🔥 Ortalama Kalori</h4>
                            <p className="prn-stat-value">{Math.round(avgStats.calories)}</p>
                            <p className="prn-stat-unit">kcal/gün</p>
                          </div>
                          <div className="prn-stat-box">
                            <h4>🥩 Ortalama Protein</h4>
                            <p className="prn-stat-value">{(Math.round(avgStats.protein * 10) / 10)}</p>
                            <p className="prn-stat-unit">g/gün</p>
                          </div>
                          <div className="prn-stat-box">
                            <h4>🌾 Ortalama Karbonhidrat</h4>
                            <p className="prn-stat-value">{(Math.round(avgStats.carbs * 10) / 10)}</p>
                            <p className="prn-stat-unit">g/gün</p>
                          </div>
                          <div className="prn-stat-box">
                            <h4>🧈 Ortalama Yağ</h4>
                            <p className="prn-stat-value">{(Math.round(avgStats.fat * 10) / 10)}</p>
                            <p className="prn-stat-unit">g/gün</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}

            {/* HAFTALIK MAKRO ÖRTÜLERİ */}
            <div className="prn-macros-section">
              <h3>🥗 Haftalık Makro Ortalamaları</h3>
              <div className="prn-macros-grid">
                <div className="prn-macro-card">
                  <h4>🥩 Protein</h4>
                  <p className="prn-macro-value">{recommendations.avgStats.avgProtein.toFixed(1)}</p>
                  <p className="prn-macro-unit">g/gün</p>
                </div>
                <div className="prn-macro-card">
                  <h4>🌾 Karbonhidrat</h4>
                  <p className="prn-macro-value">{recommendations.avgStats.avgCarbs.toFixed(1)}</p>
                  <p className="prn-macro-unit">g/gün</p>
                </div>
                <div className="prn-macro-card">
                  <h4>🧈 Yağ</h4>
                  <p className="prn-macro-value">{recommendations.avgStats.avgFat.toFixed(1)}</p>
                  <p className="prn-macro-unit">g/gün</p>
                </div>
              </div>
            </div>

            {/* ATLANMIŞ ÖĞÜNLER */}
            {recommendations.avgStats.skippedMeals && recommendations.avgStats.skippedMeals.length > 0 && (
              <div className="prn-skipped-section">
                <h3>⚠️ Atlanmış Öğünler (Geçen Hafta)</h3>
                <div className="prn-skipped-list">
                  {recommendations.avgStats.skippedMeals.map((skipped, idx) => (
                    <div key={idx} className="prn-skipped-item">
                      <span className="prn-skipped-date">
                        {skipped.day} - {new Date(skipped.date).toLocaleDateString('tr-TR', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="prn-skipped-meal">
                        {skipped.mealType === 'breakfast' && '🌅 Kahvaltı'}
                        {skipped.mealType === 'lunch' && '🍽️ Öğle Yemeği'}
                        {skipped.mealType === 'dinner' && '🌙 Akşam Yemeği'}
                        {skipped.mealType === 'snack' && '🍎 Ara Öğün'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="prn-skipped-tip">
                  💡 <strong>İpucu:</strong> Tüm öğünleri kaydetmek, daha doğru analiz ve kişiselleştirilmiş öneriler almaya yardımcı olacaktır.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BESLENME ANALİZİ SEKMESİ */}
        {selectedTab === 'nutrition' && (
          <div className="prn-tab-content">
            <div className="prn-recommendations">
              {recommendations.nutritionRecommendations.map((rec, idx) => (
                <div key={idx} className={`prn-rec-card prn-rec-${rec.severity}`}>
                  <div className="prn-rec-header">
                    <h3>{rec.title}</h3>
                    <span className={`prn-severity-badge ${rec.severity}`}>
                      {rec.severity === 'success' ? '✓' : rec.severity === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                  </div>
                  <p className="prn-rec-message">{rec.message}</p>
                  <div className="prn-rec-tip">
                    <strong>💡 İpucu:</strong> {rec.tip}
                  </div>
                </div>
              ))}
            </div>

            {/* YAŞ VE CİNSİYETE GÖRE ÖNERILER */}
            <div className="prn-age-based">
              <h3>👥 Özel Tavsiyeler</h3>
              <div className="prn-age-cards">
                {recommendations.ageRecommendations.map((rec, idx) => (
                  <div key={idx} className="prn-age-card">
                    <h4>{rec.icon} {rec.title}</h4>
                    <ul>
                      {rec.items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÖNERILEN BESLENME PLANI SEKMESİ */}
        {selectedTab === 'mealplan' && (
          <div className="prn-tab-content">
            <div className="prn-meal-plan">
              {recommendations.mealPlanRecommendations.map((meal, idx) => (
                <div key={idx} className="prn-meal-card">
                  <div className="prn-meal-header">
                    <h4>{meal.meal}</h4>
                    <span className="prn-meal-time">⏰ {meal.timing}</span>
                  </div>
                  <p className="prn-meal-recommendation">
                    {meal.recommendation}
                  </p>
                  <div className="prn-meal-calories">
                    <span>🔥 {meal.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="prn-meal-note">
              <h4>📌 Beslenme Planı Notları</h4>
              <ul>
                <li>Bu plan, kişisel profiliniz ve hedefleriniz doğrultusunda hazırlanmıştır.</li>
                <li>Günlük kalori hedefini karşılayan esnek bir yapı sunmaktadır.</li>
                <li>Su tüketimini günde 2.5-3 litre olacak şekilde ayarlayın.</li>
                <li>Her öğün, dengeli makro besin öğeleri içermektedir.</li>
                <li>Kişisel alerjiler veya pref bulunması durumunda değiştirebilirsiniz.</li>
              </ul>
            </div>
          </div>
        )}

        {/* İPUÇLARI SEKMESİ - BMI VE KİLO DURUMUNA DAYALI */}
        {selectedTab === 'tips' && (
          <div className="prn-tab-content">
            {/* KILO/DURUM BAŞLIĞI */}
            <div className="prn-weight-status-card">
              <h3>⚖️ KİLO DURUMUnuz</h3>
              <div className="prn-weight-status-badge">
                {recommendations.personalizedTips.weightStatus === 'ZAYIF' && (
                  <div className="badge badge-underweight">🟦 ZAYIF - Kilo almaya ihtiyacınız var</div>
                )}
                {recommendations.personalizedTips.weightStatus === 'NORMAL' && (
                  <div className="badge badge-normal">🟩 NORMAL - Ideal kilondasınız</div>
                )}
                {recommendations.personalizedTips.weightStatus === 'FAZLA KİLO' && (
                  <div className="badge badge-overweight">🟨 FAZLA KİLO - Kilo vermeye ihtiyacınız var</div>
                )}
                {recommendations.personalizedTips.weightStatus === 'OBESİTE' && (
                  <div className="badge badge-obese">🟥 OBESİTE - Tıbbi desteğe ihtiyaç duyabilirsiniz</div>
                )}
              </div>
            </div>

            {/* KIŞISELLEŞTIRILMIŞ İPUÇLARI */}
            <div className="prn-personalized-tips">
              <h3>💡 Sizin İçin Özel İpuçları</h3>
              <div className="prn-tips-list">
                {recommendations.personalizedTips.weightTips.map((tip, idx) => (
                  <div key={idx} className="prn-tip-item">
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GENEL İPUÇLARI */}
            <div className="prn-general-tips">
              <h3>📋 Genel Beslenme İpuçları</h3>
              <div className="prn-tips-grid">
                <div className="prn-tip-card">
                  <h4>💧 Hidrasyon</h4>
                  <ul>
                    <li>Günde en az 2.5-3 litre su için</li>
                    <li>Sabah ilk işin su içmesi cildi toklaştırır</li>
                    <li>Öğünlerle birlikte su tüketimini artırın</li>
                    <li>Spordan 2 saat sonra ekstra su tüketin</li>
                  </ul>
                </div>

                <div className="prn-tip-card">
                  <h4>🕐 Beslenme Zamanlaması</h4>
                  <ul>
                    <li>Düzenli öğün saatleri vücut ritminizi düzeltir</li>
                    <li>Sabah kahvaltısını atlamayın (metabolizmayı başlatır)</li>
                    <li>Gece yarısından 2 saat önce yemek bitirin</li>
                    <li>Ara öğünler enerjinizi stabil tutar</li>
                  </ul>
                </div>

                <div className="prn-tip-card">
                  <h4>🏋️ Egzersiz ve Beslenme</h4>
                  <ul>
                    <li>Egzersizden 1.5-2 saat sonra protein + karbonhidrat alın</li>
                    <li>Ön antrenman için hafif bir ara öğün yeterlidir</li>
                    <li>Kas geliştirmek için günde 1.6-2.2g/kg protein hedefleyin</li>
                    <li>Düzenli egzersiz metabolizmanızı hızlandırır</li>
                  </ul>
                </div>

                <div className="prn-tip-card">
                  <h4>🛒 Alışveriş Listeleri</h4>
                  <ul>
                    <li>Protein kaynakları: Tavuk, balık, yumurta, peynir</li>
                    <li>Karbonhidratlar: Pirinç, patates, ekmek, tatlı patates</li>
                    <li>Sağlıklı yağlar: Zeytinyağı, fındık, ceviz, avokado</li>
                    <li>Sebze ve meyveler: Renk çeşitliliğine dikkat edin</li>
                  </ul>
                </div>

                <div className="prn-tip-card">
                  <h4>📊 İlerlemeyi Takip Etme</h4>
                  <ul>
                    <li>Sakin, haftalık terazi ölçümü yapın (günlük dalgalanmalar doğaldır)</li>
                    <li>Kilo yanında vücut çevrelerini de ölçün</li>
                    <li>Enerji seviyesi ve uykunuz iyileşti mi gözleyin</li>
                    <li>Her 2 haftada bir önerilerinizi güncelleyin</li>
                  </ul>
                </div>

                <div className="prn-tip-card">
                  <h4>⚠️ Kaçınılması Gereken Hatalar</h4>
                  <ul>
                    <li>Aşırı kısıtlı diyetler uzun vadede başarısız olur</li>
                    <li>Tüm yağları kesmeyin, sağlıklı yağlara ihtiyacınız var</li>
                    <li>Öğünleri atlamak metabolizmayı yavaşlatır</li>
                    <li>Nitelik kadar miktara da dikkat edin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Custom Hook: Kullanıcının sağlık profil bilgilerini getirir
 * Diyabet, tansiyon, alerji, hastalık gibi bilgileri içerir
 * 
 * Kullanım:
 * const { healthProfile, loading, isDiabetic, isHypertensive } = useHealthProfile();
 */
export const useHealthProfile = () => {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHealthProfile = async () => {
      try {
        setLoading(true);
        
        // users dokümandan sağlık bilgileri oku
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setHealthProfile({
            allergies: userData.allergies || "",
            isDiabetic: userData.isDiabetic || false,
            diabeticType: userData.diabeticType || "",
            isHypertensive: userData.isHypertensive || false,
            bloodPressure: userData.bloodPressure || "",
            hasHeartDisease: userData.hasHeartDisease || false,
            hasKidneyDisease: userData.hasKidneyDisease || false,
            hasLiverDisease: userData.hasLiverDisease || false,
            hasThyroidDisease: userData.hasThyroidDisease || false,
            otherDiseases: userData.otherDiseases || "",
            medications: userData.medications || "",
            dietaryRestrictions: userData.dietaryRestrictions || "",
            activityLevel: userData.activityLevel || "moderate",
          });
        } else {
          setHealthProfile(null);
        }
      } catch (err) {
        console.error("Sağlık profili yükleme hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthProfile();
  }, [user]);

  return {
    healthProfile,
    loading,
    error,
    isDiabetic: healthProfile?.isDiabetic || false,
    isHypertensive: healthProfile?.isHypertensive || false,
    diabeticType: healthProfile?.diabeticType || "",
    allergies: healthProfile?.allergies || "",
    dietaryRestrictions: healthProfile?.dietaryRestrictions || "",
    hasHeartDisease: healthProfile?.hasHeartDisease || false,
    hasKidneyDisease: healthProfile?.hasKidneyDisease || false,
    hasLiverDisease: healthProfile?.hasLiverDisease || false,
    hasThyroidDisease: healthProfile?.hasThyroidDisease || false,
    medications: healthProfile?.medications || "",
    otherDiseases: healthProfile?.otherDiseases || "",
    activityLevel: healthProfile?.activityLevel || "moderate",
  };
};

/**
 * Diyabet hastası için kalori ve makro önerileri döndür
 */
export const getDiabeticMacroRecommendations = (weight, diabeticType = "type2") => {
  const baseCalories = weight * 25; // Diyabet hastaları için düşük kalori
  
  return {
    type1: {
      description: "Tip 1 Diyabet: Sürekli insülin yönetimi gerektirir",
      calories: baseCalories,
      protein: { percentage: 25, grams: (baseCalories * 0.25) / 4 }, // 25% protein
      carbs: { percentage: 45, grams: (baseCalories * 0.45) / 4, note: "Düşük GI (Glisemik İndeks) karbonhidratlar tercih edilir" },
      fat: { percentage: 30, grams: (baseCalories * 0.30) / 9 },
      fiber: { grams: 30, note: "Kan şekeri kontrolü için önemli" },
      sodium: { grams: 2.3, note: "Kalp sağlığı için düşük tutulmalı" },
      tips: [
        "Karbonhidratları sayın ve dağıtın",
        "Düşük GI yiyecekler seçin",
        "Hiperglisemi ve hipoglisemi belirtilerini bilin",
        "İlaç ve beslenme zamanlarını koordine edin",
        "Düzenli kan şekeri kontrolü yapın"
      ]
    },
    type2: {
      description: "Tip 2 Diyabet: Yaşam tarzı değişikliği ve ilaç tedavisi",
      calories: baseCalories,
      protein: { percentage: 30, grams: (baseCalories * 0.30) / 4 }, // 30% protein (doygunluk)
      carbs: { percentage: 40, grams: (baseCalories * 0.40) / 4, note: "Düşük GI karbonhidratlar tercih edilir" },
      fat: { percentage: 30, grams: (baseCalories * 0.30) / 9 },
      fiber: { grams: 35, note: "Kan şekeri kontrolü ve sindirim için önemli" },
      sodium: { grams: 2.3 },
      tips: [
        "Düzenli egzersiz yapın (en az 150 dk/hafta)",
        "Kilo kaybı önemli etki yaratabilir",
        "İşlenmiş gıdalardan uzak durun",
        "Sıvı şekerleri kesinlikle tüketmeyin",
        "Öğün öncesi fiber alın"
      ]
    },
    prediabetic: {
      description: "Prediabetik: Diyabeti önlemek için acil müdahale gerekli",
      calories: baseCalories - 300, // Kilo kaybı hedefi
      protein: { percentage: 30, grams: (baseCalories * 0.30) / 4 },
      carbs: { percentage: 40, grams: (baseCalories * 0.40) / 4 },
      fat: { percentage: 30, grams: (baseCalories * 0.30) / 9 },
      fiber: { grams: 35 },
      sodium: { grams: 2.3 },
      tips: [
        "Kilo kaybı birincil hedef (%5-10 kaybı yeterli)",
        "Haftada 5 gün 30 dakika egzersiz yapın",
        "Tam tahıl ürünleri tercih edin",
        "Şekerlü içecekleri tamamen kesin",
        "Sağlıklı kilo kaybı = 0.5-1 kg/hafta"
      ]
    }
  };
};

/**
 * Hipertansiyon (tansiyon) hastası için tavsiyeler
 */
export const getHypertensionRecommendations = () => {
  return {
    sodiumLimit: 2300, // mg/gün (ideal: 1500)
    potassiumTarget: 3500, // mg/gün
    calcium: 1200, // mg/gün
    magnesium: 400, // mg/gün
    alcohol: { max: 1, note: "1 içki/gün kadınlar, 2 erkekler" },
    caffeine: { recommendation: "Sınırlandır", max: 400 }, // mg/gün
    foods: {
      include: [
        "Yeşil yapraklı sebzeler (potasyum)",
        "Balık ve deniz ürünleri (omega-3)",
        "Tam tahıllar",
        "Kuru meyveler",
        "Beslenme yağları (zeytinyağı)",
        "Düşük yağlı süt ürünleri"
      ],
      avoid: [
        "Tuzlu işlenmiş gıdalar",
        "Deli et ve sosisler",
        "Tatlı ve şekerli içecekler",
        "Yüksek yağlı et",
        "Hazır sauclar"
      ]
    },
    tips: [
      "DASH diyeti izleyin",
      "Düzenli egzersiz yapın",
      "Stres azaltın",
      "Uyku kalitesini artırın",
      "Ağırlık kontrol edin"
    ]
  };
};

/**
 * Belirli bir alerjiye göre öneriler
 */
export const getAllergyRecommendations = (allergy) => {
  const recommendations = {
    "süt alerjisi": {
      avoid: ["Süt", "Peynir", "Tereyağ", "Dondurma", "Krema"],
      substitute: ["Soya sütü", "Badem sütü", "Avena sütü", "Hindistan cevizi sütü"],
      crossReact: ["Keçi sütü", "Koyun sütü"]
    },
    "fistık alerjisi": {
      avoid: ["Fıstık", "Fıstık ezmesi", "Fıstık yağı", "Fıstıkla yapılan yemekler"],
      crossReact: ["Ayçiçeği", "Susam"],
      safe: ["Badem", "Ceviz", "Kaju", "Fındık"]
    },
    "gluten intoleransı": {
      avoid: ["Buğday", "Arpa", "Çavdar", "Ekmek", "Makarna"],
      safe: ["Mısır", "Pirinç", "Kinoa", "Patates", "Çeltik"],
      warning: "Çapraz kontaminasyona dikkat edin"
    },
    "yumurta alerjisi": {
      avoid: ["Yumurta", "Yumurtayı içeren gıdalar"],
      checkLabels: ["Bazı aşılar", "Bazı bira türleri"]
    }
  };
  
  return recommendations[allergy.toLowerCase()] || null;
};

export default useHealthProfile;

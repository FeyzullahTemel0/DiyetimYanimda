import { useState } from "react";
import "./DietAdvice.css";

// --- VERİ YAPISI ---
// Tüm içerik bu merkezi nesnede toplanmıştır.
// Bu yapı, yeni hedefler veya zaman dilimleri eklemeyi kolaylaştırır.

const GOALS = [
  { key: "weightLoss", label: "Kilo Vermek İstiyorum", emoji: "📉" },
  { key: "weightGain", label: "Kilo Almak İstiyorum", emoji: "📈" },
  { key: "muscleGain", label: "Kas Kütlesi Kazanmak İstiyorum", emoji: "💪" },
];

const PERIODS = [
  { key: "daily",    label: "Günlük Plan",    emoji: "☀️" },
  { key: "weekly",   label: "Haftalık Plan",   emoji: "📆" },
  { key: "monthly",  label: "Aylık Plan",      emoji: "🗓️" },
  { key: "longTerm", label: "Uzun Dönem (3-12 Ay)", emoji: "🏆" },
];

const CONTENT = {
  // =================================================================
  // 1. KİLO VERME BÖLÜMÜ
  // =================================================================
  weightLoss: {
    daily: {
      tips: [
        "Güne büyük bir bardak su ile başlayın. Metabolizmayı harekete geçirir.",
        "Kahvaltıyı atlamayın. Protein ve lif ağırlıklı bir kahvaltı gün boyu tok kalmanıza yardımcı olur.",
        "Öğünlerinize mutlaka salata veya haşlanmış sebze ekleyin. Hacim yaratarak daha az kaloriyle doymanızı sağlar.",
        "Ara öğünlerde işlenmiş gıdalar yerine bir avuç kuruyemiş, bir meyve veya bir kase yoğurt tercih edin.",
        "Akşam yemeğini mümkün olduğunca erken ve hafif tutmaya çalışın. Yatmadan en az 3-4 saat önce yemeği bitirin.",
        "Günde en az 2.5 - 3 litre su tüketin. Su, tokluk hissine ve toksinlerin atılmasına yardımcı olur.",
      ],
      menu: {
        "Kahvaltı (08:00)": "2 adet haşlanmış yumurta, bol yeşillik (roka, maydanoz), 5-6 adet zeytin, 1 dilim tam buğday ekmeği.",
        "Ara Öğün (11:00)": "1 adet yeşil elma ve 10 adet çiğ badem.",
        "Öğle (13:00)": "150g ızgara tavuk göğsü, bol yeşillikli ve zeytinyağlı-limonlu salata, 1 kase yoğurt.",
        "Ara Öğün (16:00)": "1 fincan yeşil çay, 1 kase sade yoğurt (içine 1 çay kaşığı tarçın eklenebilir).",
        "Akşam (19:00)": "1 porsiyon zeytinyağlı sebze yemeği (ıspanak, brokoli, kabak vb.), 4-5 yemek kaşığı bulgur pilavı.",
      },
    },
    weekly: {
      tips: [
        "Haftada en az 3-4 gün, 45-60 dakikalık kardiyo (yürüyüş, koşu, bisiklet) hedefleyin.",
        "Haftada 2 gün kuvvet antrenmanı ekleyin. Kas kütlesini korumak, metabolizmayı hızlandırır.",
        "Haftalık yemek planı (meal prep) yapın. Bu, sağlıksız seçeneklere yönelmenizi engeller.",
        "Haftada bir günü 'ödül öğünü' olarak belirleyin, 'ödül günü' değil. Bu, motivasyonunuzu yüksek tutar.",
        "Haftada 2 kez mutlaka balık tüketin. Omega-3 yağ asitleri metabolizmayı destekler.",
        "İşlenmiş gıdaları (salam, sosis, cips, hazır soslar) ve şekerli içecekleri hayatınızdan tamamen çıkarın.",
      ],
      menu: {
        "Genel Haftalık Prensipler": [
          "**Pazartesi / Perşembe:** Baklagil günleri (mercimek çorbası, nohut yemeği).",
          "**Salı / Cuma:** Beyaz et günleri (tavuk, hindi).",
          "**Çarşamba / Cumartesi:** Balık günleri (ızgara somon, fırında levrek).",
          "**Pazar:** Kırmızı et günü (sınırlı miktarda, yağsız ızgara) ve serbest öğün hakkı.",
          "**Her gün:** Sabah kahvaltısı sabit tutulabilir, akşam yemekleri ana protein kaynağına göre değiştirilebilir. Öğle yemekleri genellikle bir önceki günün akşam yemeğinin bir porsiyonu veya bol salata olabilir.",
        ]
      },
    },
    monthly: {
      tips: [
        "Ayın başında ve sonunda mezura ile ölçüm yapın (bel, kalça, basen). Kilo takibinden daha motive edicidir.",
        "Bir aylık hedefinizi belirleyin (örn: 2-4 kg kayıp). Gerçekçi hedefler koymak önemlidir.",
        "Plato dönemine girerseniz (kilo vermenin durması), şaşırtma diyeti uygulayın. Birkaç gün kalori alımını hafifçe artırıp sonra tekrar düşürmek işe yarayabilir.",
        "Her hafta farklı bir sağlıklı tarifi deneyin. Bu, diyetin sıkıcı hale gelmesini önler.",
        "Sosyal etkinlikleri planınıza dahil edin. Dışarıda yiyecekseniz menüyü önceden inceleyip sağlıklı seçimler yapın.",
      ],
    },
    longTerm: {
      tips: [
        "Sürdürülebilirlik anahtardır. Yasaklarla dolu bir diyet yerine, '80/20 kuralını' (zamanın %80'i sağlıklı, %20'si esnek) benimseyin.",
        "Ulaştığınız ideal kiloyu korumak için, harcadığınız kalori ile aldığınız kaloriyi dengelemeyi öğrenin.",
        "Egzersizi bir yaşam biçimi haline getirin. Sevdiğiniz bir sporu bulun (dans, yüzme, yoga vb.).",
        "6 ayda bir kan değerlerinizi kontrol ettirerek vücudunuzun ihtiyaçlarını takip edin.",
        "Beslenme konusunda kendinizi eğitmeye devam edin. Etiket okuma alışkanlığı kazanın.",
        "Stres yönetimini öğrenin (meditasyon, hobi vb.). Stres, kortizol hormonunu artırarak kilo alımını tetikleyebilir.",
      ],
    },
  },
  // =================================================================
  // 2. KİLO ALMA BÖLÜMÜ
  // =================================================================
  weightGain: {
    daily: {
      tips: [
        "Asla öğün atlamayın, özellikle kahvaltıyı. Güne enerjik ve kalori alarak başlayın.",
        "Porsiyonlarınızı yavaş yavaş büyütün. Bir anda çok fazla yemek sindirim sorunlarına yol açabilir.",
        "Kalorisi yoğun ama besleyici gıdalar tercih edin: Fıstık ezmesi, avokado, zeytinyağı, kuruyemişler, kuru meyveler.",
        "Ara öğünleri atlamayın. 3 ana öğün arasına 2-3 adet kaliteli ara öğün ekleyin.",
        "Yemeklerle birlikte sıvı alımını azaltın, bu midenizin çabuk dolmasını engeller. Suyu öğün aralarında için.",
        "Yatmadan önce sağlıklı bir ara öğün tüketin (örn: süt ve muz, kazein proteini içeren süzme peynir).",
      ],
      menu: {
        "Kahvaltı (08:00)": "3 yumurtalı peynirli omlet, 2 dilim tam buğday ekmeği üzerine avokado püresi, 1 bardak tam yağlı süt.",
        "Ara Öğün (11:00)": "Büyük bir avuç fındık, ceviz ve kuru üzüm karışımı.",
        "Öğle (13:00)": "200g ızgara biftek, bol porsiyon fırında patates veya makarna, yanında zeytinyağlı salata.",
        "Ara Öğün (16:00)": "Smoothie: 1 ölçek protein tozu, 1 bardak süt, 1 muz, 1 yemek kaşığı fıstık ezmesi.",
        "Akşam (19:00)": "1 porsiyon tavuklu veya etli pilav/makarna, yanında bol yoğurt.",
        "Gece (22:00)": "1 kase tam yağlı yoğurt ve 1 adet meyve.",
      },
    },
    weekly: {
      tips: [
        "Haftada en az 3 gün ağırlık antrenmanı yapın. Alınan kalorilerin yağa değil, kasa dönüşmesi için bu şarttır.",
        "Kardiyo egzersizlerini sınırlı tutun. Haftada 1-2 gün, 20-30 dakikayı geçmeyecek şekilde yapılabilir.",
        "Haftalık yemek planı yaparak kalori hedefinize ulaştığınızdan emin olun.",
        "Salatalarınıza ve yemeklerinize ekstra zeytinyağı, ceviz veya ay çekirdeği ekleyerek kalorisini artırın.",
        "Makarna ve pilav gibi karbonhidrat kaynaklarını tam tahıllı olanlardan seçerek daha kaliteli kalori alın.",
        "Haftada bir tartılarak ilerlemenizi takip edin. Hedef, haftada 0.25-0.5 kg almaktır.",
      ],
      menu: {
        "Genel Haftalık Prensipler": [
            "**Her gün:** 3 ana, 3 ara öğün kuralına uyun.",
            "**Antrenman günleri:** Antrenmandan 1-2 saat önce karbonhidrat (muz, yulaf), antrenman sonrası protein ve karbonhidrat (proteinli süt, tavuklu pilav) tüketin.",
            "**Çorbalar:** Kremalı veya baklagilli, besleyici çorbalar tercih edin.",
            "**Smoothie'ler:** Her gün farklı bir besleyici smoothie tarifi deneyerek sıvı kalori alımını artırın.",
            "**Çeşitlilik:** Her gün aynı şeyleri yemek yerine, farklı protein (kırmızı et, tavuk, balık, yumurta) ve karbonhidrat (pirinç, makarna, bulgur, patates) kaynaklarını tüketin.",
        ]
      },
    },
    monthly: {
      tips: [
        "Bir ay sonunda kilo alımınız yavaşladıysa, günlük kalori alımınızı 250-500 kcal daha artırın.",
        "Antrenman programınızı değiştirin. Vücut aynı rutine alıştığında gelişimi yavaşlar.",
        "Yemek günlükleri tutarak hangi günlerde daha az yediğinizi tespit edin ve o günleri telafi etmeye çalışın.",
        "Aylık ilerleme fotoğrafları çekin. Vücuttaki değişim sadece tartıda görülmez.",
        "Sabırlı olun. Sağlıklı kilo almak, kilo vermek kadar zaman ve disiplin gerektirir.",
      ],
    },
    longTerm: {
      tips: [
        "İstediğiniz kiloya ulaştıktan sonra 'kirli bulk' yani abur cuburla kilo alma tuzağına düşmeyin. Temiz beslenmeye devam edin.",
        "Kilo koruma döneminde, kalori alımını hafifçe azaltarak dengeyi bulun.",
        "Ağırlık antrenmanını hayatınızın bir parçası haline getirin. Bu, kazandığınız kütleyi korumanın tek yoludur.",
        "Beslenme alışkanlıklarınızı kalıcı hale getirin. 'Diyet' bitti diye eski düzene dönmeyin.",
        "Vücudunuzu dinleyin. İştahınız ve enerji seviyeniz size doğru yolda olup olmadığınızı söyleyecektir.",
      ],
    },
  },
  // =================================================================
  // 3. KAS KÜTLESİ KAZANMA BÖLÜMÜ
  // =================================================================
  muscleGain: {
    daily: {
      tips: [
        "Vücut ağırlığınızın kilogramı başına en az 1.6 - 2.2 gram protein almayı hedefleyin.",
        "Proteini gün içine yayın. Her öğünde 20-30 gram protein olmasına özen gösterin.",
        "Antrenmandan 1-2 saat önce kompleks karbonhidrat (yulaf, esmer pirinç) ve bir miktar protein içeren bir öğün tüketin.",
        "Antrenmandan sonraki ilk 1-2 saat içinde protein ve hızlı sindirilen karbonhidrat içeren bir öğün (protein tozu ve muz gibi) tüketin.",
        "Yeterli kalori aldığınızdan emin olun. Kas yapımı enerji gerektirir. Hafif bir kalori fazlası (250-500 kcal) idealdir.",
        "Uyku kas gelişimi için kritiktir. Günde 7-9 saat kaliteli uyku uyumayı hedefleyin. Büyüme hormonu en çok uykuda salgılanır.",
      ],
      menu: {
        "Kahvaltı (08:00)": "4 yumurta beyazı ve 1 sarısından yapılmış lor peynirli omlet, 1 kase yulaf ezmesi (süt ve fındık parçaları ile).",
        "Ara Öğün (11:00)": "1 kutu light ton balığı ve tam buğday krakerleri.",
        "Öğle (13:00)": "200g haşlanmış veya ızgara tavuk göğsü, 1 porsiyon kinoa veya esmer pirinç, haşlanmış brokoli.",
        "Antrenman Öncesi (16:00)": "1 adet muz ve bir avuç badem.",
        "Antrenman Sonrası (18:30)": "1 ölçek Whey Protein tozu. 1 saat sonra akşam yemeği.",
        "Akşam (19:30)": "200g ızgara somon veya yağsız kırmızı et, büyük porsiyon fırında tatlı patates, yeşil salata.",
      },
    },
    weekly: {
      tips: [
        "Haftada 4-5 gün, yapılandırılmış bir ağırlık antrenmanı programı uygulayın (örn: itme-çekme-bacak, üst vücut-alt vücut).",
        "Progressive Overload (Aşamalı Yükleme) ilkesini uygulayın. Her hafta ağırlığı, tekrar sayısını veya set sayısını artırmaya çalışın.",
        "Dinlenme günlerine sadık kalın. Kaslar dinlenirken büyür. Aşırı antrenman (overtraining) gelişimizi engeller.",
        "Haftalık protein hedefinize ulaştığınızdan emin olmak için besinlerinizi tartın ve takip edin.",
        "Kreatin takviyesi kullanmayı düşünebilirsiniz. Güç ve kas kütlesi artışını desteklediği bilimsel olarak kanıtlanmıştır.",
        "Esneklik ve mobilite için antrenman sonrası esneme hareketleri veya haftada bir yoga/pilates ekleyin.",
      ],
       menu: {
        "Genel Haftalık Prensipler": [
            "**Protein Döngüsü:** Her gün farklı protein kaynakları (tavuk, hindi, balık, kırmızı et, yumurta, baklagiller, süt ürünleri) tüketin.",
            "**Karbonhidrat Zamanlaması:** Karbonhidratların büyük kısmını antrenman çevresinde (öncesi ve sonrası) tüketin.",
            "**Sağlıklı Yağlar:** Avokado, zeytinyağı, fındık gibi sağlıklı yağları ihmal etmeyin. Hormon üretimi için önemlidirler.",
            "**Meal Prep:** Pazar günleri haftalık tavuk, pilav ve sebzelerinizi hazırlayarak hafta içi düzeni kolaylaştırın.",
        ]
      },
    },
    monthly: {
      tips: [
        "Antrenman programınızı her 4-6 haftada bir güncelleyin. Vücudun adaptasyonunu kırmak için hareketleri, set/tekrar sayılarını değiştirin.",
        "İlerlemenizi takip edin: Kaldırdığınız ağırlıklar, vücut ölçüleri ve aylık fotoğraflar en iyi göstergelerdir.",
        "Eğer gelişim durduysa (plato), 'deload' haftası yapmayı düşünün. Bir hafta boyunca antrenman yoğunluğunu ve hacmini %50 azaltarak vücudun toparlanmasına izin verin.",
        "Beslenme planınızda küçük ayarlamalar yapın. Kilo alımınız çok hızlıysa kaloriyi hafifçe azaltın, yavaşsa artırın.",
        "Tekniğe odaklanın. Ağır kaldırmaktan daha önemlisi, hareketi doğru formda yapmaktır. Gerekirse bir uzmandan yardım alın.",
      ],
    },
    longTerm: {
      tips: [
        "Sabır ve tutarlılık en büyük silahınızdır. Kas inşa etmek yavaş bir süreçtir.",
        "Dönemleme (Periodizasyon) yapın. Yıl içinde 'bulk' (kilo ve kas kazanım odaklı) ve 'cut' (yağ yakım odaklı) dönemler planlayabilirsiniz.",
        "Yaşam boyu öğrenci olun. Beslenme ve antrenman bilimindeki yeni araştırmaları takip edin.",
        "Dinlenmenin ve toparlanmanın (uyku, beslenme, stres yönetimi) antrenman kadar önemli olduğunu asla unutmayın.",
        "Bu bir sprint değil, bir maraton. Kaslı bir vücut, sağlıklı alışkanlıkların bir sonucudur. Sürecin tadını çıkarın.",
      ],
    },
  },
};

// --- BİLEŞEN (COMPONENT) ---

export default function DietAdvice() {
  const [activeGoal, setActiveGoal] = useState("weightLoss");
  const [activePeriod, setActivePeriod] = useState("daily");

  const currentContent = CONTENT[activeGoal][activePeriod];

  const renderMenu = (menu) => {
    if (!menu) return <p>Bu dönem için örnek menü bulunmamaktadır.</p>;

    // Haftalık menü gibi liste formatında olanlar için
    if (Array.isArray(Object.values(menu)[0])) {
         return (
            <ul>
                {Object.entries(menu).map(([title, items]) => (
                    <li key={title}>
                        <strong>{title}:</strong>
                        <ul>
                            {items.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </li>
                ))}
            </ul>
         );
    }
    
    // Günlük menü gibi nesne formatında olanlar için
    return (
      <ul>
        {Object.entries(menu).map(([meal, description]) => (
          <li key={meal}>
            <strong>{meal}:</strong> {description}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="diet-container">
      <header className="page-header">
        <h1>Kişisel Beslenme ve Fitness Rehberi</h1>
        <p>Hedefinize uygun profesyonel tavsiyelerle yol haritanızı oluşturun.</p>
      </header>
      
      {/* 1. Adım: Ana Hedef Seçimi */}
      <section className="selection-section">
        <h2>1. Adım: Ana Hedefiniz Nedir?</h2>
        <div className="tabs goal-tabs">
          {GOALS.map((g) => (
            <button
              key={g.key}
              className={activeGoal === g.key ? "active" : ""}
              onClick={() => {
                setActiveGoal(g.key);
                setActivePeriod("daily"); // Hedef değiştiğinde varsayılan olarak günlük plana dön
              }}
            >
              <span className="emoji">{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Adım: Zaman Dilimi Seçimi */}
      <section className="selection-section">
        <h2>2. Adım: Hangi Zaman Dilimi İçin Plan Görmek İstersiniz?</h2>
        <div className="tabs period-tabs">
            {PERIODS.map(p => (
            <button
                key={p.key}
                className={activePeriod === p.key ? "active" : ""}
                onClick={() => setActivePeriod(p.key)}
            >
                <span className="emoji">{p.emoji}</span>
                <span>{p.label}</span>
            </button>
            ))}
      </div>
      </section>

      <hr className="divider" />

      {/* İçerik Alanı */}
      <main className="content-area">
        <h2 className="content-title">
          {GOALS.find(g => g.key === activeGoal).label} için 
          {' '}
          {PERIODS.find(p => p.key === activePeriod).label}
        </h2>
        <div className="content-grid">
            <div className="content-card">
              <h3>💡 Profesyonel Tavsiyeler</h3>
              <ul>
                {currentContent.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>

            {currentContent.menu && (
                 <div className="content-card">
                    <h3>🍽️ Örnek Menü / Plan</h3>
                    {renderMenu(currentContent.menu)}
                </div>
            )}
        </div>
      </main>

      <footer className="page-footer">
        <p><strong>Önemli Uyarı:</strong> Bu tavsiyeler genel bilgilendirme amaçlıdır ve profesyonel tıbbi tavsiye yerine geçmez. Herhangi bir diyet veya egzersiz programına başlamadan önce bir doktora veya diyetisyene danışmanız şiddetle tavsiye edilir. Özellikle kronik bir rahatsızlığınız varsa, bu adımı atlamayınız.</p>
      </footer>
    </div>
  );
}
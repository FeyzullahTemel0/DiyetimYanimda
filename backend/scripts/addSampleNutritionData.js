const admin = require("firebase-admin");
const serviceAccount = require("../src/services/firebaseAdminKey.json");

// Initialize without creating new app if already exists
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function addSampleData() {
  try {
    console.log("\n📝 Kategoriler güncelleniyor (slug bazlı upsert)...\n");

    const categories = [
      { name: "Kilo Verme", slug: "kilo-verme", icon: "🍎" },
      { name: "Sporcu Diyetleri", slug: "sporcu-diyet", icon: "💪" },
      { name: "Vegan Yaşam", slug: "vegan", icon: "🌱" },
      { name: "Şeker Hastaları", slug: "seker-hastalik", icon: "🍬" },
      { name: "Mental Sağlık", slug: "mental-saglik", icon: "🧠" },
    ];

    const categoryRefs = {};
    for (const cat of categories) {
      try {
        const snap = await db
          .collection("nutrition_categories")
          .where("slug", "==", cat.slug)
          .limit(1)
          .get();

        if (!snap.empty) {
          const doc = snap.docs[0];
          categoryRefs[cat.slug] = doc.id;
          await db.collection("nutrition_categories").doc(doc.id).update({ ...cat, updated_at: new Date() });
          console.log(`↺ Kategori güncellendi: ${cat.name} (ID: ${doc.id})`);
        } else {
          const docRef = await db.collection("nutrition_categories").add({ ...cat, created_at: new Date() });
          categoryRefs[cat.slug] = docRef.id;
          console.log(`✅ Kategori eklendi: ${cat.name} (ID: ${docRef.id})`);
        }
      } catch (e) {
        console.error(`❌ Kategori işlemi hatası: ${cat.name}`, e.message);
      }
    }

    console.log("\n📝 Etiketler güncelleniyor (isim bazlı upsert)...\n");

    const tags = [
      "fitness",
      "weight-loss",
      "energy",
      "sleep",
      "hydration",
      "muscle-gain",
      "metabolism",
      "nutrition",
    ];

    const tagRefs = {};
    for (const tag of tags) {
      try {
        const snap = await db
          .collection("nutrition_tags")
          .where("name", "==", tag)
          .limit(1)
          .get();

        if (!snap.empty) {
          const doc = snap.docs[0];
          tagRefs[tag] = doc.id;
          await db.collection("nutrition_tags").doc(doc.id).update({ name: tag, updated_at: new Date() });
          console.log(`↺ Etiket güncellendi: ${tag} (ID: ${doc.id})`);
        } else {
          const docRef = await db.collection("nutrition_tags").add({ name: tag, created_at: new Date() });
          tagRefs[tag] = docRef.id;
          console.log(`✅ Etiket eklendi: ${tag} (ID: ${docRef.id})`);
        }
      } catch (e) {
        console.error(`❌ Etiket işlemi hatası: ${tag}`, e.message);
      }
    }

    console.log("\n📝 Beslenme ipuçları ekleniyor (başlığa göre idempotent, 10'ar içerik)...\n");

    const tipsByCategory = {
      "kilo-verme": [
        {
          title: "Su ile Metabolizma Hızlandırma",
          short_description: "2-3 litre su içmek metabolizmayı destekler, tokluk hissini artırır.",
          content:
            "Yeterli su tüketimi termojenez yoluyla kalori yakımını destekler. Öğün öncesi 500 ml su, tokluk hissi sağlar ve enerji alımını azaltır.",
          tags: ["hydration", "weight-loss", "metabolism"],
          read_time: "2 dakika",
          is_featured: true,
        },
        {
          title: "Lifli Kahvaltı ile Açlık Kontrolü",
          short_description: "Yulaf ve chia tohumu sabah açlığını dengeler, kan şekerini yavaş yükseltir.",
          content:
            "Çözünür lif içeren yulaf beta-glukan sayesinde tokluk hormonlarını uyarır. Kahvaltıda 8-10 g lif almak gün içi atıştırma ihtiyacını azaltır.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Kalori Açığı Hesabı",
          short_description: "Günlük 500 kcal açık haftada ~0.5 kg yağ kaybı sağlar.",
          content:
            "Bazal metabolizma ve aktivite eklenerek harcama hesaplanır. 500-700 kcal açık sürdürülebilir kilo kaybı için yeterlidir, kas kaybını sınırlamak için protein koruması önemlidir.",
          tags: ["weight-loss", "metabolism", "fitness"],
          read_time: "3 dakika",
        },
        {
          title: "Akşam Karbonhidratını Azaltma",
          short_description: "Akşam düşük karbonhidrat, sabah insülin duyarlılığını iyileştirir.",
          content:
            "Akşam saatlerinde insülin duyarlılığı düşer. Nişastalı yiyecekleri gündüze almak glisemik yükü dengeler, leptin ve ghrelin ritmini iyileştirir.",
          tags: ["weight-loss", "nutrition", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Haftalık 150 Dakika Kardiyo",
          short_description: "Orta tempolu yürüyüş ve koşu yağ yakımını hızlandırır.",
          content:
            "Dünya Sağlık Örgütü haftada 150-300 dakika orta tempo önerir. Kardiyo ile enerji açığı desteklenir, kardiyovasküler sağlık korunur.",
          tags: ["fitness", "weight-loss", "energy", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Protein Dağılımı 30/30/30",
          short_description: "Her öğünde 25-35 g protein termik etkiyi artırır, kası korur.",
          content:
            "Protein termik etkisi %20-30'dur. Gün içine yayılmış 30 g'lık porsiyonlar kas proteini sentezini destekler, açlık hormonu ghrelin'i baskılar.",
          tags: ["nutrition", "metabolism", "weight-loss"],
          read_time: "3 dakika",
        },
        {
          title: "Şekerli İçecekleri Sıfırlamak",
          short_description: "Günlük 1 kutu gazlı içecek çıkarmak yılda ~6-7 kg kazanç sağlar.",
          content:
            "350 ml gazlı içecek ~140 kcal içerir. Günlük çıkarıldığında aylık 4200 kcal tasarruf eder, yağ depolanmasını azaltır.",
          tags: ["weight-loss", "nutrition", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "NEAT Artışı İçin Adım Hedefi",
          short_description: "Günde 8000-10000 adım enerji harcamasını anlamlı yükseltir.",
          content:
            "NEAT (egzersiz dışı aktiviteler) bazal harcamanın %15-50'sini oluşturabilir. Düzenli adım hedefi metabolik esnekliği destekler.",
          tags: ["fitness", "energy", "weight-loss", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Sodyum-Kalium Dengesi",
          short_description: "Tuz kısıp potasyum artırmak ödemi azaltır, kilo takibini iyileştirir.",
          content:
            "Günde 2.3 g sodyum sınırı ve 3.5 g potasyum alımı sıvı dengesini düzenler. Sebze-meyve ağırlıklı beslenme ödem kaynaklı kilo dalgalanmasını azaltır.",
          tags: ["hydration", "nutrition", "weight-loss"],
          read_time: "3 dakika",
        },
        {
          title: "Uyku ile Yağ Kaybı İlişkisi",
          short_description: "Gece 7-9 saat uyku leptin/ghrelin dengesini korur.",
          content:
            "Uyku eksikliği ghrelin'i artırır, iştahı yükseltir. Yeterli uyku kalori alımını düşürür ve kortizolü dengeler.",
          tags: ["sleep", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "16:8 Aralıklı Oruç Başlangıcı",
          short_description: "8 saat beslenme penceresi insülin duyarlılığını iyileştirebilir.",
          content:
            "16 saatlik açlıkta glikojen depoları boşalır ve yağ oksidasyonu artar. İlk hafta elektrolit ve su alımına dikkat etmek önemlidir.",
          tags: ["weight-loss", "metabolism", "hydration"],
          read_time: "3 dakika",
        },
        {
          title: "Baharatla Termojenik Destek",
          short_description: "Acı biber ve zencefil hafif termojenik etki sağlar.",
          content:
            "Kapsaisin ve gingerol, kahverengi yağ aktivitesini artırarak günlük enerji harcamasına küçük katkı yapabilir. Yemeklere eklemek iştahı da azaltır.",
          tags: ["metabolism", "nutrition", "weight-loss"],
          read_time: "2 dakika",
        },
        {
          title: "Porsiyon Kontrol Tabakları",
          short_description: "Göz kararı yerine ölçülü tabak düzeni kalori takibini kolaylaştırır.",
          content:
            "Tabağın yarısı sebze, çeyrek protein, çeyrek kompleks karbonhidrat düzeni günlük kalori açığını korumaya yardımcı olur.",
          tags: ["weight-loss", "nutrition", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Düşük Kalorili Sos Alternatifleri",
          short_description: "Yoğurt, hardal ve sirke bazlı soslar kaloriyi düşürür.",
          content:
            "Krema ve mayonez yerine yoğurt, hardal, limon ve baharatlarla sos hazırlamak öğün başına 100-200 kcal tasarruf sağlar.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Hafta Sonu Kalori Tuzağına Karşı Plan",
          short_description: "Hafta sonu restoran ve tatlı seçimlerini önceden planlayın.",
          content:
            "Hafta içi açığı hafta sonu kapatmamak için öğün değiş-tokuşu yapın, yüksek proteinli kahvaltı ve şekerli içeceksiz gün hedefleyin.",
          tags: ["weight-loss", "nutrition", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Alkolsüz 30 Gün Denemesi",
          short_description: "Alkolü kesmek kalori açığını ve uykuyu iyileştirir.",
          content:
            "Alkol metabolizması yağ oksidasyonunu baskılar, uykuyu böler. 30 gün ara vermek iştah kontrolü ve kilo kaybını hızlandırabilir.",
          tags: ["weight-loss", "sleep", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Günlük 30 Dakika Tempolu Yürüyüş",
          short_description: "Hafif kardiyo NEAT harcamasını yükseltir.",
          content:
            "Her gün 30 dk tempolu yürüyüş 150-200 kcal ek harcama sağlar, insülin duyarlılığını iyileştirir ve stres hormonu kortizolü dengeler.",
          tags: ["fitness", "weight-loss", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Haftada 2 Gün Kuvvet Antrenmanı",
          short_description: "Kas kütlesi arttıkça bazal metabolizma yükselir.",
          content:
            "Çok eklemli hareketlerle yapılan kuvvet antrenmanı kas proteini sentezini ve dinlenik enerji harcamasını artırır. Protein alımını destekleyin.",
          tags: ["fitness", "muscle-gain", "metabolism", "weight-loss"],
          read_time: "3 dakika",
        },
        {
          title: "Proteinli Ara Öğün Hazırlığı",
          short_description: "Yoğurt, lor ve haşlanmış yumurta açlık kontrolünü güçlendirir.",
          content:
            "Haftalık meal prep ile 20-25 g protein içeren ara öğünler glisemik kontrolü ve tokluğu destekler, aşırı yeme riskini azaltır.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Lif Öncelikli Akşam Öğünü",
          short_description: "Sebze ve salata ile başlayıp karbonhidratı sona bırakın.",
          content:
            "Lif önce geldiğinde glukoz emilimi yavaşlar, insülin yanıtı düşer. 10-15 g lif içeren giriş öğünü kilo yönetimini kolaylaştırır.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "3 dakika",
        },
      ],
      "sporcu-diyet": [
        {
          title: "Antrenman Öncesi Karbonhidrat",
          short_description: "Egzersizden 60-90 dk önce 1 g/kg karbonhidrat performansı artırır.",
          content:
            "Kas glikojeninin dolu olması yüksek yoğunluklu iş kapasitesini artırır. Muz, yulaf veya pirinç kolay sindirilir ve mideyi yormaz.",
          tags: ["energy", "fitness", "nutrition", "muscle-gain", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Antrenman Sonrası 3:1 Karbonhidrat/Protein",
          short_description: "Dayanıklılık sonrası 3:1 oranı glikojen yeniler, kas onarımını destekler.",
          content:
            "45-60 dk sonrası 0.8 g/kg karbonhidrat + 0.3 g/kg protein kas glikojenini hızla yeniler. Kakao sütü pratik bir seçenektir.",
          tags: ["energy", "muscle-gain", "fitness", "hydration"],
          read_time: "3 dakika",
        },
        {
          title: "Kreatin ile Güç Artışı",
          short_description: "Günde 3-5 g kreatin fosfokreatin depolarını destekler.",
          content:
            "Kreatin monohidrat kısa süreli, yüksek şiddetli egzersiz performansını artırır. Bol su ile alınması ve düzenli kullanımı önemlidir.",
          tags: ["fitness", "muscle-gain", "energy", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Protein Zamanlaması",
          short_description: "24 saatte 1.6-2.2 g/kg protein, öğün başına 0.4 g/kg yeterli.",
          content:
            "Kas proteini sentezi gün içi eşit dağılımla maksimize olur. Whey + tam gıdalar kombinasyonu hızlı ve yavaş sindirimi dengeler.",
          tags: ["muscle-gain", "nutrition", "fitness"],
          read_time: "3 dakika",
        },
        {
          title: "Elektrolit Desteği",
          short_description: "Uzun süren antrenmanda sodyum/kalium/magnezyum terle kaybolur.",
          content:
            "Saatte 300-700 mg sodyum takviyesi sıcak iklimde performans düşüşünü önler. Şekerli içecek yerine düşük şekerli elektrolit tercih edin.",
          tags: ["hydration", "energy", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Düşük Yağ, Yüksek Karbonhidrat Günleri",
          short_description: "Yoğun antrenman günlerinde yağ oranını düşürüp karbonhidratı yükseltin.",
          content:
            "Makro döngülemek glikojen depolarını doldurur, sindirim yükünü azaltır. Yağ oranı %20-25 civarında tutulabilir.",
          tags: ["energy", "fitness", "nutrition"],
          read_time: "2 dakika",
        },
        {
          title: "Eksantrik Sonrası Protein + Omega-3",
          short_description: "Eksantrik yüklenme sonrası iltihabı azaltmak için omega-3 yardımcı olur.",
          content:
            "Somon, uskumru veya 1-2 g EPA/DHA takviyesi, kas ağrısını hafifletebilir. Proteinle birlikte alınması onarımı destekler.",
          tags: ["muscle-gain", "nutrition", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Magnezyum ile Kas Gevşemesi",
          short_description: "Günde 300-400 mg magnezyum kas kramplarını azaltabilir.",
          content:
            "Yeşil yapraklılar, kabak çekirdeği ve kakao magnezyum kaynağıdır. Yatmadan önce almak uyku kalitesini de iyileştirir.",
          tags: ["sleep", "muscle-gain", "nutrition"],
          read_time: "2 dakika",
        },
        {
          title: "RPE ile Yük Yönetimi",
          short_description: "Algılanan efor ölçeği ile aşırı yorgunluk önlenir.",
          content:
            "RPE 7-8 aralığı hipertrofi için yeterli uyarı sağlar. Programda hafif haftalar (deload) sakatlanma riskini azaltır.",
          tags: ["fitness", "energy", "muscle-gain"],
          read_time: "2 dakika",
        },
        {
          title: "Kafein Dozlaması",
          short_description: "3-6 mg/kg kafein, yarış öncesi performansı artırabilir.",
          content:
            "Kafein merkezi sinir sistemini uyarır, algılanan eforu düşürür. 60 dk önce alınması ve kişisel toleransın gözetilmesi gerekir.",
          tags: ["energy", "fitness", "metabolism", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Beta-Alanin ile Laktat Eşiği",
          short_description: "Günde 3-6 g beta-alanin yüksek yoğunlukta dayanıklılığı artırabilir.",
          content:
            "Kas içi karnosin tamponlama kapasitesini yükseltir, yanma hissini geciktirir. 4-6 hafta yükleme sonrası etkisi görülür.",
          tags: ["energy", "fitness", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Leucine Threshold Öğünleri",
          short_description: "Her öğünde 2-3 g lösin kas sentezini tetikler.",
          content:
            "Lösin zengin whey, et veya yumurta ile öğün başına ~0.4 g/kg protein almak hipertrofi yanıtını maksimize eder.",
          tags: ["muscle-gain", "nutrition", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Sodyum Bikarbonat Yüklemesi",
          short_description: "200-300 mg/kg sodyum bikarbonat kısa süreli yüksek şiddette performansı artırabilir.",
          content:
            "Metabolik asidozu tamponlayarak sprint ve HIIT performansında iyileşme sağlayabilir. Mide hassasiyeti için bölerek alın.",
          tags: ["energy", "fitness", "metabolism", "hydration"],
          read_time: "3 dakika",
        },
        {
          title: "Antioksidan Zamanlaması",
          short_description: "Yoğun antrenman sonrası yüksek doz antioksidan adaptasyonu azaltabilir.",
          content:
            "C ve E vitaminini antrenman öncesi yüksek doz almak mitokondriyal adaptasyonları sınırlayabilir. Meyve-sebze yeterlidir, takviye zamanlamasına dikkat edin.",
          tags: ["nutrition", "metabolism", "fitness"],
          read_time: "3 dakika",
        },
        {
          title: "Off-Day Protein Stratejisi",
          short_description: "Dinlenme günlerinde de 1.6 g/kg protein kas onarımını sürdürür.",
          content:
            "Toparlanma günlerinde protein düşürmek kas proteini sentezini yavaşlatır. Yağı biraz artırıp karbonhidratı hafif çekmek denge sağlar.",
          tags: ["muscle-gain", "nutrition", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Kollajen + C Vitamini Tendon Desteği",
          short_description: "10-15 g kollajen + 50 mg C vitamini tendon yapımını destekleyebilir.",
          content:
            "Antrenmandan 30-60 dk önce kollajen ve küçük doz C vitamini almak kollajen sentezini artırabilir. Düşük yağlı bir içecekle alın.",
          tags: ["muscle-gain", "nutrition", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Soğuk Suyla Toparlanma ve Beslenme",
          short_description: "Soğuk su uygulaması sonrası karbonhidrat + protein emilimini geciktirmeyin.",
          content:
            "Soğuk su banyo/duşu inflamasyonu azaltırken glikojen sentezini geciktirebilir; 30 dk içinde 0.6-0.8 g/kg karbonhidrat alın.",
          tags: ["energy", "hydration", "muscle-gain"],
          read_time: "3 dakika",
        },
        {
          title: "Glikojen Süperkompanzasyon Mini Döngüsü",
          short_description: "2 gün düşük karbonhidrat + 1 gün yüksek karbonhidrat sprint performansını yükseltebilir.",
          content:
            "Karbonhidrat deplesyonu sonrası 8-10 g/kg karbonhidrat yüklemesi kas glikojenini bazalın üstüne taşıyabilir. Yarış haftasında kontrollü uygulayın.",
          tags: ["energy", "fitness", "nutrition"],
          read_time: "3 dakika",
        },
        {
          title: "Uyku ve Toparlanma Hijyeni",
          short_description: "7-9 saat uyku büyüme hormonu salınımını ve kas onarımını destekler.",
          content:
            "Karartılmış oda, sabit uyku saati ve yatmadan 2-3 saat önce ağır yemekten kaçınmak toparlanmayı hızlandırır. Magnezyum ve proteinli hafif snack destek olabilir.",
          tags: ["sleep", "muscle-gain", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Periodize Kreatin Kullanımı",
          short_description: "Yükleme şart değil; günde 3-5 g sürekli kullanım depoları doldurur.",
          content:
            "Kreatin depoları 3-4 hafta içinde dolduğunda güç çıkışı ve tekrar sayıları artar. Bol su ile almak yan etkileri azaltır.",
          tags: ["muscle-gain", "fitness", "hydration"],
          read_time: "2 dakika",
        },
      ],
      vegan: [
        {
          title: "Veganlarda B12 Kaynakları",
          short_description: "B12 ile zenginleştirilmiş bitki sütü ve takviye kullanımı şarttır.",
          content:
            "Vegan diyette doğal B12 kaynağı yoktur. Haftada birkaç kez zenginleştirilmiş ürün ve günlük 250-500 mcg B12 takviyesi önerilir.",
          tags: ["nutrition", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Bitkisel Demir Emilimi",
          short_description: "C vitamini ile birlikte baklagil tüketmek emilimi artırır.",
          content:
            "Fitik asit ve polifenoller demir emilimini azaltır. Nohut, mercimek yanında limonlu salata veya biber tüketmek emilimi artırır.",
          tags: ["nutrition", "energy", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Tam Protein Kombinasyonları",
          short_description: "Baklagil + tahıl kombinasyonu eksik amino asitleri tamamlar.",
          content:
            "Pirinç + fasulye veya humus + tam buğday lavaş, lizin ve metiyonini dengeler. Gün boyunca çeşitlilik tüm esansiyel amino asitleri sağlar.",
          tags: ["nutrition", "muscle-gain", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Omega-3 için Keten ve Ceviz",
          short_description: "ALA kaynakları EPA/DHA'ya düşük oranda dönüşür, düzenli tüketin.",
          content:
            "Günde 2 yemek kaşığı öğütülmüş keten veya 30 g ceviz ALA sağlar. Mikroalg yağı takviyesi EPA/DHA açığını kapatır.",
          tags: ["nutrition", "energy", "sleep"],
          read_time: "2 dakika",
        },
        {
          title: "Kalsiyumlu Bitki Sütleri",
          short_description: "Kalsiyum sitrat ile zenginleştirilmiş ürünler emilimde daha etkilidir.",
          content:
            "Günde 600-1000 mg kalsiyum hedeflenir. Etiketinde kalsiyum sitrat veya karbonat olan bitki sütleri emilim açısından uygundur.",
          tags: ["nutrition", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Protein Tozu Seçimi",
          short_description: "Bezelye + pirinç karışık protein amino asit profilini dengeler.",
          content:
            "EAA (esansiyel amino asit) profili peyniraltı suyuna yakın bir karışım sağlar. Antrenman sonrası 25-30 g kullanımı uygundur.",
          tags: ["muscle-gain", "fitness", "nutrition"],
          read_time: "3 dakika",
        },
        {
          title: "Vegan D Vitamini",
          short_description: "D2 yerine D3 (liken kaynaklı) takviyesi tercih edin.",
          content:
            "D3 formu serum 25(OH)D düzeyini daha verimli yükseltir. Kışın 1000-2000 IU, kan düzeyine göre hekim kontrolünde kullanılmalıdır.",
          tags: ["nutrition", "sleep", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Çinko ve Fitik Asit",
          short_description: "Baklagilleri ıslatmak ve filizlendirmek çinko emilimini artırır.",
          content:
            "Fitik asit mineralleri bağlar. Filizlendirme ve fermantasyon (ör. ekşi maya) fitatı azaltır, çinko emilimini yükseltir.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "İyot Kaynağı Olarak Deniz Yosunu",
          short_description: "Nori ve kombu kontrollü miktarda iyot sağlar.",
          content:
            "Günde 150 mcg iyot yetişkin ihtiyacıdır. Aşırı iyot tiroidi bozabileceğinden, etiketli ve kontrollü ürünleri tercih edin.",
          tags: ["metabolism", "nutrition", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Fermente Gıdalar ve Mikrobiyota",
          short_description: "Kimchi, tempeh ve kombucha bağırsak sağlığını destekler.",
          content:
            "Fermente gıdalar probiyotik ve postbiyotikler sağlar. Lifle birlikte tüketildiğinde kısa zincirli yağ asitlerini artırır.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Mikroalg Omega-3 Rutini",
          short_description: "EPA/DHA için mikroalg yağı veganlar için güvenli kaynaktır.",
          content:
            "Günde 300-600 mg EPA/DHA sağlayan mikroalg takviyesi, ALA dönüşüm açığını kapatır. Yağlı öğünle almak emilimi artırır.",
          tags: ["nutrition", "energy", "sleep"],
          read_time: "2 dakika",
        },
        {
          title: "Baklagil Gazını Azaltma",
          short_description: "Islatma, haşlama suyunu dökme ve kimyon ekleme sindirimi rahatlatır.",
          content:
            "Baklagilleri 8-12 saat suda bekletmek ve haşlama suyunu değiştirmek oligosakkaritleri azaltır; kimyon ve rezene şişkinliği hafifletir.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Vegan Kalsiyumlu Kahvaltı",
          short_description: "Kalsiyumlu bitki sütü + chia + yeşilliklerle 300-400 mg hedeflenebilir.",
          content:
            "Zenginleştirilmiş bitki sütü, chia ve tahin kombinasyonu kalsiyum ve yağ asidi sağlar. D vitamini ile birlikte almak emilimi destekler.",
          tags: ["nutrition", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "No-Oil Pişirme İpuçları",
          short_description: "Sote için su/et suyu, fırın için silikon mat kullanın.",
          content:
            "Yağ eklemeden pişirmek kaloriyi düşürür. Soslara sonradan 1 tatlı kaşığı zeytinyağı eklemek aroma sağlar, toplam yağı kontrol eder.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Ev Yapımı Vegan Yoğurt",
          short_description: "Hindistan cevizi veya soya sütü + probiyotik ile 8-12 saatte mayalanır.",
          content:
            "Isıtılmış bitki sütüne probiyotik kültür ekleyip 40°C civarında bekletmek kıvamı sağlar. Kalsiyum ve protein için soya bazını tercih edin.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Tam Tahıllı Fermente Ekmek",
          short_description: "Ekşi mayalı tam buğday ekmek fitatı azaltır, mineral emilimini artırır.",
          content:
            "24 saatlik mayalama süresi fitik asidi parçalar. Demir ve çinko emilimi yükselirken glisemik yük düşer.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Proteinli Vegan Atıştırmalık Kutusu",
          short_description: "Humus, edamame, fındık ve tam tahıllı kraker pratik protein sağlar.",
          content:
            "Önceden bölünmüş 20-25 g protein içeren snack box, gün içinde amino asit dağılımını dengeler ve iştahı kontrol eder.",
          tags: ["muscle-gain", "nutrition", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Vegan Sporcu için Kreatin",
          short_description: "Kreatin monohidrat veganlar için de güvenlidir, güç çıktısını artırır.",
          content:
            "Kas kreatin depoları et tüketmeyenlerde daha düşüktür; günde 3-5 g kullanım sprint ve kuvvet performansını yükseltebilir.",
          tags: ["muscle-gain", "fitness", "energy", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Vegan Çinko Kaynakları",
          short_description: "Kabak çekirdeği, kaju ve yulaf çinko alımını destekler.",
          content:
            "Fitik asit nedeniyle emilim düşer; filizlendirilmiş tahıl ve baklagillerle çinko biyoyararlanımı artar. C vitamini destekleyici olabilir.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Vegan Hidratasyon ve Elektrolit",
          short_description: "Hindistan cevizi suyu ve mineral tuzları antrenman sonrası hidrasyonu destekler.",
          content:
            "Bitkisel beslenen sporcular için 300-500 ml hindistan cevizi suyu veya düşük şekerli elektrolit tozu, terle kaybedilen mineralleri yerine koyar.",
          tags: ["hydration", "energy", "fitness"],
          read_time: "2 dakika",
        },
      ],
      "seker-hastalik": [
        {
          title: "Düşük Glisemik İndeks Tercihi",
          short_description: "Mercimek, nohut, yulaf kan şekerini yavaş yükseltir.",
          content:
            "GI değeri düşük karbonhidratlar postprandiyal glukoz piklerini azaltır. Lif içeriği aynı zamanda insülin duyarlılığını destekler.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Plaka Modeli",
          short_description: "Tabağın yarısı sebze, çeyreği protein, çeyreği kompleks karbonhidrat.",
          content:
            "Bu dağılım toplam karbonhidratı kontrol altında tutar, lif ve proteinle tok tutar. Sağlıklı yağlar (zeytinyağı) eklemek glisemik yanıtı dengeler.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Ara Öğünde Fındık Seçimi",
          short_description: "Fındık ve badem HbA1c üzerinde olumlu etki gösterebilir.",
          content:
            "Tekli doymamış yağ asitleri ve magnezyum insülin duyarlılığını destekler. Porsiyon kontrolü (20-30 g) önemlidir.",
          tags: ["nutrition", "metabolism", "sleep"],
          read_time: "2 dakika",
        },
        {
          title: "Lif Hedefi 25-30 g",
          short_description: "Çözünür lif glisemik kontrolü iyileştirir, tokluk sağlar.",
          content:
            "Keten tohumu, yulaf, elma pektini kan şekeri yanıtını yavaşlatır. Günlük lif alımını kademeli artırmak sindirim konforu sağlar.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "İnsülin Direnci ve Uyku",
          short_description: "7-9 saat uyku insülin duyarlılığını artırır, açlık hormonlarını dengeler.",
          content:
            "Kronik uyku kısıtı glukoz toleransını bozar. Düzenli uyku, HbA1c iyileşmesine destek olur.",
          tags: ["sleep", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Yavaş Yemek ve 20 Dakika Kuralı",
          short_description: "Beynin tokluk sinyali için 15-20 dakikaya ihtiyacı vardır.",
          content:
            "Yavaş çiğnemek glukoz emilimini yavaşlatır, insülin piklerini düşürür. Mindful eating porsiyon kontrolünü kolaylaştırır.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Sirke ile Glisemik Yanıt Azaltma",
          short_description: "Yemek öncesi 1-2 yemek kaşığı sirke glisemik pikleri azaltabilir.",
          content:
            "Asetik asit mide boşalmasını yavaşlatır, insulin yanıtını iyileştirebilir. Diş minesi ve mide hassasiyeti için suyla seyreltin.",
          tags: ["metabolism", "nutrition", "weight-loss"],
          read_time: "2 dakika",
        },
        {
          title: "Haftada 2 Gün Direnç Antrenmanı",
          short_description: "Kas kütlesi insülinin glukozu depolayabileceği alanı artırır.",
          content:
            "Büyük kas gruplarını çalıştırmak GLUT4 transportunu artırır. 8-12 tekrar aralığı glisemik kontrol için etkilidir.",
          tags: ["fitness", "metabolism", "energy", "muscle-gain"],
          read_time: "3 dakika",
        },
        {
          title: "Meyvede Porsiyon Kontrolü",
          short_description: "Glisemik yükü düşük meyveler: yaban mersini, çilek, elma.",
          content:
            "Meyve lifi fruktoz emilimini yavaşlatır. 1 porsiyon ~15 g karbonhidrat kabul edilir; günde 2-3 porsiyon dengelidir.",
          tags: ["nutrition", "weight-loss", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Etiket Okuma: Eklenmiş Şeker",
          short_description: "Eklenmiş şeker <10 g/100 g ürün tercih edin.",
          content:
            "Sukroz, glukoz şurubu, maltodekstrin gibi isimler eklenmiş şekerdir. Lif ve protein içeriği yüksek ürünler kan şekerini daha yavaş yükseltir.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "CGM Trendlerini Yorumlamak",
          short_description: "Sürekli glukoz monitöründe zaman aralığı (TIR) %70+ hedeflenir.",
          content:
            "%70 TIR (70-180 mg/dL) glisemik kontrolün iyi olduğunu gösterir. Piklerde öğün öncesi lif/protein eklemek ve karbonhidratı azaltmak etkili olur.",
          tags: ["metabolism", "nutrition", "sleep"],
          read_time: "3 dakika",
        },
        {
          title: "İftar ve Sahur için Diyabet Planı",
          short_description: "Lifli sahur, proteinli iftar glisemik dalgalanmayı azaltır.",
          content:
            "Sahurda yulaf, yumurta ve sebze; iftarda çorba + salata + ılımlı karbonhidrat ile yavaş açılış yapmak glukoz piklerini düşürür.",
          tags: ["nutrition", "metabolism", "weight-loss"],
          read_time: "3 dakika",
        },
        {
          title: "Düşük Glisemik Tatlı Alternatifleri",
          short_description: "Chia puding, yoğurtlu meyve ve fırınlanmış elma daha dengeli seçeneklerdir.",
          content:
            "Tatlı ihtiyacında protein ve lif eklemek glisemik yanıtı yavaşlatır. Porsiyonları küçük tutmak ve akşam geç saatten kaçınmak önemlidir.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Proteinli Smoothie Dengesi",
          short_description: "20 g protein + lif + düşük şekerli meyve ile glisemik yükü düşürün.",
          content:
            "Peyniraltı suyu veya bitkisel protein, keten tohumu ve yaban mersini ile hazırlanan smoothie insülin yanıtını dengeleyebilir.",
          tags: ["nutrition", "metabolism", "weight-loss", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Stres ve Glukoz Dalgalanması",
          short_description: "Kısa nefes egzersizleri kortizolü düşürüp glukozu stabilize edebilir.",
          content:
            "4-7-8 nefes veya kutu nefes tekniği günlük 2-3 set uygulandığında sempatik aktiviteyi azaltır, glisemik pencerede iyileşme sağlayabilir.",
          tags: ["sleep", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Lif Takviyesi Seçimi",
          short_description: "Psyllium veya inülin, tokluk ve glisemik kontrolü destekler.",
          content:
            "Yemekten 10-15 dakika önce 5-10 g psyllium suyla alındığında karbonhidrat emilimini yavaşlatır. Sıvı alımını artırın.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Direnç Lastiği ile Ev Egzersizi",
          short_description: "Haftada 3 gün 20-30 dakikalık direnç egzersizi insülin duyarlılığını artırır.",
          content:
            "Büyük kas gruplarını çalıştıran lastik egzersizleri GLUT4 aktivitesini artırır. Ardından hafif karbonhidrat + protein toparlanmayı destekler.",
          tags: ["fitness", "energy", "metabolism", "muscle-gain"],
          read_time: "3 dakika",
        },
        {
          title: "Glisemik Yük Planlayıcı",
          short_description: "Aynı porsiyonda düşük GL karbonhidratları tercih edin: kinoa, kara buğday, mercimek.",
          content:
            "GL <10 olan karbonhidratlar glukoz piklerini azaltır. Tabak düzeninde protein ve yağ eklemek toplam GL'yi daha da düşürür.",
          tags: ["nutrition", "weight-loss", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "10 Dakika Akşam Yürüyüşü",
          short_description: "Yemek sonrası 10-15 dk yürüyüş postprandiyal glukozu düşürür.",
          content:
            "Hafif tempolu kısa yürüyüş kas glukoz alımını artırır ve insülin ihtiyacını azaltabilir. Her büyük öğün sonrası uygulanabilir.",
          tags: ["fitness", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Hidrasyonla Glisemik Kontrol",
          short_description: "Yemek öncesi su ve elektrolit dengesi glukoz dalgalanmasını azaltabilir.",
          content:
            "Öğünlerden 20 dk önce 300-400 ml su içmek mide boşalmasını yavaşlatır. Günlük 2-2.5 litre su ve dengeli sodyum/potasyum alımı glisemik yanıtı destekler.",
          tags: ["hydration", "metabolism", "weight-loss"],
          read_time: "2 dakika",
        },
      ],
      "mental-saglik": [
        {
          title: "Omega-3 ve Ruh Hali",
          short_description: "EPA/DHA alımı hafif depresif semptomlarda destekleyici olabilir.",
          content:
            "Günde 1-2 g EPA ağırlıklı omega-3 bazı çalışmalarda duygu durumunu iyileştirmiştir. Hekim onayıyla kullanılmalıdır.",
          tags: ["nutrition", "sleep", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Magnesium Bisglisinat ile Rahatlama",
          short_description: "Magnezyum sinir sistemini yatıştırır, uyku kalitesini artırabilir.",
          content:
            "Bisglisinat formu mideyi daha az rahatsız eder. Akşam 200-300 mg almak gevşemeyi destekler.",
          tags: ["sleep", "nutrition", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Gün Işığı ve Sirkadiyen Ritim",
          short_description: "Sabah 10-20 dk gün ışığı maruziyeti uyku-uyanıklık döngüsünü dengeler.",
          content:
            "Doğal ışık kortizolün sabah zirvesini destekler, melatoninin akşam yükselmesine yardımcı olur. Bu da duygu durumunu olumlu etkiler.",
          tags: ["sleep", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Kafein Kesme Saati",
          short_description: "Yatmadan 8 saat önce kafeini sonlandırmak uyku kalitesini korur.",
          content:
            "Kafein yarı ömrü 5-8 saattir. Geç saatlerde tüketim uykunun derin evrelerini kısaltır, ertesi gün yorgunluk ve iştah artışı yaratır.",
          tags: ["sleep", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "Protein ve Nörotransmitterler",
          short_description: "Triptofan ve tirozin, serotonin ve dopamin sentezinde rol oynar.",
          content:
            "Hindi, yumurta, süt ürünleri ve baklagiller öncül amino asitleri sağlar. Karbonhidratla birlikte alınmaları beyine geçişi kolaylaştırır.",
          tags: ["nutrition", "sleep", "energy"],
          read_time: "3 dakika",
        },
        {
          title: "Fermente Gıdalar ve Bağırsak-Beyin Ekseni",
          short_description: "Probiyotik gıdalar GABA üretimini artırabilir, stres yanıtını azaltabilir.",
          content:
            "Yoğurt, kefir, turşu, kimchi gibi gıdalar mikrobiyotayı destekler. Lifle birlikte tüketmek postbiyotik üretimini artırır.",
          tags: ["nutrition", "metabolism", "sleep"],
          read_time: "3 dakika",
        },
        {
          title: "Nefes Egzersizi ile Vagal Tonus",
          short_description: "4-7-8 nefes tekniği parasempatik sistemi aktive eder.",
          content:
            "4 sn nefes al, 7 sn tut, 8 sn ver döngüsü kalp atımını yavaşlatır, sakinleşmeye yardım eder. Günde 2-3 set uygulanabilir.",
          tags: ["sleep", "energy", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Düşük Glisemik Yük ve Ruh Hali",
          short_description: "Kan şekeri dalgalanmaları irritabiliteyi artırabilir.",
          content:
            "Düşük glisemik öğünler enerji dalgalanmasını azaltır, dikkat süresini uzatır. Protein ve lif içeriği bu etkiyi destekler.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "D Vitamini ve Serotonin",
          short_description: "Optimal D vitamini düzeyleri serotonin regülasyonuna katkı sağlar.",
          content:
            "Eksiklik yorgunluk ve düşük mood ile ilişkilidir. Güneşlenme + takviye kombinasyonu hekim kontrolünde değerlendirilmeli.",
          tags: ["nutrition", "energy", "sleep"],
          read_time: "2 dakika",
        },
        {
          title: "Akşam Hafif Karbonhidrat",
          short_description: "Akşam düşük glisemik karbonhidrat serotonini destekleyerek uykuya geçişi kolaylaştırır.",
          content:
            "Yulaf veya patatesin küçük porsiyonu triptofanın beyne geçişini artırır, melatonin sentezini destekler.",
          tags: ["sleep", "nutrition", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Mavi Işık Filtresi Kullanımı",
          short_description: "Akşam ekran filtresi melatonin baskısını azaltır, uykuya geçişi kolaylaştırır.",
          content:
            "Yatmadan 2 saat önce mavi ışık filtresi veya gözlük kullanmak uyku kalitesini artırır, ertesi gün ruh halini iyileştirir.",
          tags: ["sleep", "energy", "metabolism"],
          read_time: "2 dakika",
        },
        {
          title: "L-Theanine ve Kahve",
          short_description: "Kafeinle birlikte 100-200 mg L-theanine odaklanmayı artırıp huzursuzluğu azaltabilir.",
          content:
            "Theanine alfa dalga aktivitesini yükseltir, kafeinin uyarıcılığını dengeler. Öğleden sonra kafein alımını sınırlamak uyku kalitesini korur.",
          tags: ["energy", "sleep", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Kan Şekeri Dalgalanması ve Anksiyete",
          short_description: "Dengesiz glukoz seyri irritabilite ve kaygıyı artırabilir.",
          content:
            "Düşük glisemik yük ve proteinli ara öğünler kan şekerini stabilize eder, sinir sistemi dalgalanmalarını azaltır.",
          tags: ["nutrition", "metabolism", "energy"],
          read_time: "2 dakika",
        },
        {
          title: "Günlük 10 Dakika Günlük Yazmak",
          short_description: "Düşünceleri yazmak parasempatik sistemi aktive eder, uykuya geçişi kolaylaştırır.",
          content:
            "Yatmadan önce şükür listesi veya beyin boşaltma yazıları yapmak gece uyanmalarını azaltabilir, stres hormonlarını dengeler.",
          tags: ["sleep", "energy", "nutrition"],
          read_time: "2 dakika",
        },
        {
          title: "Adaptogen Seçimi: Ashwagandha",
          short_description: "KSM-66 formu 300-600 mg bazı bireylerde kortizolü düşürebilir.",
          content:
            "Adaptogenler stres yanıtını modüle eder; düzenli kullanımda uyku ve ruh hali üzerinde olumlu etkiler bildirilmiştir. Hekim onayıyla kullanın.",
          tags: ["sleep", "energy", "metabolism"],
          read_time: "3 dakika",
        },
        {
          title: "Bitki Çayları ile Uyku Rutini",
          short_description: "Papatya, melisa veya rooibos kafeinsiz rahatlama sağlar.",
          content:
            "Kafeinsiz bitki çayı ritüeli sinyalleme etkisi oluşturur, sinir sistemini yatıştırır. Şeker eklemeden tüketmek kan şekerini de korur.",
          tags: ["sleep", "nutrition", "energy", "hydration"],
          read_time: "2 dakika",
        },
        {
          title: "Probiyotik Takviyesi Seçimi",
          short_description: "Lactobacillus ve Bifidobacterium türleri bağırsak-beyin eksenini destekler.",
          content:
            "CFU değeri ve tür çeşitliliği yüksek ürünler kısa zincirli yağ asitlerini artırabilir; lifli beslenme ile sinerji yaratır.",
          tags: ["nutrition", "metabolism", "sleep"],
          read_time: "3 dakika",
        },
        {
          title: "B12 ve B6 ile Mood Desteği",
          short_description: "B vitaminleri nörotransmitter sentezinde rol oynar, eksikliği yorgunluk yapar.",
          content:
            "B12 eksikliği veganlarda sık görülür; düzenli takviye veya zenginleştirilmiş gıda kullanımı enerji ve moodu destekler. B6 da ko-faktör olarak önemlidir.",
          tags: ["nutrition", "energy", "sleep"],
          read_time: "2 dakika",
        },
        {
          title: "Akşam Ekran Süresini Azaltmak",
          short_description: "Uyku öncesi ekranı 60 dk sınırlamak uykunun derin evresini uzatır.",
          content:
            "Ekran maruziyeti uyarıcıdır ve melatonini baskılar. Yerine kitap okuma veya hafif esneme koymak uyku ve ertesi gün ruh halini iyileştirir.",
          tags: ["sleep", "energy", "fitness"],
          read_time: "2 dakika",
        },
        {
          title: "Su ve Kafein Dengesi ile Odak",
          short_description: "Kafein öncesi 300 ml su baş ağrısı ve huzursuzluğu azaltabilir.",
          content:
            "Hafif dehidrasyon odak ve moodu bozar. Kafein almadan önce su içmek ve 1:1 su/kahve hacim oranı, sinir sistemi yanıtını dengeler.",
          tags: ["hydration", "sleep", "energy"],
          read_time: "2 dakika",
        },
      ],
    };

    const flattenedTips = Object.entries(tipsByCategory).flatMap(([categorySlug, items]) =>
      items.map((item, index) => ({
        ...item,
        categorySlug,
        order: index,
      }))
    );

    let added = 0;
    for (const tip of flattenedTips) {
      try {
        // Başlığa göre idempotent: aynı başlık varsa atla
        const existing = await db
          .collection("nutrition_tips")
          .where("title", "==", tip.title)
          .limit(1)
          .get();

        if (!existing.empty) {
          console.log(`↺ İpucu zaten var, atlandı: ${tip.title}`);
          continue;
        }

        const docRef = await db.collection("nutrition_tips").add({
          title: tip.title,
          short_description: tip.short_description,
          content: tip.content,
          category: categoryRefs[tip.categorySlug],
          tags: (tip.tags || []).map((t) => tagRefs[t]).filter(Boolean),
          read_time: tip.read_time || "2 dakika",
          image: "",
          status: "active",
          is_featured: Boolean(tip.is_featured),
          view_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: "admin-seed",
        });
        added++;
        console.log(`✅ İpucu eklendi: "${tip.title}" (ID: ${docRef.id})`);
      } catch (e) {
        console.error(`❌ İpucu eklemesinde hata: "${tip.title}"`, e.message);
      }
    }

    console.log(`\n✨ İşlem tamamlandı. Eklenen yeni ipucu sayısı: ${added}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

addSampleData();

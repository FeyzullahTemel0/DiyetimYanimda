// backend/scripts/seedRealRecipes.js
// GERÇEK YEMEK TARİFLERİ - Detaylı, Adım Adım, Besin Değerleri ile
// Kategoriler: Tavuk, Balık, Vegan, Yumurta, İçecekler

const { admin, firestore } = require("../src/services/firebaseAdmin");
const db = firestore;

const realRecipes = [
  // ==================== TAVUK YEMEKLERİ ====================
  {
    name: "Izgara Tavuk Göğsü & Kinoa Salatası",
    category: "Tavuk Yemekleri",
    tags: ["Kilo Verme", "Kas Gelişimi", "Sağlıklı Yaşam", "Beslenme"],
    difficulty: "Kolay",
    prepTime: 30,
    cookTime: 20,
    servings: 2,
    calories: 480,
    protein: 45,
    carbs: 35,
    fat: 12,
    fiber: 6,
    description: "Protein açısından zengin, düşük kalorili ve dengeli bir öğün. Kinoa tam protein içerir ve tavuk göğsü yağsız protein kaynağıdır.",
    ingredients: [
      { name: "Tavuk göğsü (kemikli)", amount: "400g", notes: "Ciltsiz tercih edin" },
      { name: "Kinoa", amount: "100g (kuru)", notes: "Yıkanmış" },
      { name: "Çeri domates", amount: "200g", notes: "İkiye bölünmüş" },
      { name: "Salatalık", amount: "1 orta boy (150g)", notes: "Küp doğranmış" },
      { name: "Kırmızı soğan", amount: "1/2 adet (50g)", notes: "İnce doğranmış" },
      { name: "Maydanoz", amount: "1 demet", notes: "Kıyılmış" },
      { name: "Limon", amount: "1 adet", notes: "Suyu sıkılacak" },
      { name: "Zeytinyağı", amount: "2 yemek kaşığı", notes: "Soğuk sıkım" },
      { name: "Tuz, karabiber", amount: "Tatmaya göre", notes: "" },
      { name: "Kırmızı pul biber", amount: "1 çay kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Tavuk Marinasyonu",
        description: "Tavuk göğüslerini yıkayın ve kurulayın. Bir kapta 1 yemek kaşığı zeytinyağı, limonun yarısının suyu, tuz, karabiber ile karıştırın. Tavukları bu karışıma bulayıp 15 dakika bekletin."
      },
      {
        step: 2,
        title: "Kinoa Pişirme",
        description: "Kinoayı süzgeçte iyice yıkayın. Bir tencerede 2 su bardağı su kaynatın, kinoayı ekleyin. Kısık ateşte kapağı kapalı 15 dakika pişirin. Ateşi kapatıp 5 dakika dinlendirin, çatalla kabartın."
      },
      {
        step: 3,
        title: "Tavukları Pişirme",
        description: "Izgara tavasını veya barbekü ızgarasını kızdırın. Tavukları her iki tarafını 6-7 dakika pişirin. İç sıcaklık 74°C olmalı. Pişirdikten sonra 5 dakika dinlendirin ve dilimlerin."
      },
      {
        step: 4,
        title: "Salata Hazırlama",
        description: "Büyük bir kasede pişmiş kinoayı, çeri domates, salatalık, kırmızı soğan ve maydanozu karıştırın. Kalan zeytinyağı, limon suyu, tuz ve karabiber ile tatlandırın."
      },
      {
        step: 5,
        title: "Servis",
        description: "Kinoa salatası tabağın yarısını kaplasın. Dilimlenmiş tavuk göğsünü üzerine yerleştirin. Taze limon suyu sıkın ve servis yapın."
      }
    ],
    tips: [
      "Tavuğu fazla pişirmemeye dikkat edin, kurumasını önlemek için et termometresi kullanın.",
      "Kinoa yerine bulgur veya esmer pirinç de kullanabilirsiniz.",
      "Vejetaryen versiyon için tavuk yerine nohut veya tofu kullanın.",
      "Hazırladığınız salatayı 2 gün buzdolabında saklayabilirsiniz."
    ],
    allergens: ["Gluten (kinoa gluten-free ama kontamine olabilir)"],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Fırında Limonlu Kekikli Tavuk",
    category: "Tavuk Yemekleri",
    tags: ["Diyabet Hastası", "Kilo Verme", "Sağlıklı Yaşam", "Stabil Kalma"],
    difficulty: "Kolay",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    calories: 320,
    protein: 42,
    carbs: 8,
    fat: 14,
    fiber: 2,
    description: "Akdeniz mutfağının klasik tarifi. Düşük karbonhidrat, yüksek protein içerir ve diyabet hastaları için uygundur.",
    ingredients: [
      { name: "Tavuk butu veya kanat", amount: "1kg", notes: "Cildi çıkarılmış" },
      { name: "Limon", amount: "2 büyük adet", notes: "Birisi dilimlere bölünecek" },
      { name: "Sarımsak", amount: "6 diş", notes: "Ezilmiş" },
      { name: "Taze kekik", amount: "1 demet", notes: "Kuru kekik de olabilir (2 yemek kaşığı)" },
      { name: "Zeytinyağı", amount: "3 yemek kaşığı", notes: "Soğuk sıkım" },
      { name: "Tuz", amount: "1 tatlı kaşığı", notes: "" },
      { name: "Karabiber", amount: "1 çay kaşığı", notes: "Taze çekilmiş" },
      { name: "Pul biber", amount: "1 çay kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Marinasyon Hazırlama",
        description: "Büyük bir kasede zeytinyağı, 1 limonun suyu, ezilmiş sarımsaklar, kekik yaprakları, tuz ve karabiberi karıştırın. İyi bir marinat oluşana kadar çırpın."
      },
      {
        step: 2,
        title: "Tavukları Marine Etme",
        description: "Tavuk parçalarını yıkayıp kurulayın. Ciltlerini çıkarın (daha sağlıklı olması için). Marinata bulayın ve kapalı kapta buzdolabında en az 2 saat (ideal 6-8 saat) bekletin."
      },
      {
        step: 3,
        title: "Fırını Hazırlama",
        description: "Fırını 200°C'ye ısıtın. Fırın tepsisine pişirme kağıdı serin. Tavuk parçalarını dizin, aralarına limon dilimlerini yerleştirin."
      },
      {
        step: 4,
        title: "Pişirme",
        description: "40-45 dakika pişirin. Her 15 dakikada bir marinasyondan kalan sosu tavukların üzerine gezdirin. Tavuklar altın sarısı olmalı ve iç sıcaklık 74°C olmalı."
      },
      {
        step: 5,
        title: "Dinlendirme ve Servis",
        description: "Fırından çıkardıktan sonra 5 dakika dinlendirin. Yanında közlenmiş sebzeler, yeşil salata veya bulgur pilavı ile servis yapın."
      }
    ],
    tips: [
      "Marinasyon süresi ne kadar uzun olursa tat o kadar yoğun olur.",
      "Tavuk cildini çıkarmak kalori ve yağı %50 azaltır.",
      "Fırında pişirirken folyo ile kapatırsanız et daha yumuşak olur.",
      "Artanı buzdolabında 3 gün saklayabilirsiniz - salatalarda kullanın."
    ],
    allergens: [],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Tavuk Fajita Bowl",
    category: "Tavuk Yemekleri",
    tags: ["Kilo Alma", "Kas Gelişimi", "Stabil Kalma", "Beslenme"],
    difficulty: "Orta",
    prepTime: 20,
    cookTime: 25,
    servings: 3,
    calories: 520,
    protein: 38,
    carbs: 48,
    fat: 16,
    fiber: 8,
    description: "Meksika mutfağından renkli ve lezzetli bir bowl tarifi. Kompleks karbonhidrat ve yüksek protein içerir, kas gelişimi için idealdir.",
    ingredients: [
      { name: "Tavuk göğsü", amount: "450g", notes: "İnce şeritler halinde" },
      { name: "Esmer pirinç", amount: "150g (kuru)", notes: "Haşlanmış" },
      { name: "Kırmızı biber", amount: "1 adet (150g)", notes: "Şeritler halinde" },
      { name: "Yeşil biber", amount: "1 adet (150g)", notes: "Şeritler halinde" },
      { name: "Sarı biber", amount: "1 adet (150g)", notes: "Şeritler halinde" },
      { name: "Kırmızı soğan", amount: "1 büyük (200g)", notes: "Şeritler halinde" },
      { name: "Avokado", amount: "1 adet", notes: "Dilimlenmiş" },
      { name: "Domates", amount: "2 adet", notes: "Küp doğranmış" },
      { name: "Limon", amount: "2 adet", notes: "Suyu kullanılacak" },
      { name: "Zeytinyağı", amount: "2 yemek kaşığı", notes: "" },
      { name: "Fajita baharatı", amount: "3 yemek kaşığı", notes: "Aşağıdaki tarife göre" },
      { name: "Mısır (konserve)", amount: "100g", notes: "Süzülmüş" },
      { name: "Siyah fasulye (konserve)", amount: "150g", notes: "Yıkanmış" }
    ],
    instructions: [
      {
        step: 1,
        title: "Fajita Baharatı Hazırlama",
        description: "Küçük bir kapta 2 yemek kaşığı kimyon, 1 yemek kaşığı toz biber, 1 yemek kaşığı sarımsak tozu, 1 yemek kaşığı soğan tozu, 1 çay kaşığı acı biber, 1 çay kaşığı tuz, 1/2 çay kaşığı karabiber karıştırın."
      },
      {
        step: 2,
        title: "Pirinç Pişirme",
        description: "Esmer pirinci 2 katı su ile kaynatın. Kaynayınca kısık ateşte 40 dakika pişirin. Dinlendirip çatalla kabartın."
      },
      {
        step: 3,
        title: "Tavuk Marinasyonu",
        description: "Tavuk şeritlerini fajita baharatının yarısı, 1 yemek kaşığı zeytinyağı ve 1 limonun suyu ile karıştırın. 15 dakika bekletin."
      },
      {
        step: 4,
        title: "Sebzeleri Pişirme",
        description: "Geniş bir tavada 1 yemek kaşığı zeytinyağı kızdırın. Biberleri ve soğanları ekleyin. Yüksek ateşte 5-6 dakika soteleyin. Kalan fajita baharatını ekleyin. Bir tabağa alın."
      },
      {
        step: 5,
        title: "Tavuğu Pişirme",
        description: "Aynı tavada tavuk şeritlerini yüksek ateşte 6-7 dakika pişirin. Tamamen pişene kadar karıştırın."
      },
      {
        step: 6,
        title: "Bowl Montajı",
        description: "Kaselere önce esmer pirinç koyun. Üzerine tavuk, sebzeler, siyah fasulye, mısır, avokado dilimleri ve domates küpleri yerleştirin. Limon suyu sıkın ve servis yapın."
      }
    ],
    tips: [
      "Yoğurt veya ekşi krema eklemek protein miktarını artırır.",
      "Acılı sevmeyenler için pul biberi azaltabilir veya çıkarabilirsiniz.",
      "Meal prep için 4 gün buzdolabında saklayabilirsiniz (avokadoyu servisten önce ekleyin).",
      "Vegan versiyon için tavuk yerine tempeh veya tofu kullanın."
    ],
    allergens: [],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },

  // ==================== BALIK YEMEKLERİ ====================
  {
    name: "Fırında Somon & Buharda Sebzeler",
    category: "Balık Yemekleri",
    tags: ["Diyabet Hastası", "Kilo Verme", "Sağlıklı Yaşam", "Beslenme"],
    difficulty: "Kolay",
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    calories: 485,
    protein: 42,
    carbs: 18,
    fat: 28,
    fiber: 6,
    description: "Omega-3 yağ asitleri açısından çok zengin, kalp ve beyin sağlığı için mükemmel. Diyabet hastaları için ideal düşük glisemik indeksli öğün.",
    ingredients: [
      { name: "Somon filesi", amount: "400g (2 adet)", notes: "Kemik ve deri çıkarılmış" },
      { name: "Brokoli", amount: "300g", notes: "Çiçeklerine ayrılmış" },
      { name: "Havuç", amount: "2 orta boy (200g)", notes: "Diyagonal dilimlere kesilmiş" },
      { name: "Kuşkonmaz", amount: "200g", notes: "Uçları kesilmiş" },
      { name: "Limon", amount: "2 adet", notes: "1'i dilimlere bölünecek" },
      { name: "Zeytinyağı", amount: "3 yemek kaşığı", notes: "Soğuk sıkım" },
      { name: "Sarımsak", amount: "3 diş", notes: "İnce kıyılmış" },
      { name: "Taze dereotu", amount: "1/2 demet", notes: "Kıyılmış" },
      { name: "Tuz", amount: "1 çay kaşığı", notes: "" },
      { name: "Karabiber", amount: "1/2 çay kaşığı", notes: "Taze çekilmiş" },
      { name: "Bal", amount: "1 çay kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Fırını Hazırlama",
        description: "Fırını 200°C'ye ısıtın. 2 büyük boy alüminyum folyo veya pişirme kağıdı hazırlayın (her porsiyon için birer tane)."
      },
      {
        step: 2,
        title: "Somon Marinasyonu",
        description: "Küçük bir kasede 2 yemek kaşığı zeytinyağı, 1 limonun suyu, sarımsak, dereotu, tuz, karabiber ve bal (kullanıyorsanız) karıştırın. Somon filetolarını bu karışıma bulayın."
      },
      {
        step: 3,
        title: "Sebze Hazırlığı",
        description: "Sebzeleri (brokoli, havuç, kuşkonmaz) büyük bir kasede 1 yemek kaşığı zeytinyağı, tuz ve karabiber ile karıştırın."
      },
      {
        step: 4,
        title: "Paketleme",
        description: "Her folyo parçasının ortasına sebzeleri yerleştirin. Üzerine marine edilmiş somon filetosunu koyun. Limon dilimlerini balığın üzerine dizin. Folyoları sıkıca kapatın (buhar kaçırmamalı)."
      },
      {
        step: 5,
        title: "Pişirme",
        description: "Fırın tepsisine paketleri yerleştirin. 22-25 dakika pişirin. Somon iç sıcaklığı 63°C olmalı. Fazla pişirmeyin yoksa balık kuru olur."
      },
      {
        step: 6,
        title: "Servis",
        description: "Paketleri açın (buhara dikkat edin, çok sıcak olabilir). Tabağa aktarın, taze limon suyu sıkın ve hemen servis yapın."
      }
    ],
    tips: [
      "Somon taze olmalı - gözleri parlak, eti pembemsi-turuncu renkte olmalı.",
      "Pişirme süresi filetonun kalınlığına göre değişir. Kalın filetolar 28-30 dakika alabilir.",
      "Omega-3 miktarını artırmak için ceviz veya keten tohumu ekleyebilirsiniz.",
      "Diyabet hastaları için ideal çünkü glisemik indeksi çok düşük."
    ],
    allergens: ["Balık", "Bal (vegan değil)"],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Akdeniz Usulü Levrek",
    category: "Balık Yemekleri",
    tags: ["Sağlıklı Yaşam", "Stabil Kalma", "Beslenme"],
    difficulty: "Orta",
    prepTime: 20,
    cookTime: 30,
    servings: 2,
    calories: 380,
    protein: 44,
    carbs: 12,
    fat: 18,
    fiber: 4,
    description: "Akdeniz diyetinin temel taşlarından biri. Hafif, protein açısından zengin ve zeytinyağı ile kalp dostu.",
    ingredients: [
      { name: "Levrek (taze)", amount: "2 orta boy (600g)", notes: "Temizlenmiş" },
      { name: "Domates", amount: "3 orta boy (300g)", notes: "Dilimlenmiş" },
      { name: "Soğan", amount: "1 büyük (150g)", notes: "Halka halka kesilmiş" },
      { name: "Yeşil biber", amount: "2 adet", notes: "Halka halka" },
      { name: "Limon", amount: "2 adet", notes: "Birisi dilimlere bölünecek" },
      { name: "Zeytinyağı", amount: "4 yemek kaşığı", notes: "Kaliteli soğuk sıkım" },
      { name: "Sarımsak", amount: "4 diş", notes: "İnce kıyılmış" },
      { name: "Taze maydanoz", amount: "1 demet", notes: "Kıyılmış" },
      { name: "Kekik", amount: "1 çay kaşığı", notes: "Kuru veya taze" },
      { name: "Defne yaprağı", amount: "2 adet", notes: "" },
      { name: "Tuz, karabiber", amount: "Tatmaya göre", notes: "" }
    ],
    instructions: [
      {
        step: 1,
        title: "Balık Hazırlığı",
        description: "Levreği iyice yıkayın. Her iki tarafına çapraz kesikler atın (yaklaşık 3-4 adet). Bu kesikler baharatın içeri girmesini ve pişmeyi hızlandırır. Tuz, karabiber, kekik ve 1 limonun suyu ile her tarafını ovun. 15 dakika bekletin."
      },
      {
        step: 2,
        title: "Fırını ve Tepsinin Hazırlanması",
        description: "Fırını 190°C'ye ısıtın. Fırın tepsisine pişirme kağıdı serin. 2 yemek kaşığı zeytinyağı sürün."
      },
      {
        step: 3,
        title: "Sebze Yatağı Oluşturma",
        description: "Tepsinin tabanına soğan halkalarını dizin. Üzerine domates dilimleri ve biber halkaları ekleyin. Sarımsağı serpeleyin. Defne yapraklarını yerleştirin. 2 yemek kaşığı zeytinyağı gezdirin. Tuz, karabiber serpin."
      },
      {
        step: 4,
        title: "Balığı Yerleştirme",
        description: "Marine edilmiş levrekleri sebzelerin üzerine yerleştirin. Kesiklerinin arasına limon dilimlerini sokun. Maydanozun yarısını serpeleyin. Kalan zeytinyağını balıkların üzerine gezdirin."
      },
      {
        step: 5,
        title: "Pişirme",
        description: "Fırında 25-30 dakika pişirin. Balık eti çatal ile kolayca ayrılmalı ve içi mat beyaz olmalı. Arada bir sebze sularını balığın üzerine gezdirin."
      },
      {
        step: 6,
        title: "Servis",
        description: "Fırından çıkarın. Kalan taze maydanozu üzerine serpin. Limon dilimi ile süsleyin. Yanında pilav veya patates püresi ile servis yapın."
      }
    ],
    tips: [
      "Balık çok taze olmalı - gözleri parlak, solungaçları pembe-kırmızı olmalı.",
      "Fırın sıcaklığını çok yüksek tutmayın, balık kurumasın.",
      "Sebze sularını sık sık balığın üzerine gezdirmek lezzeti artırır.",
      "Çupra, mercan veya barbun da aynı şekilde yapılabilir."
    ],
    allergens: ["Balık"],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Ton Balıklı Power Bowl",
    category: "Balık Yemekleri",
    tags: ["Kilo Verme", "Kas Gelişimi", "Sağlıklı Yaşam", "Beslenme"],
    difficulty: "Çok Kolay",
    prepTime: 20,
    cookTime: 10,
    servings: 2,
    calories: 420,
    protein: 35,
    carbs: 32,
    fat: 16,
    fiber: 8,
    description: "Hızlı hazırlanan, protein bombası bir bowl. Meal prep için mükemmel, omega-3 ve kompleks karbonhidrat içerir.",
    ingredients: [
      { name: "Ton balığı (suda konserve)", amount: "2 kutu (320g)", notes: "Süzülmüş" },
      { name: "Kinoa veya esmer pirinç", amount: "150g (pişmiş)", notes: "" },
      { name: "Haşlanmış yumurta", amount: "2 adet", notes: "Sert haşlanmış" },
      { name: "Yeşil fasulye", amount: "200g", notes: "Haşlanmış" },
      { name: "Çeri domates", amount: "150g", notes: "İkiye bölünmüş" },
      { name: "Marul", amount: "2 avuç (100g)", notes: "Doğranmış" },
      { name: "Avokado", amount: "1 adet", notes: "Dilimlenmiş" },
      { name: "Siyah zeytin", amount: "50g", notes: "Dilimlenmiş" },
      { name: "Kırmızı soğan", amount: "1/2 adet", notes: "İnce kıyılmış" },
      { name: "Kaparit", amount: "1 yemek kaşığı", notes: "İsteğe bağlı" },
      { name: "Zeytinyağı", amount: "3 yemek kaşığı", notes: "" },
      { name: "Limon suyu", amount: "2 yemek kaşığı", notes: "" },
      { name: "Dijon hardal", amount: "1 çay kaşığı", notes: "" },
      { name: "Tuz, karabiber", amount: "Tatmaya göre", notes: "" }
    ],
    instructions: [
      {
        step: 1,
        title: "Tahıl Hazırlama",
        description: "Kinoayı veya esmer pirinci paket talimatına göre pişirin. Sıcak olarak kullanacaksanız ılık, soğuk bowl yapacaksanız buzdolabında soğutun."
      },
      {
        step: 2,
        title: "Yumurta Haşlama",
        description: "Yumurtaları kaynar suya atın, 10 dakika haşlayın. Soğuk suya alıp kabuklarını soyun. Dörde bölün."
      },
      {
        step: 3,
        title: "Sebze Hazırlığı",
        description: "Yeşil fasulyeyi tuzlu kaynar suda 5 dakika haşlayın. Buz suyuna alın (rengini korumak için). Diğer sebzeleri yıkayıp doğrayın."
      },
      {
        step: 4,
        title: "Sos Hazırlama",
        description: "Küçük bir kavanozda zeytinyağı, limon suyu, dijon hardal, tuz ve karabiberi koyun. Kapağını kapatıp iyice çalkalayın."
      },
      {
        step: 5,
        title: "Bowl Montajı",
        description: "Her kaseye önce kinoa/pirinç koyun. Ton balığı, haşlanmış yumurta, yeşil fasulye, domates, marul, avokado, zeytin ve soğanı bölümler halinde yerleştirin. Kaparisi ekleyin."
      },
      {
        step: 6,
        title: "Servis",
        description: "Sosun yarısını bowl'ların üzerine gezdirin. Kalanını ayrı bir kapta servis edin. Taze limon dilimi ile süsleyin ve hemen servis yapın."
      }
    ],
    tips: [
      "Suda konserve ton balığı, yağda konserveden daha az kalorilidir.",
      "Meal prep için 3 güne kadar buzdolabında saklayabilirsiniz (sos ve avokadoyu servisten önce ekleyin).",
      "Taze ton balığı kullanırsanız protein kalitesi daha yüksek olur.",
      "Vegan versiyon için ton yerine nohut veya tempeh kullanın."
    ],
    allergens: ["Balık", "Yumurta", "Hardal"],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },

  // ==================== VEGAN YEMEKLERİ ====================
  {
    name: "Nohut Köfte (Falafel) & Tahini Sos",
    category: "Vegan Yemekleri",
    tags: ["Vejetaryen", "Sağlıklı Yaşam", "Beslenme", "Kilo Verme"],
    difficulty: "Orta",
    prepTime: 30,
    cookTime: 25,
    servings: 4,
    calories: 380,
    protein: 18,
    carbs: 42,
    fat: 16,
    fiber: 12,
    description: "Ortadoğu mutfağının klasiği. Tam protein içeren, lif açısından zengin vegan tarif. B12 hariç tüm besin öğelerini içerir.",
    ingredients: [
      { name: "Kuru nohut", amount: "500g", notes: "Bir gece suda bekletilmiş (haşlanmamış!)" },
      { name: "Kırmızı soğan", amount: "1 büyük (150g)", notes: "Doğranmış" },
      { name: "Sarımsak", amount: "6 diş", notes: "" },
      { name: "Taze maydanoz", amount: "2 demet", notes: "Sapları kesilmiş" },
      { name: "Taze kişniş", amount: "1 demet", notes: "Sapları kesilmiş" },
      { name: "Kimyon", amount: "2 çay kaşığı", notes: "" },
      { name: "Kişniş tozu", amount: "1 çay kaşığı", notes: "" },
      { name: "Kabartma tozu", amount: "1 çay kaşığı", notes: "" },
      { name: "Kırmızı pul biber", amount: "1/2 çay kaşığı", notes: "" },
      { name: "Susam", amount: "3 yemek kaşığı", notes: "" },
      { name: "Tuz", amount: "1 tatlı kaşığı", notes: "" },
      { name: "Un (nohut veya normal)", amount: "2 yemek kaşığı", notes: "Gerekirse" },
      { name: "Tahini", amount: "150g", notes: "Sos için" },
      { name: "Limon suyu", amount: "3 yemek kaşığı", notes: "Sos için" },
      { name: "Zeytinyağı", amount: "Fırınlamak için", notes: "Sprey olarak" }
    ],
    instructions: [
      {
        step: 1,
        title: "Nohut Hazırlığı",
        description: "Kuru nohutları en az 12 saat (ideal 24 saat) suda bekletin. ÖNEMLİ: Nohutları haşlamayın! Suyunu süzün ve havlu ile kurulayın."
      },
      {
        step: 2,
        title: "Hamur Hazırlama",
        description: "Blender veya mutfak robotuna nohut, soğan, sarımsak, maydanoz, kişniş, kimyon, kişniş tozu, pul biber ve tuzu koyun. Kaba kıyılmış kıvama gelene kadar çekin (püre değil!). Hamur yapışkan olmalı ama şekil alabilmeli. Gerekirse 1-2 yemek kaşığı un ekleyin."
      },
      {
        step: 3,
        title: "Dinlendirme",
        description: "Hamuru kapalı bir kapta buzdolabında en az 1 saat (ideal 4 saat) dinlendirin. Bu adım çok önemli - köfteler dağılmamalı."
      },
      {
        step: 4,
        title: "Şekillendirme",
        description: "Fırını 200°C'ye ısıtın. Hamurdan ceviz büyüklüğünde parçalar koparın ve top şekli verin. Hafifçe bastırıp yassılaştırın. Susama bulayın. Yağlanmış fırın tepsisine dizin."
      },
      {
        step: 5,
        title: "Pişirme",
        description: "Köftelerin üzerine zeytinyağı spreyi sıkın. 180°C'de 20-25 dakika pişirin. 12. dakikada çevirin. Altın sarısı ve çıtır olmalılar."
      },
      {
        step: 6,
        title: "Tahini Sos Hazırlama",
        description: "Bir kasede tahini, limon suyu, 1 diş sarımsak (ezilmiş), tuz ve 4-5 yemek kaşığı su karıştırın. Kıvam çok kalın ise su ekleyin."
      },
      {
        step: 7,
        title: "Servis",
        description: "Falafel'leri lavash veya pide ekmeğinde servis yapın. Tahini sosu, salata, domates ve turşu ile birlikte sunun."
      }
    ],
    tips: [
      "Nohutları kesinlikle haşlamayın - haşlanmış nohuttan falafel yapılmaz!",
      "Derin yağda kızartmak yerine fırında yapmak daha sağlıklıdır.",
      "Hazırladığınız hamuru dondurabilirsiniz - 3 ay saklanır.",
      "Gluten-free yapmak için nohut unu kullanın."
    ],
    allergens: ["Susam (tahini)", "Gluten (una göre)"],
    vegan: true,
    vegetarian: true,
    glutenFree: false,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Mercimek Köftesi & Nar Ekşili Salata",
    category: "Vegan Yemekleri",
    tags: ["Vejetaryen", "Kilo Verme", "Sağlıklı Yaşam", "Diyabet Hastası"],
    difficulty: "Kolay",
    prepTime: 25,
    cookTime: 20,
    servings: 4,
    calories: 320,
    protein: 14,
    carbs: 48,
    fat: 8,
    fiber: 10,
    description: "Türk mutfağının vegan klasiği. Yüksek protein ve lif içerir, diyabet hastaları için uygundur.",
    ingredients: [
      { name: "Kırmızı mercimek", amount: "300g", notes: "Yıkanmış" },
      { name: "İnce bulgur", amount: "200g", notes: "" },
      { name: "Soğan", amount: "2 orta boy (300g)", notes: "İnce kıyılmış" },
      { name: "Domates salçası", amount: "2 yemek kaşığı", notes: "" },
      { name: "Biber salçası", amount: "1 yemek kaşığı", notes: "" },
      { name: "Zeytinyağı", amount: "4 yemek kaşığı", notes: "" },
      { name: "Pul biber", amount: "2 çay kaşığı", notes: "" },
      { name: "Kimyon", amount: "1 çay kaşığı", notes: "" },
      { name: "Tuz", amount: "1 tatlı kaşığı", notes: "" },
      { name: "Taze nane", amount: "1 demet", notes: "Kıyılmış" },
      { name: "Maydanoz", amount: "1 demet", notes: "Kıyılmış" },
      { name: "Yeşil soğan", amount: "4 dal", notes: "İnce kıyılmış" },
      { name: "Marul yaprakları", amount: "1 baş", notes: "Servis için" },
      { name: "Limon", amount: "2 adet", notes: "" },
      { name: "Nar ekşisi", amount: "2 yemek kaşığı", notes: "Salata için" }
    ],
    instructions: [
      {
        step: 1,
        title: "Mercimek Pişirme",
        description: "Mercimeği 3 su bardağı su ile kaynatın. Kaynayınca kısık ateşte 15 dakika pişirin. Mercimekler yumuşamalı ama dağılmamalı. Suyunu süzün."
      },
      {
        step: 2,
        title: "Soğan Kavurma",
        description: "Geniş bir tavada 3 yemek kaşığı zeytinyağı kızdırın. Soğanları ekleyin, pembeleşene kadar kavurun (10-12 dakika). Salçaları ekleyin, 2 dakika kavurun."
      },
      {
        step: 3,
        title: "Karıştırma",
        description: "Büyük bir kaseye pişmiş mercimeği aktarın. Bulguru, kavulmuş soğan karışımını, pul biber, kimyon ve tuzu ekleyin. İyice karıştırın. 10 dakika dinlendirin (bulgur suyu emer)."
      },
      {
        step: 4,
        title: "Yoğurma",
        description: "Nane, maydanoz, yeşil soğan ve 1 limonun suyunu ekleyin. Ellerinizle iyice yoğurun. Kıvam yapışkan olmalı. Gerekirse az su veya bulgur ekleyin."
      },
      {
        step: 5,
        title: "Şekillendirme",
        description: "Avuç içinize ceviz büyüklüğünde hamur alın. Şekillendirip uçları sivri köfte yapın. Bir tabağa dizin."
      },
      {
        step: 6,
        title: "Salata",
        description: "Marul yapraklarını yıkayın. Küçük bir kasede 1 yemek kaşığı zeytinyağı, 1 limonun suyu, nar ekşisi, tuz karıştırın."
      },
      {
        step: 7,
        title: "Servis",
        description: "Marul yapraklarını tabağa dizin. Köfteleri yerleştirin. Salata sosunu gezdirin. Limon dilimleri ile süsleyin."
      }
    ],
    tips: [
      "Mercimeği fazla pişirmeyin, dağılırsa köfte şeklini alamaz.",
      "Bulgur yerine kinoa kullanarak gluten-free yapabilirsiniz.",
      "Buzdolabında 3 gün saklanır.",
      "Yemeden 2-3 saat önce hazırlarsanız tatlar oturur."
    ],
    allergens: ["Gluten (bulgur)"],
    vegan: true,
    vegetarian: true,
    glutenFree: false,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Tofu Scramble (Vegan Menemen)",
    category: "Vegan Yemekleri",
    tags: ["Vejetaryen", "Kas Gelişimi", "Beslenme", "Kilo Alma"],
    difficulty: "Kolay",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    calories: 280,
    protein: 20,
    carbs: 18,
    fat: 14,
    fiber: 6,
    description: "Yüksek protein içeren vegan kahvaltı tarifi. Yumurta menemenin vegan versiyonu, B12 takviyesiyle tam besin değeri.",
    ingredients: [
      { name: "Sert tofu", amount: "400g", notes: "Suyu süzülmüş" },
      { name: "Domates", amount: "3 orta boy (300g)", notes: "Küp doğranmış" },
      { name: "Yeşil biber", amount: "2 adet", notes: "Doğranmış" },
      { name: "Kırmızı soğan", amount: "1 orta boy", notes: "İnce doğranmış" },
      { name: "Sarımsak", amount: "3 diş", notes: "Ezilmiş" },
      { name: "Zeytinyağı", amount: "3 yemek kaşığı", notes: "" },
      { name: "Zerdeçal (toz)", amount: "1 çay kaşığı", notes: "Sarı renk için" },
      { name: "Kala namak (siyah tuz)", amount: "1/2 çay kaşığı", notes: "Yumurta tadı verir" },
      { name: "Pul biber", amount: "1 çay kaşığı", notes: "" },
      { name: "Kimyon", amount: "1/2 çay kaşığı", notes: "" },
      { name: "Karabiber", amount: "1/2 çay kaşığı", notes: "" },
      { name: "Taze maydanoz", amount: "1/2 demet", notes: "Kıyılmış" },
      { name: "Beslenme mayas", amount: "2 yemek kaşığı", notes: "B12 için önemli" },
      { name: "Tam buğday ekmeği", amount: "4 dilim", notes: "Servis için" }
    ],
    instructions: [
      {
        step: 1,
        title: "Tofu Hazırlığı",
        description: "Tofuyu iyice sıkarak suyunu çıkarın (havlu ile sarıp 10 dakika bekletin). Ellerinizle veya çatalla ufalayın, scrambled yumurta kıvamı gibi olsun."
      },
      {
        step: 2,
        title: "Baharatları Karıştırma",
        description: "Küçük bir kasede zerdeçal, kala namak, pul biber, kimyon ve karabiberi karıştırın. Tofu parçalarına dökün ve karıştırın."
      },
      {
        step: 3,
        title: "Sebzeleri Soteleyin",
        description: "Geniş bir tavada zeytinyağını kızdırın. Soğanları ekleyin, yumuşayana kadar soteleyin (3-4 dakika). Sarımsağı ekleyin, 1 dakika daha."
      },
      {
        step: 4,
        title: "Biber ve Domates",
        description: "Biberleri ekleyin, 2 dakika soteleyin. Domatesleri ilave edin. Orta ateşte 5 dakika pişirin, suyu çeksin."
      },
      {
        step: 5,
        title: "Tofu Ekleme",
        description: "Baharatlı tofu parçalarını tavaya ekleyin. Karıştırarak 5-6 dakika pişirin. Tofu biraz kızarmalı. Beslenme mayasını ekleyin, karıştırın."
      },
      {
        step: 6,
        title: "Servis",
        description: "Maydanoz serpin. Kızarmış tam buğday ekmeği ile sıcak servis yapın. Yanında avokado dilimleri de ekleyebilirsiniz."
      }
    ],
    tips: [
      "Kala namak (Himalaya siyah tuzu) yumurta tadı verir - önemli bir malzeme.",
      "Beslenme mayası B12 vitamini ve peynir tadı verir.",
      "Tofu ne kadar sıkı olursa o kadar iyi sonuç alırsınız.",
      "Vegan peynir ekleyerek protein miktarını artırabilirsiniz."
    ],
    allergens: ["Soya (tofu)", "Gluten (ekmek)"],
    vegan: true,
    vegetarian: true,
    glutenFree: false,
    dairyFree: true,
    status: "active"
  },

  // ==================== YUMURTA YEMEKLERİ ====================
  {
    name: "Sebzeli Omlet & Avokado Toast",
    category: "Yumurta",
    tags: ["Kas Gelişimi", "Kilo Alma", "Sağlıklı Yaşam", "Beslenme"],
    difficulty: "Kolay",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    calories: 420,
    protein: 24,
    carbs: 32,
    fat: 22,
    fiber: 10,
    description: "Kahvaltının kralı - yüksek protein, sağlıklı yağlar ve kompleks karbonhidrat. Kas gelişimi için ideal.",
    ingredients: [
      { name: "Yumurta", amount: "4 büyük boy", notes: "" },
      { name: "Süt", amount: "4 yemek kaşığı", notes: "Badem sütü de olabilir" },
      { name: "Kırmızı biber", amount: "1/2 adet (75g)", notes: "Küp doğranmış" },
      { name: "Yeşil biber", amount: "1/2 adet (75g)", notes: "Küp doğranmış" },
      { name: "Mantar", amount: "100g", notes: "Dilimlenmiş" },
      { name: "Ispanak", amount: "2 avuç (50g)", notes: "Doğranmış" },
      { name: "Kırmızı soğan", amount: "1/4 adet", notes: "İnce kıyılmış" },
      { name: "Avokado", amount: "1 büyük boy", notes: "Ezilmiş" },
      { name: "Tam buğday ekmeği", amount: "4 dilim", notes: "Kızartılmış" },
      { name: "Çeri domates", amount: "6 adet", notes: "İkiye bölünmüş" },
      { name: "Limon", amount: "1/2 adet", notes: "Suyu kullanılacak" },
      { name: "Zeytinyağı veya tereyağı", amount: "2 yemek kaşığı", notes: "" },
      { name: "Tuz, karabiber", amount: "Tatmaya göre", notes: "" },
      { name: "Kırmızı pul biber", amount: "1/2 çay kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Yumurta Karışımı",
        description: "Yumurtaları derin bir kasede çırpın. Süt, tuz, karabiber ekleyin. Köpük olana kadar iyice çırpın (yaklaşık 1 dakika)."
      },
      {
        step: 2,
        title: "Sebzeleri Sotelemek",
        description: "Küçük bir tavada 1 yemek kaşığı zeytinyağı/tereyağı kızdırın. Soğan ve biberleri 2 dakika soteleyyin. Mantarları ekleyin, 3 dakika daha. Ispanağı en son ekleyin, solana kadar karıştırın (30 saniye). Bir tabağa alın."
      },
      {
        step: 3,
        title: "Omlet Pişirme",
        description: "Tavayı temizleyin, kalan yağı ekleyin. Orta ateşte ısıtın. Çırpılmış yumurtaları dökün. Kenarlar pişmeye başlayınca spatula ile hafifçe ortaya doğru itin. 2 dakika pişirin."
      },
      {
        step: 4,
        title: "İç Malzeme Ekleme",
        description: "Omletin yarısına sebzeleri yerleştirin. Diğer yarısını üzerine katlayın. 1 dakika daha pişirin. Tabağa alın."
      },
      {
        step: 5,
        title: "Avokado Toast Hazırlama",
        description: "Ekmekleri kızartın. Ezilmiş avokadoya limon suyu, tuz, karabiber ekleyip karıştırın. Kızarmış ekmeklerin üzerine sürün. Domates dilimlerini yerleştirin, pul biber serpin."
      },
      {
        step: 6,
        title: "Servis",
        description: "Omleti ikiye bölüp tabağa yerleştirin. Yanına avokado toastları koyun. Taze yeşillikler veya salata ile servis yapın."
      }
    ],
    tips: [
      "Yumurtaları süt ile çırpmak omleti daha yumuşak yapar.",
      "Tavayı fazla kızdırmayın, omlet yanmasın.",
      "İçine rendelenmiş peynir ekleyerek protein miktarını artırabilirsiniz.",
      "Vegan versiyon için tofu scramble kullanın."
    ],
    allergens: ["Yumurta", "Süt", "Gluten (ekmek)"],
    vegan: false,
    vegetarian: true,
    glutenFree: false,
    dairyFree: false,
    status: "active"
  },
  {
    name: "Shakshuka (Akdeniz Yumurtası)",
    category: "Yumurta",
    tags: ["Diyabet Hastası", "Kilo Verme", "Sağlıklı Yaşam", "Beslenme"],
    difficulty: "Orta",
    prepTime: 15,
    cookTime: 25,
    servings: 3,
    calories: 280,
    protein: 16,
    carbs: 18,
    fat: 16,
    fiber: 6,
    description: "Ortadoğu ve Akdeniz mutfağının klasiği. Düşük karbonhidrat, yüksek protein ve antioksidan açısından zengin.",
    ingredients: [
      { name: "Yumurta", amount: "6 adet", notes: "" },
      { name: "Domates (taze veya konserve)", amount: "800g", notes: "Küp doğranmış veya ezilmiş" },
      { name: "Kırmızı biber", amount: "2 adet (300g)", notes: "Doğranmış" },
      { name: "Soğan", amount: "1 büyük (150g)", notes: "Doğranmış" },
      { name: "Sarımsak", amount: "4 diş", notes: "İnce kıyılmış" },
      { name: "Zeytinyağı", amount: "3 yemek kaşığı", notes: "" },
      { name: "Domates salçası", amount: "2 yemek kaşığı", notes: "" },
      { name: "Kimyon", amount: "1 çay kaşığı", notes: "" },
      { name: "Tatlı kırmızı toz biber", amount: "1 çay kaşığı", notes: "" },
      { name: "Pul biber", amount: "1/2 çay kaşığı", notes: "İsteğe bağlı" },
      { name: "Tuz", amount: "1 çay kaşığı", notes: "" },
      { name: "Karabiber", amount: "1/2 çay kaşığı", notes: "" },
      { name: "Taze maydanoz", amount: "1 demet", notes: "Kıyılmış" },
      { name: "Beyaz peynir", amount: "100g", notes: "İsteğe bağlı, ufalanmış" },
      { name: "Tam buğday pidesi", amount: "3 dilim", notes: "Servis için" }
    ],
    instructions: [
      {
        step: 1,
        title: "Sos Tabanı Hazırlama",
        description: "Geniş ve derin bir tavada (kapağı olan) zeytinyağını kızdırın. Soğanları ekleyin, yumuşayana kadar soteleyin (5 dakika). Sarımsağı ekleyin, 1 dakika daha."
      },
      {
        step: 2,
        title: "Biber Ekleme",
        description: "Doğranmış biberleri ekleyin. 5-6 dakika yumuşayana kadar pişirin. Ara sıra karıştırın."
      },
      {
        step: 3,
        title: "Domates ve Baharat",
        description: "Domatesleri, salçayı, kimyonu, toz biberi, pul biberi, tuzu ve karabiberi ekleyin. İyice karıştırın. Kısık ateşte 10-12 dakika pişirin. Sos koyulaşmalı."
      },
      {
        step: 4,
        title: "Yumurta Yuvası Oluşturma",
        description: "Sosun içinde kaşık ile 6 tane çukur açın. Her çukura dikkatli bir şekilde 1 yumurta kırın. Tuz serpin."
      },
      {
        step: 5,
        title: "Pişirme",
        description: "Tavayı kapatın. Kısık ateşte 8-10 dakika pişirin. Yumurta akları tamamen pişmeli, sarılar hafif akışkan kalmalı (sunny side up). Daha sert isterseniz 2-3 dakika daha pişirin."
      },
      {
        step: 6,
        title: "Servis",
        description: "Üzerine maydanozu ve isteğe bağlı beyaz peyniri serpin. Sıcakken pide ekmekle servis yapın. Ekmeği sos ve yumurtaya batırarak yiyin."
      }
    ],
    tips: [
      "Derin tava kullanmak önemli - yumurtalar taşmamalı.",
      "Yumurta sarılarını kırmamaya dikkat edin.",
      "Vegan versiyon için yumurta yerine tofu scramble kullanın.",
      "Hazırladığınız sosu 3 gün buzdolabında saklayabilir, ihtiyaç olunca yumurta ekleyebilirsiniz."
    ],
    allergens: ["Yumurta", "Süt (peynir)", "Gluten (ekmek)"],
    vegan: false,
    vegetarian: true,
    glutenFree: false,
    dairyFree: false,
    status: "active"
  },
  {
    name: "Protein Power Omlet",
    category: "Yumurta",
    tags: ["Kas Gelişimi", "Kilo Alma", "Beslenme", "Stabil Kalma"],
    difficulty: "Kolay",
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    calories: 480,
    protein: 42,
    carbs: 12,
    fat: 30,
    fiber: 3,
    description: "Yüksek protein içeren kas gelişimi için özel omlet tarifi. Spordan sonra ideal besin.",
    ingredients: [
      { name: "Yumurta", amount: "3 tam yumurta + 2 yumurta akı", notes: "" },
      { name: "Hindi füme", amount: "50g", notes: "Küp doğranmış" },
      { name: "Beyaz peynir (light)", amount: "50g", notes: "Ufalanmış" },
      { name: "Ispanak", amount: "2 avuç (50g)", notes: "" },
      { name: "Mantar", amount: "50g", notes: "Dilimlenmiş" },
      { name: "Domates", amount: "1 adet", notes: "Küp doğranmış" },
      { name: "Zeytinyağı spreyi", amount: "Birkaç sıkım", notes: "" },
      { name: "Tuz, karabiber", amount: "Tatmaya göre", notes: "" },
      { name: "Kekik", amount: "1/2 çay kaşığı", notes: "" }
    ],
    instructions: [
      {
        step: 1,
        title: "Yumurta Karışımı",
        description: "Tüm yumurtaları derin bir kasede çırpın. Tuz, karabiber ve kekik ekleyin. İyice çırpın."
      },
      {
        step: 2,
        title: "İç Malzeme Hazırlama",
        description: "Küçük bir tavada zeytinyağı spreyi sıkın. Mantarları 2 dakika soteleyyin. Ispanağı ekleyin, solana kadar karıştırın. Bir tabağa alın."
      },
      {
        step: 3,
        title: "Omlet Tabanı",
        description: "Orta boy bir yapışmaz tavayı zeytinyağı spreyi ile hafifçe yağlayın. Orta ateşte ısıtın. Çırpılmış yumurtaları dökün."
      },
      {
        step: 4,
        title: "İç Malzeme Ekleme",
        description: "Yumurta pişmeye başlayınca (kenarlar katılaşınca) omletin yarısına hindi füme, beyaz peynir, mantar-ıspanak karışımı ve domatesi yerleştirin."
      },
      {
        step: 5,
        title: "Katlama ve Pişirme",
        description: "Spatula ile diğer yarısını kapatın. Kısık ateşte 2-3 dakika daha pişirin. Peynir hafif erimeli."
      },
      {
        step: 6,
        title: "Servis",
        description: "Tabağa alın. Yanında çeri domates ve salatalık dilimleri ile servis yapın."
      }
    ],
    tips: [
      "Yumurta akı eklemek protein miktarını artırır ama yağı azaltır.",
      "Hindi füme yerine tavuk göğsü veya ton balığı da kullanabilirsiniz.",
      "Vegan versiyon için tofu scramble ve vegan peynir kullanın.",
      "Spordan 30-60 dakika içinde tüketmek kas gelişimi için idealdir."
    ],
    allergens: ["Yumurta", "Süt (peynir)"],
    vegan: false,
    vegetarian: false,
    glutenFree: true,
    dairyFree: false,
    status: "active"
  },

  // ==================== İÇECEKLER VE SHAKE'LER ====================
  {
    name: "Yeşil Detox Smoothie",
    category: "İçecekler ve Shakeler",
    tags: ["Kilo Verme", "Sağlıklı Yaşam", "Beslenme", "Vejetaryen"],
    difficulty: "Çok Kolay",
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    calories: 180,
    protein: 4,
    carbs: 32,
    fat: 4,
    fiber: 8,
    description: "Antioksidan ve vitamin açısından çok zengin detox içeceği. Sabah aç karnına ideal.",
    ingredients: [
      { name: "Ispanak (taze)", amount: "2 avuç (50g)", notes: "" },
      { name: "Muz", amount: "1 büyük boy", notes: "Dondurulmuş tercih edilir" },
      { name: "Yeşil elma", amount: "1 adet (150g)", notes: "Kabuklu, doğranmış" },
      { name: "Salatalık", amount: "1/2 adet (100g)", notes: "Soyulmuş, doğranmış" },
      { name: "Kereviz", amount: "1 dal", notes: "Doğranmış" },
      { name: "Maydanoz", amount: "1/4 demet", notes: "" },
      { name: "Limon", amount: "1/2 adet", notes: "Suyu kullanılacak" },
      { name: "Zencefil", amount: "1cm parça", notes: "Soyulmuş" },
      { name: "Keten tohumu", amount: "1 yemek kaşığı", notes: "Öğütülmüş" },
      { name: "Su veya hindistan cevizi suyu", amount: "300ml", notes: "" },
      { name: "Buz", amount: "4-5 küp", notes: "" },
      { name: "Bal", amount: "1 çay kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Malzemeleri Hazırlama",
        description: "Tüm sebze ve meyveleri yıkayın. Muz ve elmayı küçük parçalara kesin. Salatalık ve kerevizi doğrayın."
      },
      {
        step: 2,
        title: "Blender'a Yerleştirme",
        description: "Önce sıvıyı (su/hindistan cevizi suyu) blender'a koyun. Sonra ıspanak, maydanoz gibi yeşillikleri ekleyin. En sona sert malzemeleri (elma, muz) ve buzları koyun."
      },
      {
        step: 3,
        title: "Karıştırma",
        description: "Yüksek hızda 60-90 saniye karıştırın. Tamamen pürüzsüz bir kıvam olmalı. Gerekirse blender'ı durdurup kenarları spatula ile temizleyin, tekrar karıştırın."
      },
      {
        step: 4,
        title: "Lezzet Ayarlama",
        description: "Tadına bakın. Çok ekşi ise bal ekleyin. Çok koyu ise biraz daha su ekleyip karıştırın."
      },
      {
        step: 5,
        title: "Servis",
        description: "Bardaklara dökün. İsteğe bağlı üzerine keten tohumu veya chia tohumu serpin. Hemen için (vitamin kaybını önlemek için)."
      }
    ],
    tips: [
      "Donmuş muz kullanmak smoothie'yi kremsi ve soğuk yapar.",
      "Sabah aç karnına içmek detox etkisini artırır.",
      "Protein eklemek için protein tozu veya Yunan yoğurdu ekleyebilirsiniz.",
      "Hazırladıktan sonra 24 saat içinde tüketin (kapalı kapta buzdolabında)."
    ],
    allergens: ["Bal (vegan değil)"],
    vegan: true,
    vegetarian: true,
    glutenFree: true,
    dairyFree: true,
    status: "active"
  },
  {
    name: "Protein Power Shake (Çikolatalı)",
    category: "İçecekler ve Shakeler",
    tags: ["Kas Gelişimi", "Kilo Alma", "Beslenme", "Stabil Kalma"],
    difficulty: "Çok Kolay",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 520,
    protein: 45,
    carbs: 52,
    fat: 12,
    fiber: 6,
    description: "Yüksek protein ve kalori içeren kas gelişimi shake'i. Spordan sonra 30 dakika içinde ideal.",
    ingredients: [
      { name: "Protein tozu (whey veya vegan)", amount: "2 ölçek (60g)", notes: "Çikolata aromalı" },
      { name: "Muz", amount: "2 orta boy", notes: "Dondurulmuş tercih edilir" },
      { name: "Yulaf ezmesi", amount: "50g", notes: "" },
      { name: "Yer fıstığı ezmesi", amount: "2 yemek kaşığı", notes: "Şekersiz" },
      { name: "Süt", amount: "400ml", notes: "Badem/soya sütü de olur" },
      { name: "Kakao tozu", amount: "1 yemek kaşığı", notes: "Ham kakao tercih edilir" },
      { name: "Bal veya hurma", amount: "1 yemek kaşığı veya 2 adet", notes: "Tatlandırmak için" },
      { name: "Tarçın", amount: "1 çay kaşığı", notes: "" },
      { name: "Buz", amount: "4-5 küp", notes: "" },
      { name: "Chia tohumu", amount: "1 yemek kaşığı", notes: "İsteğe bağlı" }
    ],
    instructions: [
      {
        step: 1,
        title: "Malzemeleri Hazırlama",
        description: "Muzları soyun ve doğrayın (donmuş kullanıyorsanız doğramaya gerek yok). Hurma kullanıyorsanız çekirdeğini çıkarın."
      },
      {
        step: 2,
        title: "Blender'a Yerleştirme",
        description: "Önce sıvıyı (süt) blender'a koyun. Sonra yumuşak malzemeleri (muz, protein tozu, yulaf, yer fıstığı ezmesi, kakao, bal/hurma, tarçın) ekleyin. En sona buzu koyun."
      },
      {
        step: 3,
        title: "Karıştırma",
        description: "Düşük hızda başlayın, sonra yüksek hıza geçin. 60-90 saniye karıştırın. Tamamen pürüzsüz ve kremsi bir kıvam olmalı."
      },
      {
        step: 4,
        title: "Kıvam Ayarlama",
        description: "Çok koyu ise 50-100ml daha süt ekleyin. Çok sulu ise daha fazla yulaf veya buz ekleyin."
      },
      {
        step: 5,
        title: "Servis",
        description: "Bardağa dökün. İsteğe bağlı üzerine chia tohumu, kakao nibs veya granola serpin. Hemen için."
      }
    ],
    tips: [
      "Spordan sonra 30-60 dakika içinde içmek kas gelişimi için ideal penceredir.",
      "Vegan versiyon için vegan protein tozu ve bitki bazlı süt kullanın.",
      "Yulaf ezmesi kompleks karbonhidrat sağlar ve tok tutar.",
      "Hazırladıktan sonra en fazla 2 saat içinde tüketin."
    ],
    allergens: ["Süt", "Yer fıstığı", "Gluten (yulaf - kontamine olabilir)"],
    vegan: false,
    vegetarian: true,
    glutenFree: false,
    dairyFree: false,
    status: "active"
  },
  {
    name: "Antioksidan Bomba Smoothie",
    category: "İçecekler ve Shakeler",
    tags: ["Sağlıklı Yaşam", "Diyabet Hastası", "Kilo Verme", "Vejetaryen"],
    difficulty: "Çok Kolay",
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    calories: 220,
    protein: 6,
    carbs: 38,
    fat: 6,
    fiber: 9,
    description: "Yaban mersini, nar ve açai berry ile antioksidan açısından çok zengin. Bağışıklık sistemini güçlendirir.",
    ingredients: [
      { name: "Yaban mersini (blueberry)", amount: "150g", notes: "Dondurulmuş veya taze" },
      { name: "Ahududu (raspberry)", amount: "100g", notes: "Dondurulmuş veya taze" },
      { name: "Çilek", amount: "150g", notes: "Dondurulmuş veya taze" },
      { name: "Nar suyu", amount: "200ml", notes: "Saf, şekersiz" },
      { name: "Yunan yoğurdu", amount: "150g", notes: "Az yağlı veya tam yağlı" },
      { name: "Açai tozu", amount: "1 yemek kaşığı", notes: "İsteğe bağlı" },
      { name: "Chia tohumu", amount: "1 yemek kaşığı", notes: "" },
      { name: "Bal", amount: "1 çay kaşığı", notes: "İsteğe bağlı" },
      { name: "Vanilya özütü", amount: "1/2 çay kaşığı", notes: "" },
      { name: "Buz", amount: "4-5 küp", notes: "" }
    ],
    instructions: [
      {
        step: 1,
        title: "Meyveleri Hazırlama",
        description: "Taze meyve kullanıyorsanız yıkayın. Çileğin saplarını kesin. Dondurulmuş meyve kullanıyorsanız 5 dakika oda sıcaklığında bekletin (blender'ın zorlanmaması için)."
      },
      {
        step: 2,
        title: "Blender'a Yerleştirme",
        description: "Önce nar suyunu blender'a koyun. Sonra Yunan yoğurdu, chia tohumu, açai tozu (kullanıyorsanız), vanilya ve bal ekleyin. En sona meyveleri ve buzu koyun."
      },
      {
        step: 3,
        title: "Karıştırma",
        description: "Düşük hızda başlayın, meyveleri parçalayın. Sonra yüksek hıza geçin ve 60-90 saniye karıştırın. Tamamen pürüzsüz olmalı."
      },
      {
        step: 4,
        title: "Kıvam Kontrolü",
        description: "Çok koyu ise biraz daha nar suyu veya su ekleyin. Bowl konsistansında isterseniz daha az sıvı kullanın."
      },
      {
        step: 5,
        title: "Servis",
        description: "Bardaklara veya kaselere dökün. Üzerine granola, taze meyveler, chia tohumu veya bal serpin. Hemen için."
      }
    ],
    tips: [
      "Diyabet hastaları için balı çıkarın veya çok az kullanın.",
      "Açai tozu antioksidan miktarını 2 katına çıkarır.",
      "Vegan versiyon için Yunan yoğurdu yerine hindistan cevizi yoğurdu kullanın.",
      "Smoothie bowl olarak servis edip üzerine topping'ler ekleyebilirsiniz."
    ],
    allergens: ["Süt (yoğurt)", "Bal (vegan değil)"],
    vegan: false,
    vegetarian: true,
    glutenFree: true,
    dairyFree: false,
    status: "active"
  }
];

async function seedRealRecipes() {
  try {
    console.log("🌱 15 GERÇEK YEMEK TARİFİ YÜKLENİYOR...\n");
    console.log("📋 Kategoriler:");
    console.log("   - Tavuk Yemekleri: 3 tarif");
    console.log("   - Balık Yemekleri: 3 tarif");
    console.log("   - Vegan Yemekleri: 3 tarif");
    console.log("   - Yumurta: 3 tarif");
    console.log("   - İçecekler ve Shakeler: 3 tarif");
    console.log("\n");

    const batch = db.batch();
    let count = 0;

    for (const recipe of realRecipes) {
      const docRef = db.collection("recipes").doc();
      batch.set(docRef, {
        ...recipe,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        rating: 0,
        reviewCount: 0,
        views: 0
      });
      
      count++;
      console.log(`✅ ${count}. ${recipe.name} - ${recipe.category}`);
    }

    await batch.commit();
    
    console.log(`\n✨ TOPLAM ${realRecipes.length} GERÇEK TARİF BAŞARIYLA YÜKLENDİ! ✨\n`);
    console.log(`📊 Etiket Dağılımı:`);
    console.log(`   - Diyabet Hastası: ${realRecipes.filter(r => r.tags.includes("Diyabet Hastası")).length}`);
    console.log(`   - Kilo Verme: ${realRecipes.filter(r => r.tags.includes("Kilo Verme")).length}`);
    console.log(`   - Kilo Alma: ${realRecipes.filter(r => r.tags.includes("Kilo Alma")).length}`);
    console.log(`   - Kas Gelişimi: ${realRecipes.filter(r => r.tags.includes("Kas Gelişimi")).length}`);
    console.log(`   - Sağlıklı Yaşam: ${realRecipes.filter(r => r.tags.includes("Sağlıklı Yaşam")).length}`);
    console.log(`   - Vejetaryen: ${realRecipes.filter(r => r.tags.includes("Vejetaryen")).length}`);
    console.log(`\n🎯 Özel Filtreler:`);
    console.log(`   - Vegan: ${realRecipes.filter(r => r.vegan).length}`);
    console.log(`   - Gluten-Free: ${realRecipes.filter(r => r.glutenFree).length}`);
    console.log(`   - Dairy-Free: ${realRecipes.filter(r => r.dairyFree).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

seedRealRecipes();

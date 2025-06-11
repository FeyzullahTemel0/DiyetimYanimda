const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//======================================================================
// BİLİŞSEL MİMARİ - KATMAN 1: ALGISAL MOTOR (Perception Engine)
//======================================================================
const PerceptionEngine = {
    analyze: (message, history = []) => {
        const lower = message.toLowerCase().trim();
        const state = {
            intent: 'UNKNOWN',
            sentiment: 'NEUTRAL',
            urgency: 'NORMAL',
            userPersonalityTraits: new Set()
        };

        const rules = [
            { intent: 'CRITICAL_COMPLAINT', keywords: ["sikerim", "aptal mısın", "aptalsın", "dolandırıcı mısın", "ne biçim ai", "amk", "yarram"], sentiment: 'HOSTILE', urgency: 'IMMEDIATE' },
            { intent: 'COMPLAINT', keywords: ["canımı sıkma", "sürekli aynı şey", "ısrar etme", "soru sorma", "hala program diyorsun", "yine program", "programa taktın"], sentiment: 'ANNOYED', urgency: 'HIGH' },
            { intent: 'TOPIC_DISMISSAL', keywords: ["boşver", "neyse", "konu o değil", "sadece sohbet", "programdan bahsetme", "konuşmak istemiyorum"], sentiment: 'DISMISSIVE', urgency: 'NORMAL' },
            { intent: 'EMOTIONAL_VENT', keywords: ["kilo aldım", "kilo almaya başladım", "ne yapıcam bilmiyorum", "çok şiştim", "hiçbir şey olmuyor", "beceremiyorum"], sentiment: 'SAD', urgency: 'HIGH' },
            { intent: 'PASSIVE_LISTENING', keywords: ["motivasyonum düşük", "kötüydü", "yoruldum", "canım istemiyor", "hiçbir şey yapmadım", "gidip yatıcam"], sentiment: 'PASSIVE', urgency: 'NORMAL' },
            { intent: 'INDECISIVE', keywords: ["bilmem", "kararsızım", "ne sorsam", "eee"], sentiment: 'NEUTRAL', urgency: 'LOW' },
            { intent: 'FRIENDLY_CHAT', keywords: ["sıkıldım", "dertleşelim", "yalnızım", "canım sıkılıyor", "sohbet edelim mi"], sentiment: 'NEEDY', urgency: 'HIGH' },
            { intent: 'DAILY_CHAT', keywords: ["selam", "merhaba", "naber", "nasılsın", "iyi misin", "heyy", "hey", "teşekkürler", "sağ ol", "görüşürüz", "iyi akşamlar", "harikasın", "sen kimsin", "ne yapıyorsun", "günaydın", "iyilik güzellik", "bugün nasıl geçti", "hayır"], sentiment: 'NEUTRAL', urgency: 'NORMAL' },
            { intent: 'INAPPROPRIATE_REQUEST', keywords: ["sevişelim", "çıplak", "erotik", "sex"], sentiment: 'INAPPROPRIATE', urgency: 'IMMEDIATE' }
        ];

        for (const rule of rules) {
            if (rule.keywords.some(k => lower.includes(k))) {
                state.intent = rule.intent;
                state.sentiment = rule.sentiment;
                state.urgency = rule.urgency;
                break;
            }
        }

        if (state.intent === 'UNKNOWN') {
            state.intent = 'DIET_QUESTION';
        }

        (history || []).forEach(msg => {
            if (msg.sender === 'user') {
                const userMsg = msg.text.toLowerCase();
                if (userMsg.includes('aşkım') || userMsg.includes('canım')) state.userPersonalityTraits.add('OVERLY_FAMILIAR');
                if (userMsg.length > 150) state.userPersonalityTraits.add('DETAILED_ORIENTED');
                if (userMsg.split(' ').length < 3) state.userPersonalityTraits.add('SHORT_SPOKEN');
            }
        });

        return state;
    }
};

//======================================================================
// BİLİŞSEL MİMARİ - KATMAN 2: HAFIZA ÇEKİRDEĞİ (Memory Core)
//======================================================================
const MemoryCore = {
    sanitize: (history, profile) => {
        const forbiddenKeywords = new Set();
        const dismissalKeywords = ["programdan bahsetme", "konuşmak istemiyorum", "o konuyu açma", "sikerim programını", "programa taktın"];

        (history || []).forEach(msg => {
            if (msg.sender === 'user' && dismissalKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))) {
                if (msg.text.toLowerCase().includes('program')) forbiddenKeywords.add('program');
            }
        });

        if (forbiddenKeywords.size === 0) {
            return { sanitizedHistory: history || [], sanitizedProfile: profile, forbiddenTopicsDirective: '' };
        }

        const sanitizedHistory = (history || []).map(msg => {
            const containsForbidden = [...forbiddenKeywords].some(keyword => msg.text.toLowerCase().includes(keyword));
            if (containsForbidden) {
                return { ...msg, text: "[Kullanıcı bu konuyla ilgili konuşmak istemedi.]" };
            }
            return msg;
        });

        const sanitizedProfile = { ...profile };
        if (forbiddenKeywords.has('program')) {
            delete sanitizedProfile.activeProgram;
            delete sanitizedProfile.subscription;
        }

        const forbiddenTopicsDirective = `\n// KESİN ANAYASA KURALI - HAFIZA: Şu kelimeleri ASLA kullanma: [${Array.from(forbiddenKeywords).join(', ')}]. Bu, sohbetin devamı için en önemli kuraldır.`;
        return { sanitizedHistory, sanitizedProfile, forbiddenTopicsDirective };
    }
};

//======================================================================
// BİLİŞSEL MİMARİ - KATMAN 3: KİŞİLİK MATRİSİ (Personality Matrix)
//======================================================================
const PersonalityMatrix = {
    getBasePrompt: (profile) => `
      Sen "DietAI" adında, insan psikolojisinden anlayan, son derece empatik ve zeki bir diyet asistanısın. Kişiliğin profesyonel, destekleyici, sabırlı ve bilgecedir. Amacın, kullanıcıya kendini dinlenmiş, anlaşılmış ve değerli hissettirmektir. Cevapların doğal, akıcı ve samimi olsun.
      - ${profile.gender === 'male' ? "Kullanıcı bir erkek. Onunla konuşurken dilin net, motive edici ve çözüm odaklı olabilir." : "Kullanıcı bir kadın. Onunla konuşurken dilin empatik, destekleyici ve süreci anlayan bir tonda olsun."}
      - CEVAP FORMATI: Okunabilirlik için daima Markdown kullan: **kalın yazılar**, - madde işaretleri ve kısa paragraflar.
      - BİTİRİŞ KURALI: Cevabını her zaman sohbete devam etmeye teşvik eden açık uçlu bir soruyla bitir.
    `
};

//======================================================================
// BİLİŞSEL MİMARİ - KATMAN 4 & 5: STRATEJİ & EYLEM MOTORU
//======================================================================
exports.askAiAssistant = async (req, res) => {
  try {
    const { message, profile, history } = req.body;
    if (!message?.trim() || !profile) return res.status(400).json({ error: 'Geçersiz istek.' });

    const perception = PerceptionEngine.analyze(message, history);
    const { sanitizedHistory, sanitizedProfile, forbiddenTopicsDirective } = MemoryCore.sanitize(history, profile);

    let finalSystemPrompt = `${PersonalityMatrix.getBasePrompt(profile)} ${forbiddenTopicsDirective}`;
    let isProfileNeeded = false;

    let strategyPrompt = '';
    switch (perception.intent) {
      case 'CRITICAL_COMPLAINT':
        strategyPrompt = `STRATEJİ: DE-ESKALASYON VE GÜVEN YENİLEME. Kullanıcı çok sinirli. Sakin kal, özür dile ve durumu yatıştır. ASLA kendini savunma. ÖRNEK: "Sizi bu kadar sinirlendirdiğim için gerçekten çok üzgünüm. Anlaşılan o ki beklentilerinizi karşılayamadım. Bu sohbeti burada sonlandırmak en doğrusu olabilir."`;
        break;
      case 'INAPPROPRIATE_REQUEST':
        strategyPrompt = `STRATEJİ: SINIR ÇİZME. Kullanıcı uygunsuz bir istekte bulundu. Net, kesin ve profesyonel bir sınır çiz. ÖRNEK: "Bu tür bir talebi yanıtlamıyorum. Ben profesyonel bir diyet asistanıyım. Lütfen sohbeti bu çerçevede tutalım."`;
        break;
      case 'TOPIC_DISMISSAL':
      case 'COMPLAINT':
        strategyPrompt = `STRATEJİ: GÖNÜL ALMA VE KONU DEĞİŞTİRME. Kullanıcı rahatsız veya bir konuyu kapattı. Anladığını belirt ve sohbeti tamamen genel bir alana çek. ÖRNEK: "Elbette, anlaştık. O konuları tamamen bir kenara bırakıyoruz. Peki, gününüz nasıl geçiyor?"`;
        break;
      case 'EMOTIONAL_VENT':
      case 'PASSIVE_LISTENING':
      case 'FRIENDLY_CHAT':
        strategyPrompt = `STRATEJİ: AKTİF DİNLEME VE EMPATİ. Kullanıcı duygusal bir durumda veya sadece sohbet etmek istiyor. Çözüm önerme. Sadece dinle, duygusunu onayla ve basit, açık uçlu sorular sor. ÖRNEK: "Böyle hissetmeniz çok doğal. Bu konuda konuşmak ister misiniz, yoksa sadece içinizi dökmek mi daha iyi hissettirir?"`;
        break;
      case 'INDECISIVE':
        strategyPrompt = `STRATEJİ: YÖNLENDİRME. Kullanıcı kararsız. Ona seçenekler sun. ÖRNEK: "Hiç sorun değil. İsterseniz genel beslenme ipuçları verebilirim ya da sadece sohbet edebiliriz. Hangisi size daha iyi hissettirir?"`;
        break;
      case 'DAILY_CHAT':
        strategyPrompt = `STRATEJİ: KISA VE NAZİK KARŞILAMA. Günlük sohbet başlattı. Kısa yanıt ver ve basit bir soru sor.`;
        break;
      case 'DIET_QUESTION':
      default:
        strategyPrompt = `
          STRATEJİ: BİLGİ VERME. Kullanıcı diyetle ilgili bir soru sordu. Profesyonelce cevap ver.
          - Cevabını sana verilen KULLANICI PROFİLİ'ne göre kişiselleştir.
          - Yargılayıcı olma.
          - Sohbetin devamıysa tekrar "Merhaba" deme.
          - Sonunda tıbbi uyarıyı ekle.
        `;
        isProfileNeeded = true;
        break;
    }
    
    finalSystemPrompt += `\n\n// ANLIK GÖREV\n${strategyPrompt}`;
    if(isProfileNeeded) {
        finalSystemPrompt += `\n\n// GEREKLİ VERİLER\nKULLANICI PROFİLİ: ${JSON.stringify(sanitizedProfile, null, 2)}`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let geminiHistory = (sanitizedHistory || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    // ================== YENİ GÜVENLİK AĞI (HATAYI KESİN ÇÖZER) ==================
    // Gemini'ye göndermeden önce, geçmişin bir 'model' mesajıyla başlamadığından emin ol.
    // Eğer başlıyorsa, bu hatalı başlangıçları diziden temizle.
    while (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
        geminiHistory.shift(); // Dizinin başındaki 'model' mesajını kaldır.
    }
    // ===========================================================================

    const chat = model.startChat({
      history: geminiHistory, // Artık %100 güvenli olan geçmişi kullan
      generationConfig: { temperature: 0.8 },
    });
    
    const result = await chat.sendMessage(finalSystemPrompt + `\n\nKullanıcının Son Mesajı: ${message}`);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error('Gemini API hatası:', err);
    res.status(500).json({ error: 'Yapay zeka asistanı ile iletişim kurulamadı.' });
  }
};
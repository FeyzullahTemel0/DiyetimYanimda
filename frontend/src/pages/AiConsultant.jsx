import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, getDoc } from "firebase/firestore";
import { useHealthProfile, getDiabeticMacroRecommendations, getHypertensionRecommendations } from "../hooks/useHealthProfile";
import PlanAccess from "../components/PlanAccess";
import "./AiConsultant.css";

const getApiUrl = (endpoint) => {
  const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  return `${base}${endpoint}`;
};

export default function AiConsultant() {
  const [user] = useAuthState(auth);
  const { healthProfile, isDiabetic, isHypertensive, diabeticType, allergies } = useHealthProfile();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Merhaba! Ben senin yapay zeka destekli beslenme danışmanınım. 🥗\n\nSana özel beslenme tavsiyeleri, yemek önerileri ve sağlıklı yaşam ipuçları verebilirim. Nasıl yardımcı olabilirim?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sohbet geçmişini yükleme
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "aiConversations"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  // Seçili konuşmanın mesajlarını yükleme
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(
      collection(db, "aiMessages"),
      where("conversationId", "==", selectedConversation),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Profili yükleme
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const res = await fetch(getApiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Profil yüklenirken hata:", error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateAIResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = "";

    // DIYABET HASTASI İÇİN ÖZEL TAVSIYELERI
    if (isDiabetic) {
      const diabeticRecs = getDiabeticMacroRecommendations(profile?.weight || 70, diabeticType);
      
      if (lowerMessage.includes("kalori") || lowerMessage.includes("makro") || lowerMessage.includes("diyabet")) {
        response = `🩺 **${diabeticRecs[diabeticType]?.description}**\n\n`;
        response += `**Günlük Beslenme Hedefleri:**\n`;
        response += `- Kalori: ~${Math.round(diabeticRecs[diabeticType].calories)} kcal\n`;
        response += `- Protein: ${Math.round(diabeticRecs[diabeticType].protein.grams)}g (${diabeticRecs[diabeticType].protein.percentage}%)\n`;
        response += `- Karbonhidrat: ${Math.round(diabeticRecs[diabeticType].carbs.grams)}g (${diabeticRecs[diabeticType].carbs.percentage}%) - ${diabeticRecs[diabeticType].carbs.note}\n`;
        response += `- Yağ: ${Math.round(diabeticRecs[diabeticType].fat.grams)}g (${diabeticRecs[diabeticType].fat.percentage}%)\n`;
        response += `- Fiber: ${diabeticRecs[diabeticType].fiber.grams}g/gün (${diabeticRecs[diabeticType].fiber.note})\n\n`;
        response += `**İpuçları:**\n`;
        diabeticRecs[diabeticType].tips.forEach(tip => {
          response += `✓ ${tip}\n`;
        });
        return response;
      }
    }

    // HİPERTANSİYON HASTASI İÇİN ÖZEL TAVSIYELERI
    if (isHypertensive) {
      const hyperRecs = getHypertensionRecommendations();
      
      if (lowerMessage.includes("tuz") || lowerMessage.includes("tansiyon") || lowerMessage.includes("sodyum")) {
        response = `🩺 **Hipertansiyon Diyeti - DASH Diyeti Önerileri**\n\n`;
        response += `**Sodyum Sınırı:** ${hyperRecs.sodiumLimit}mg/gün (ideal: 1500mg)\n`;
        response += `**Potasyum Hedefi:** ${hyperRecs.potassiumTarget}mg/gün\n`;
        response += `**Alkol Limiti:** ${hyperRecs.alcohol.max} içki/gün (${hyperRecs.alcohol.note})\n\n`;
        response += `**İçeren Gıdalar:** ${hyperRecs.foods.include.join(", ")}\n\n`;
        response += `**Kaçınılması Gereken:** ${hyperRecs.foods.avoid.join(", ")}\n\n`;
        response += `**Genel İpuçları:**\n`;
        hyperRecs.tips.forEach(tip => {
          response += `✓ ${tip}\n`;
        });
        return response;
      }
    }

    // ALERJISI OLAN KIŞI İÇİN
    if (allergies && allergies.trim()) {
      if (lowerMessage.includes("alerji") || lowerMessage.includes("kaçın") || lowerMessage.includes("yerine")) {
        response = `🚫 **Alerjiniz için Özel Tavsiyeleri Kontrol Etmek:**\n\n`;
        response += `Tespit edilen alerjiler: ${allergies}\n\n`;
        response += `Lütfen profil sayfasında kayıtlı alerjilerinizi kontrol edin. `;
        response += `Herhangi bir gıdayı tüketmeden önce etiketleri dikkatle okuyun!\n\n`;
        response += `**Acil Durumda:** Alerjik reaksiyon hissederseniz hemen tıbbi yardım alın.`;
        return response;
      }
    }

    // STANDART TAVSIYELERI
    if (lowerMessage.includes("kahvaltı") || lowerMessage.includes("sabah")) {
      response = `Sabah için harika bir başlangıç! İşte önerilerim:\n\n🥚 **Protein Zengin Kahvaltı:**\n- 2 haşlanmış yumurta\n- 1 dilim tam buğday ekmeği\n- Bir avuç ceviz veya badem\n- Taze sebze (domates, salatalık)\n\n🥣 **Alternatif:**\n- Yulaf ezmesi (40g) + süt\n- 1 muz\n- 1 çay kaşığı bal\n- Tarçın\n\nBu kahvaltı yaklaşık 400-450 kalori ve dengeli makro dağılımı sağlar.`;
    } else if (lowerMessage.includes("öğle") || lowerMessage.includes("lunch")) {
      response = `Öğle yemeği için besleyici ve doyurucu öneriler:\n\n🍗 **Tavuklu Salata Bowl:**\n- 150g ızgara tavuk göğsü\n- Karışık yeşillik (marul, roka, ıspanak)\n- Quinoa veya bulgur (1 çay bardağı)\n- Cherry domates, salatalık\n- Zeytinyağı ve limon sosu\n\n🐟 **Alternatif - Somon:**\n- 120g fırında somon\n- Buharda sebze (brokoli, havuç)\n- 150g haşlanmış patates\n\nYaklaşık 500-600 kalori, protein ve omega-3 açısından zengin!`;
    } else if (lowerMessage.includes("akşam") || lowerMessage.includes("dinner") || lowerMessage.includes("yemek")) {
      response = `Akşam için hafif ama doyurucu öneriler:\n\n🥘 **Izgara Tavuk + Sebze:**\n- 150g ızgara tavuk\n- Fırında sebze (patlıcan, biber, kabak)\n- 1 kase cacık\n- Az yağlı peynir (30g)\n\n🍲 **Çorba + Proteini:**\n- Mercimek çorbası (1 kase)\n- 100g ızgara balık veya köfte\n- Mevsim salatası\n\nAkşam yemeğini uyumadan 2-3 saat önce yemeye dikkat et!`;
    } else if (lowerMessage.includes("protein") || lowerMessage.includes("kas")) {
      response = `Protein ihtiyacın için öneriler:\n\n💪 **Günlük Protein Hedefi:**\n${profile?.weight ? `- Vücut ağırlığın (${profile.weight}kg) için günde ${(profile.weight * 1.6).toFixed(0)}-${(profile.weight * 2.2).toFixed(0)}g protein ideal` : "- Vücut ağırlığın başına 1.6-2.2g protein almalısın"}\n\n🥩 **Yüksek Protein Kaynakları:**\n- Tavuk göğsü (100g = 31g protein)\n- Somon balığı (100g = 25g protein)\n- Yumurta (1 adet = 6g protein)\n- Peynir (30g = 7g protein)\n- Baklagiller (mercimek, nohut)\n- Protein tozu (opsiyonel)`;
    } else if (lowerMessage.includes("kilo") && (lowerMessage.includes("ver") || lowerMessage.includes("azalt"))) {
      response = `Sağlıklı kilo verme stratejileri:\n\n📉 **Kalori Dengesi:**\n- Günlük kalori açığı: 300-500 kalori\n- Haftada 0.5-1kg hedefle (sağlıklı tempo)\n- Su tüketimini artır (2.5-3L/gün)\n\n🏃 **Egzersiz:**\n- Haftada 3-4 gün kardiyo (30-45 dk)\n- 2-3 gün direnç antrenmanı\n- Bol bol yürüyüş\n\n🥗 **Beslenme İpuçları:**\n- Protein oranını artır (tok hissettir)\n- Lifli gıdalar tüket (sebze, meyve, tam tahıl)\n- İşlenmiş gıdalardan uzak dur\n- Düzenli öğün zamanları`;
    } else if (lowerMessage.includes("su") || lowerMessage.includes("hidrasyon")) {
      response = `Su tüketimi önerileri:\n\n💧 **Günlük Su İhtiyacı:**\n${profile?.weight ? `- Vücut ağırlığın (${profile.weight}kg) için günde ${(profile.weight * 0.035).toFixed(1)}L su içmelisin` : "- Vücut ağırlığın başına 35ml su (yaklaşık 2.5-3L)"}\n\n⏰ **Zamanlama:**\n- Sabah kalktığında: 1-2 bardak\n- Her öğünden 30 dk önce: 1 bardak\n- Egzersiz sırasında: 15-20 dk'da bir\n- Gün boyunca düzenli aralıklarla\n\n✅ **Faydaları:**\n- Metabolizmayı hızlandırır\n- Tokluğu artırır\n- Cilt sağlığını iyileştirir\n- Yorgunluğu azaltır`;
    } else if (lowerMessage.includes("meyve") || lowerMessage.includes("atıştırmalık") || lowerMessage.includes("snack")) {
      response = `Sağlıklı atıştırmalık önerileri:\n\n🍎 **Meyveler:**\n- 1 orta boy elma (95 kalori)\n- 1 muz (105 kalori)\n- Bir avuç çilek veya üzüm\n- 1 portakal\n\n🥜 **Protein Snack:**\n- 30g fındık/badem (170 kalori)\n- 1 kase yoğurt + meyve\n- 2 yumurta\n- Protein bar\n\n🥕 **Düşük Kalorili:**\n- Havuç çubukları + humus\n- Salatalık dilimleri\n- Cherry domates\n- Çiğ brokoli`;
    } else if (lowerMessage.includes("makro") || lowerMessage.includes("karbonhidrat") || lowerMessage.includes("yağ")) {
      response = `Makro besin dengesi:\n\n📊 **Günlük Dağılım:**\n- **Protein:** %25-35 (kas koruma ve tokluk)\n- **Karbonhidrat:** %40-50 (enerji kaynağı)\n- **Yağ:** %20-30 (hormon dengesi)\n\n🎯 **Örnek Günlük Dağılım (2000 kcal):**\n- Protein: 125-175g (500-700 kcal)\n- Karb: 200-250g (800-1000 kcal)\n- Yağ: 45-65g (400-600 kcal)\n\n💡 **İpucu:** Aktif spor yapıyorsan protein ve karb oranını artırabilirsin!`;
    } else if (lowerMessage.includes("tarif") || lowerMessage.includes("yemek nasıl")) {
      response = `Basit ve sağlıklı tarif önerileri:\n\n🍳 **Omlet Bowl:**\n1. 3 yumurta çırp\n2. Az yağda pişir\n3. Sebze ekle (mantar, biber, domates)\n4. Peynir serp\n5. Tam buğday ekmekle servis et\n\n🥗 **Chicken Buddha Bowl:**\n1. Tavuk göğsünü ızgarada pişir\n2. Quinoa haşla\n3. Yeşillik, domates, salatalık ekle\n4. Avokado dilimle\n5. Zeytinyağı + limon sos\n\n🐟 **Fırın Somon:**\n1. Salmonu tuz, karabiber, limon ile marine et\n2. 180°C'de 15-20 dk pişir\n3. Buharda sebze hazırla\n4. Tatlı patates püresiile servis yap`;
    } else {
      response = `Sana yardımcı olmak isterim! İşte bazı konularda soru sorabilirsin:\n\n🍳 **Öğün Önerileri:**\n- "Kahvaltıda ne yiyebilirim?"\n- "Akşam yemeği önerisi"\n- "Öğle için hafif bir şey"\n\n💪 **Beslenme Tavsiyeleri:**\n- "Protein ihtiyacım nedir?"\n- "Nasıl kilo verebilirim?"\n- "Su ne kadar içmeliyim?"\n\n🥗 **Tarifler & Atıştırmalıklar:**\n- "Sağlıklı atıştırmalık önerileri"\n- "Basit yemek tarifleri"\n- "Makro dengesi nasıl olmalı?"\n\nİstediğin konuda detaylı bilgi alabılirsin!`;
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessageText = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Yeni konuşma başlatma (ilk mesaj ise)
      let convId = selectedConversation;
      
      if (!convId) {
        const convDoc = await addDoc(collection(db, "aiConversations"), {
          userId: user.uid,
          title: userMessageText.substring(0, 50) + (userMessageText.length > 50 ? "..." : ""),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        convId = convDoc.id;
        setSelectedConversation(convId);
      }

      // Kullanıcı mesajını veritabanına kaydetme
      await addDoc(collection(db, "aiMessages"), {
        conversationId: convId,
        userId: user.uid,
        role: "user",
        content: userMessageText,
        timestamp: Timestamp.now()
      });

      // Yerel state'e ekleme (hızlı gösterim için)
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: userMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // AI yanıtını oluşturma
      const aiResponseText = await generateAIResponse(userMessageText);
      
      // AI mesajını veritabanına kaydetme
      await addDoc(collection(db, "aiMessages"), {
        conversationId: convId,
        userId: user.uid,
        role: "assistant",
        content: aiResponseText,
        timestamp: Timestamp.now()
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadConversation = (convId) => {
    setSelectedConversation(convId);
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Merhaba! Ben senin yapay zeka destekli beslenme danışmanınım. 🥗\n\nSana özel beslenme tavsiyeleri, yemek önerileri ve sağlıklı yaşam ipuçları verebilirim. Nasıl yardımcı olabilirim?",
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const quickQuestions = [
    { icon: "🍳", text: "Kahvaltı önerisi" },
    { icon: "💪", text: "Protein ihtiyacım" },
    { icon: "📉", text: "Kilo verme stratejisi" },
    { icon: "🥗", text: "Akşam yemeği önerisi" },
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  return (
    <PlanAccess requiredPlan="premium">
      <div className="ai-consultant-container">
        <header className="ai-header">
          <div className="ai-header-content">
            <div className="ai-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="ai-info">
              <h1>AI Beslenme Danışmanı</h1>
              <p className="ai-status">
                <span className="status-dot"></span>
                Çevrimiçi
              </p>
            </div>
          </div>
          <div className="ai-header-actions">
            {profile && (
              <div className="user-context">
                <i className="fas fa-user-circle"></i>
                <span>{profile.name || "Kullanıcı"}</span>
              </div>
            )}
            <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
              <i className="fas fa-history"></i>
              Geçmiş ({conversations.length})
            </button>
            <button className="new-conv-btn" onClick={handleNewConversation}>
              <i className="fas fa-plus"></i>
              Yeni Sohbet
            </button>
          </div>
        </header>

        <div className="chat-wrapper">
          {/* Sohbet Geçmişi Paneli */}
          {showHistory && (
            <aside className="chat-history">
              <h3>Sohbet Geçmişi</h3>
              <div className="history-list">
                {conversations.length === 0 ? (
                  <p className="empty-history">Henüz sohbet kaydı yok</p>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      className={`history-item ${selectedConversation === conv.id ? 'active' : ''}`}
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      <div className="history-item-title">{conv.title}</div>
                      <div className="history-item-date">
                        {new Date(conv.createdAt.toDate()).toLocaleDateString('tr-TR')}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>
          )}

          {/* Ana Sohbet Alanı */}
          <div className="chat-container">
            <div className="messages-wrapper">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "assistant" ? (
                      <i className="fas fa-robot"></i>
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="quick-questions">
                <p className="quick-title">Hızlı Sorular:</p>
                <div className="quick-buttons">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="quick-btn"
                      onClick={() => handleQuickQuestion(q.text)}
                    >
                      <span className="quick-icon">{q.icon}</span>
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="chat-input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın... (Enter ile gönder)"
              rows="1"
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          <p className="input-note">
            <i className="fas fa-info-circle"></i>
            AI yanıtları bilgilendirme amaçlıdır. Ciddi sağlık sorunları için doktorunuza danışın.
          </p>
        </div>
      </div>
    </PlanAccess>
  );
}

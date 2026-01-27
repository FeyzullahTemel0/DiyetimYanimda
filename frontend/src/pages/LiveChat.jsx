import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import PlanAccess from "../components/PlanAccess";
import "./LiveChat.css";

export default function LiveChat() {
  const { user } = useAuth();
  const [dietitians, setDietitians] = useState([]);
  const [selectedDietitian, setSelectedDietitian] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Load available dietitians
  useEffect(() => {
    const loadDietitians = async () => {
      try {
        const q = query(collection(db, "dietitians"));
        const snapshot = await getDocs(q);
        const dietData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDietitians(dietData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dietitians:", error);
        // Set mock data for demo
        setDietitians(getMockDietitians());
        setLoading(false);
      }
    };

    loadDietitians();
  }, []);

  // Load messages for selected session
  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "liveChatMessages"),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start or continue chat with selected dietitian
  const handleSelectDietitian = async (dietitian) => {
    setSelectedDietitian(dietitian);

    // Check for existing session
    try {
      const q = query(
        collection(db, "liveChatSessions"),
        where("userId", "==", user.uid),
        where("dietitianId", "==", dietitian.id),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        setSessionId(snapshot.docs[0].id);
      } else {
        // Create new session
        const sessionDoc = await addDoc(
          collection(db, "liveChatSessions"),
          {
            userId: user.uid,
            dietitianId: dietitian.id,
            startedAt: Timestamp.now(),
            status: "active",
          }
        );
        setSessionId(sessionDoc.id);
      }
    } catch (error) {
      console.error("Error managing session:", error);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    try {
      await addDoc(collection(db, "liveChatMessages"), {
        sessionId: sessionId,
        senderId: user.uid,
        senderRole: "user",
        content: inputText,
        timestamp: Timestamp.now(),
      });

      setInputText("");

      // Simulate dietitian response after 2 seconds
      setTimeout(async () => {
        const response = await generateDietitianResponse(inputText);
        await addDoc(collection(db, "liveChatMessages"), {
          sessionId: sessionId,
          senderId: selectedDietitian.id,
          senderRole: "dietitian",
          content: response,
          timestamp: Timestamp.now(),
        });
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Close session
  const handleCloseSession = async () => {
    if (!sessionId) return;
    try {
      await updateDoc(doc(db, "liveChatSessions", sessionId), {
        status: "closed",
        endedAt: Timestamp.now(),
      });
      setSessionId(null);
      setSelectedDietitian(null);
      setMessages([]);
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  if (loading) {
    return (
      <PlanAccess requiredPlan="premium">
        <div className="live-chat-container">
          <div className="loading-state">Yükleniyor...</div>
        </div>
      </PlanAccess>
    );
  }

  if (selectedDietitian && sessionId) {
    return (
      <PlanAccess requiredPlan="premium">
        <div className="live-chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="dietitian-info-mini">
              <img
                src={selectedDietitian.avatar}
                alt={selectedDietitian.name}
                className="avatar-small"
              />
              <div className="info-text">
                <h3>{selectedDietitian.name}</h3>
                <div className="status-badge active">Çevrimiçi</div>
              </div>
            </div>
            <button
              className="btn-close-chat"
              onClick={handleCloseSession}
              title="Sohbeti Kapat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h3>Merhaba! 👋</h3>
                <p>{selectedDietitian.name} ile sohbete başlayın.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.senderRole === "user" ? "user-message" : "dietitian-message"
                }`}
              >
                {msg.senderRole === "dietitian" && (
                  <img
                    src={selectedDietitian.avatar}
                    alt="Avatar"
                    className="message-avatar"
                  />
                )}
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="message-input"
            />
            <button type="submit" className="btn-send">
              Gönder
            </button>
          </form>
        </div>
      </PlanAccess>
    );
  }

  return (
    <PlanAccess requiredPlan="premium">
      <div className="live-chat-container">
        {/* Header */}
        <div className="lc-header">
          <h1>Diyetisyen ile Canlı Sohbet</h1>
          <p>Deneyimli diyetisyenlerimizle gerçek zamanlı iletişim kurun</p>
        </div>

        {/* Dietitians Grid */}
        <div className="dietitians-grid">
          {dietitians.map((dietitian) => (
            <div key={dietitian.id} className="dietitian-card">
              <div className="card-header">
                <img
                  src={dietitian.avatar}
                  alt={dietitian.name}
                  className="dietitian-avatar"
                />
                <div
                  className={`status-indicator ${
                    dietitian.status === "online"
                      ? "online"
                      : dietitian.status === "busy"
                      ? "busy"
                      : "offline"
                  }`}
                />
              </div>

              <div className="card-body">
                <h3>{dietitian.name}</h3>
                <p className="specialty">{dietitian.specialty}</p>

                <div className="status-info">
                  <span className={`status-badge ${dietitian.status}`}>
                    {dietitian.status === "online"
                      ? "Çevrimiçi"
                      : dietitian.status === "busy"
                      ? "Meşgul"
                      : "Çevrimdışı"}
                  </span>
                  <span className="response-time">
                    ~{dietitian.responseTime}s yanıt
                  </span>
                </div>

                <div className="rating">
                  {"⭐".repeat(Math.floor(dietitian.rating))}
                  <span className="rating-text">({dietitian.rating})</span>
                </div>

                <div className="card-actions">
                  <button
                    className={`btn-start-chat ${
                      dietitian.status === "offline" ? "disabled" : ""
                    }`}
                    onClick={() => handleSelectDietitian(dietitian)}
                    disabled={dietitian.status === "offline"}
                  >
                    Sohbet Başlat
                  </button>
                  <button
                    className="btn-whatsapp"
                    onClick={() => setShowWhatsAppModal(true)}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>WhatsApp ile İletişim Kurun</h2>
              <p>Diyetisyenle WhatsApp üzerinden iletişim kurmak için tıklayın:</p>
              <div className="whatsapp-links">
                {dietitians.map((dietitian) => (
                  <a
                    key={dietitian.id}
                    href={`https://wa.me/${dietitian.whatsapp || "+905551234567"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-link"
                  >
                    <span>📱 {dietitian.name}</span>
                  </a>
                ))}
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setShowWhatsAppModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </PlanAccess>
  );
}

// Mock data for demo
function getMockDietitians() {
  return [
    {
      id: "dietitian1",
      name: "Dr. Ayşe Yılmaz",
      specialty: "Beslenme Uzmanı - Kilo Yönetimi",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse",
      status: "online",
      rating: 4.8,
      responseTime: 15,
      whatsapp: "+905551234567",
    },
    {
      id: "dietitian2",
      name: "Dr. Mehmet Kara",
      specialty: "Spor Beslenme Uzmanı",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet",
      status: "busy",
      rating: 4.9,
      responseTime: 30,
      whatsapp: "+905552345678",
    },
    {
      id: "dietitian3",
      name: "Dr. Fatma Gül",
      specialty: "Klinik Diyetisyen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatma",
      status: "online",
      rating: 4.7,
      responseTime: 10,
      whatsapp: "+905553456789",
    },
    {
      id: "dietitian4",
      name: "Dr. Can Demir",
      specialty: "Pediatrik Beslenme",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Can",
      status: "offline",
      rating: 4.6,
      responseTime: 25,
      whatsapp: "+905554567890",
    },
  ];
}

// Mock AI response generator for dietitian
async function generateDietitianResponse(userMessage) {
  const responses = {
    kalori: "Günlük kalori ihtiyacınız aktivite seviyenize ve vücut yapınıza göre değişir. Ortalama olarak 2000-2500 kalori önerilir.",
    beslenme:
      "Dengeli bir beslenme planı protein, karbonhidrat ve yağ dengesi içermeli. Ayrıca bol su içmek ve düzenli egzersiz önemlidir.",
    zayıflama:
      "Sürdürülebilir kilo kaybı için haftalık 500-700 kalori açığı hedefleyin. Hızlı diyetler genellikle işe yaramaz.",
    antrenman:
      "Yemeğinizi antrenmanın 1-2 saat öncesine planlayın. Hafif sindirilebilir karbonhidrat ve protein kombinasyonu ideal.",
    default:
      "İlginç bir soru. Bu konuda daha ayrıntılı bilgi almak için lütfen detayları paylaşın. Kişisel durumunuza göre daha iyi tavsiye verebilirim.",
  };

  const lowerMsg = userMessage.toLowerCase();
  for (const [key, value] of Object.entries(responses)) {
    if (lowerMsg.includes(key)) {
      return value;
    }
  }
  return responses.default;
}

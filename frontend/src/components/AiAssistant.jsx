import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useChatStore } from '../stores/chatStore';
import ReactMarkdown from 'react-markdown';
import './AiAssistant.css';

// İkonlar
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const AiAvatar = () => <div className="message-avatar ai">Aİ</div>;
const UserAvatar = ({ profile }) => <div className="message-avatar user">{(profile.name || '?').charAt(0)}</div>;

export default function AiAssistant({ profile }) {
  const { messages, isLoading, addMessage, setMessages, setIsLoading, clearChat } = useChatStore();
  const [input, setInput] = useState('');
  const [user] = useAuthState(auth);
  
  // --- KAYMA SORUNU İÇİN GÜNCELLENMİŞ REFLER ---
  const messagesContainerRef = useRef(null); // Sadece scroll olan div'i hedefler
  const inputRef = useRef(null); // Input alanını hedefler

  // --- KAYMAYI ENGELLEYEN YENİ useEffect ---
  useEffect(() => {
    // Bu fonksiyon, sadece .messages-container'ın scroll bar'ını en alta indirir.
    // Sayfanın genelini etkilemez.
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const { scrollHeight } = messagesContainerRef.current;
        messagesContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }
    };
    
    scrollToBottom();
  }, [messages, isLoading]); // Her yeni mesajda veya yüklenme durumunda çalışır

  // --- İLK AÇILIŞTAKİ KAYMAYI ÖNLEMEK İÇİN YENİ useEffect ---
  useEffect(() => {
    // Sekme değiştiğinde input alanına odaklanarak tarayıcının sayfayı kaydırmasını engelle.
    const focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
    }, 150); // Tarayıcının layout'u oturtması için küçük bir gecikme

    return () => clearTimeout(focusTimeout); // Cleanup
  }, []); // Boş dependency array, sadece bileşen ilk yüklendiğinde çalışır

  useEffect(() => {
    if (profile?.name && messages.length === 0) {
      const initialMessage = {
        sender: 'ai',
        text: `Merhaba ${profile.name}! Ben sizin kişisel diyet asistanınızım. Size nasıl yardımcı olabilirim?`
      };
      setMessages([initialMessage]);
    }
  }, [profile?.name, messages.length, setMessages]);

   const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;
    const userMessage = { sender: 'user', text: input };
    const currentInput = input;
    const updatedMessages = [...messages, userMessage];
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('http://localhost:5000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          message: currentInput,
          history: updatedMessages.slice(0, -1),
          profile: profile,
        }),
      });
      if (!res.ok) { throw new Error('Sunucudan bir hata alındı.'); }
      const data = await res.json();
      const aiResponse = { sender: 'ai', text: data.reply };
      addMessage(aiResponse);
    } catch (error) {
      addMessage({ sender: 'ai', text: `Üzgünüm, bir sorunla karşılaştım.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Sohbet geçmişini silmek istediğinize emin misiniz?")) {
      clearChat();
      const initialMessage = {
        sender: 'ai',
        text: `Merhaba ${profile.name}! Size nasıl yardımcı olabilirim?`
      };
      setMessages([initialMessage]);
    }
  };

  return (
    <section className="tab-section ai-assistant-tab">
      <div className="chat-header">
        <h3>Diyet Asistanım</h3>
        <button className="clear-chat-btn" onClick={handleClearChat} title="Sohbeti Temizle" type="button">
          <TrashIcon />
        </button>
      </div>
      <div className="chat-window">
        {/* BU DİV'E REF EKLENDİ */}
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              {msg.sender === 'ai' ? <AiAvatar /> : <UserAvatar profile={profile} />}
              <div className="message-bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper ai">
              <AiAvatar />
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          {/* ESKİ BOŞ REF DIV'İ SİLİNDİ */}
        </div>
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        {/* BU INPUT'A REF EKLENDİ */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Asistanına bir mesaj yaz..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          <SendIcon />
        </button>
      </form>
    </section>
  );
}
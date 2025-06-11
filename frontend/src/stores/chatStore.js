import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 'persist' middleware'i, state'in tarayıcının localStorage'ına kaydedilmesini sağlar.
// Bu sayede kullanıcı sayfayı yenilese bile sohbet geçmişi kaybolmaz!

export const useChatStore = create(
  persist(
    (set, get) => ({
      // State'ler
      messages: [],
      isLoading: false,

      // Actions (State'i değiştiren fonksiyonlar)
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },
      
      setMessages: (messages) => {
        set({ messages: messages });
      },

      setIsLoading: (loadingStatus) => {
        set({ isLoading: loadingStatus });
      },

      // İsteğe bağlı: Sohbeti temizlemek için bir fonksiyon
      clearChat: () => {
        set({ messages: [] });
      }
    }),
    {
      name: 'chat-storage', // localStorage'daki anahtarın adı
    }
  )
);
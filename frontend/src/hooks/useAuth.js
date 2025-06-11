// frontend/src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRef = doc(db, 'users', authUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            console.warn(`Firestore'da ${authUser.uid} için profil bulunamadı.`);
            setProfile(null); // veya varsayılan bir profil nesnesi
          }
        } catch (error) {
          console.error("Profil çekme hatası:", error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
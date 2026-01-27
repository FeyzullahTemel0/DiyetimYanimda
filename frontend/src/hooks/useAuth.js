// frontend/src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRef = doc(db, 'users', authUser.uid);
        try {
          // Token claims (including custom claim 'admin')
          let claimsAdmin = false;
          try {
            const idTokenResult = await authUser.getIdTokenResult(true);
            claimsAdmin = !!idTokenResult?.claims?.admin;
          } catch (e) {
            console.warn('ID token claims okunamadı:', e);
          }

          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            const roleAdmin = data?.role === 'admin';
            setIsAdmin(roleAdmin || claimsAdmin);
          } else {
            console.warn(`Firestore'da ${authUser.uid} için profil bulunamadı.`);
            setProfile(null); // veya varsayılan bir profil nesnesi
            setIsAdmin(claimsAdmin);
          }
        } catch (error) {
          console.error("Profil çekme hatası:", error);
          setProfile(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, profile, isAdmin, loading };
}
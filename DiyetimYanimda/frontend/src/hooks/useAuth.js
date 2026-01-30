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
        let profileData = null;
        let role = null;
        let claimsAdmin = false;
        try {
          // Token claims (including custom claim 'admin')
          try {
            const idTokenResult = await authUser.getIdTokenResult(true);
            claimsAdmin = !!idTokenResult?.claims?.admin;
          } catch (e) {
            console.warn('ID token claims okunamadı:', e);
          }

          // Önce users koleksiyonunda ara
          const userRef = doc(db, 'users', authUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            profileData = userSnap.data();
            role = profileData?.role || null;
          } else {
            // Eğer users'da yoksa dietitians koleksiyonunda ara
            const dietitianRef = doc(db, 'dietitians', authUser.uid);
            const dietitianSnap = await getDoc(dietitianRef);
            if (dietitianSnap.exists()) {
              profileData = dietitianSnap.data();
              role = 'dietitian';
            }
          }

          setProfile(profileData ? { ...profileData, role } : null);
          setIsAdmin(role === 'admin' || claimsAdmin);
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
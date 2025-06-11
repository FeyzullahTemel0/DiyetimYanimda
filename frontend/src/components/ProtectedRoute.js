// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Yüklenme bitene kadar bekle
    return <div>Yetkiler kontrol ediliyor...</div>;
  }

  if (!user) {
    // Giriş yapmamışsa, login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  // Giriş yapmışsa, istenen sayfayı göster
  return children;
}
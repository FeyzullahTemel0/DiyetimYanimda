// frontend/src/components/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Yetkiler kontrol ediliyor...</div>;
  }

  // Eğer profil yüklendiyse ve rol 'admin' ise, sayfayı göster
  if (profile && profile.role === 'admin') {
    return children;
  }
  
  // Aksi takdirde, ana sayfaya yönlendir
  return <Navigate to="/" replace />;
}
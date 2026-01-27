// frontend/src/components/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { profile, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Yetkiler kontrol ediliyor...</div>;
  }

  // Profil rolü 'admin' veya custom claim admin ise erişime izin ver
  if ((profile && profile.role === 'admin') || isAdmin) {
    return children;
  }
  
  // Aksi takdirde, ana sayfaya yönlendir
  return <Navigate to="/" replace />;
}
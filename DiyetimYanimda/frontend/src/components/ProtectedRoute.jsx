import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Yetkiler kontrol ediliyor...</div>;
  }

  // Sadece normal kullanıcıya izin ver
  if (profile && profile.role === 'user') {
    return children;
  }

  // Aksi takdirde, ana sayfaya yönlendir
  return <Navigate to="/" replace />;
}

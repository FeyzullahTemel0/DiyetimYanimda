import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DietitianRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Yetkiler kontrol ediliyor...</div>;
  }

  // Sadece diyetisyen rolüne izin ver
  if (profile && profile.role === 'dietitian') {
    return children;
  }

  // Aksi takdirde, ana sayfaya yönlendir
  return <Navigate to="/" replace />;
}

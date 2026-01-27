// frontend/src/components/SubscriptionRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './SubscriptionRoute.css'; // CSS'i ekliyoruz

export default function SubscriptionRoute({ children, allowedPlans = [] }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loader-container">
        <div className="auth-loader"></div>
        <p>Abonelik Kontrol Ediliyor...</p>
      </div>
    );
  }

  const userPlan = profile?.subscription?.plan;
  const isAllowed = userPlan && allowedPlans.includes(userPlan);

  if (isAllowed) {
    return children;
  }
  
  return (
    <Navigate 
      to="/pricing" 
      replace 
      state={{ 
        from: location, 
        message: "Bu özelliğe erişmek için üyeliğinizi yükseltmeniz gerekmektedir." 
      }} 
    />
  );
}
import React from 'react';
import './ModernSpinner.css';

export default function ModernSpinner({ text = 'Yükleniyor...' }) {
  return (
    <div className="modern-spinner-container">
      <div className="modern-spinner">
        <div className="dot dot1"></div>
        <div className="dot dot2"></div>
        <div className="dot dot3"></div>
      </div>
      <div className="modern-spinner-text">{text}</div>
    </div>
  );
}

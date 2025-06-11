import React from 'react';
import './Modal.css'; // Modal için CSS dosyası

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  // Modal dışına tıklandığında kapatma
  const handleOverlayClick = (e) => {
    // Sadece overlay'e (yani modal-content'in dışına) tıklandığında kapat
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div id="modal-overlay" className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
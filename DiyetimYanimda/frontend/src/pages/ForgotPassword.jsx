import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'
  const [resetLink, setResetLink] = useState(''); // Test modu için
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessageType('error');
      setMessage('Lütfen email adresinizi girin.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setResetLink('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Şifre sıfırlama linki email adresinize gönderilmiştir. Lütfen gelen kutunuzu kontrol edin.');
        setEmail('');
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessageType('error');
        setMessage(data.error || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Forgot password hatası:', error);
      setMessageType('error');
      setMessage('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Header */}
        <div className="forgot-password-header">
          <h1>🔐 Şifre Sıfırlama</h1>
          <p>Hesabınızın şifresini sıfırlamak için email adresinizi girin</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        {/* Test Modu Uyarısı */}
        {resetLink && (
          <div className="alert alert-info">
            <strong>🧪 TEST MODU:</strong>
            <p style={{marginTop: '10px', marginBottom: '10px'}}>
              Email servisi yapılandırılmamış. Aşağıdaki linki test etmek için kullanabilirsiniz:
            </p>
            <a href={resetLink} target="_blank" rel="noopener noreferrer" className="test-link">
              Reset Link'i Aç →
            </a>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">📧 Email Adresiniz</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={isLoading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Gönderiliyor...' : '📨 Sıfırlama Linki Gönder'}
          </button>
        </form>

        {/* Help Text */}
        <div className="help-text">
          <p>⏱️ Sıfırlama linki 1 saat için geçerlidir.</p>
          <p>📌 E-posta almazsan, spam klasörünü kontrol et.</p>
        </div>

        {/* Footer Links */}
        <div className="footer-links">
          <p>
            Şifrenizi hatırladınız mı? 
            <Link to="/login"> Giriş Yapın</Link>
          </p>
          <p>
            Hesabınız yok mu? 
            <Link to="/register"> Kaydol</Link>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decoration-circle decoration-1"></div>
      <div className="decoration-circle decoration-2"></div>
    </div>
  );
}

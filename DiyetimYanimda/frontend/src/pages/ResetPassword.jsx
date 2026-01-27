import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error'
  const [isValidToken, setIsValidToken] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Token ve email kontrolü
    if (!token || !email) {
      setIsValidToken(false);
      setMessageType('error');
      setMessage('❌ Geçersiz veya süresi dolmuş bağlantı. Lütfen yeni bir sıfırlama isteği gönderin.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasyon
    if (!newPassword || !confirmPassword) {
      setMessageType('error');
      setMessage('Lütfen şifreleri girin.');
      return;
    }

    if (newPassword.length < 6) {
      setMessageType('error');
      setMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('Şifreler eşleşmiyor. Lütfen kontrol edin.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          email, 
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Şifreniz başarıyla değiştirilmiştir! Yönetiliyorsunuz...');
        setNewPassword('');
        setConfirmPassword('');
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessageType('error');
        setMessage(data.error || 'Şifre sıfırlanamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Reset password hatası:', error);
      setMessageType('error');
      setMessage('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1>🔐 Şifre Sıfırlama</h1>
          </div>
          
          <div className="alert alert-error">
            {message}
          </div>

          <div className="footer-links" style={{ marginTop: '30px' }}>
            <p>
              <Link to="/forgot-password" className="retry-link">
                ← Yeni sıfırlama linki iste
              </Link>
            </p>
            <p>
              <Link to="/login" className="login-link">
                Giriş sayfasına dön →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        {/* Header */}
        <div className="reset-password-header">
          <h1>🔐 Yeni Şifre Belirle</h1>
          <p>Lütfen hesabınız için yeni bir şifre oluşturun</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password Field */}
          <div className="form-group">
            <label htmlFor="newPassword">🔑 Yeni Şifre</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <div className="password-strength">
              <span className={newPassword.length >= 6 ? 'strong' : 'weak'}>
                {newPassword.length >= 6 ? '✅ Yeterli uzunlukta' : '⚠️ En az 6 karakter'}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">✓ Şifreyi Onayla</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              disabled={isLoading}
              required
            />
            {confirmPassword && (
              <div className="confirm-status">
                {newPassword === confirmPassword ? (
                  <span className="match">✅ Şifreler eşleşiyor</span>
                ) : (
                  <span className="mismatch">❌ Şifreler eşleşmiyor</span>
                )}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="password-requirements">
            <p><strong>Şifre Gereksinimleri:</strong></p>
            <ul>
              <li className={newPassword.length >= 6 ? 'met' : ''}>
                ✓ En az 6 karakter
              </li>
              <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>
                ✓ En az 1 büyük harf
              </li>
              <li className={/[a-z]/.test(newPassword) ? 'met' : ''}>
                ✓ En az 1 küçük harf
              </li>
              <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>
                ✓ En az 1 rakam
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
          >
            {isLoading ? '⏳ İşleniyor...' : '🔐 Şifreyi Değiştir'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="footer-links">
          <p>
            Şifrenizi hatırladınız mı? 
            <Link to="/login"> Giriş Yapın</Link>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decoration-circle decoration-1"></div>
      <div className="decoration-circle decoration-2"></div>
    </div>
  );
}

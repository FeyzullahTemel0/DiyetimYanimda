
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import styles from './DietitianLogin.module.css';

export default function DietitianLogin() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const dietitianDoc = await getDoc(doc(db, 'dietitians', userCredential.user.uid));
      if (!dietitianDoc.exists()) {
        await auth.signOut();
        showToast('❌ Bu hesap diyetisyen hesabı değil', 'error');
        setLoading(false);
        return;
      }
      const dietitianData = dietitianDoc.data();
      if (!dietitianData.isActive) {
        await auth.signOut();
        showToast('❌ Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin', 'error');
        setLoading(false);
        return;
      }
      showToast('✅ Giriş başarılı!', 'success');
      navigate('/dietitian/panel');
    } catch (error) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/user-not-found') showToast('❌ Bu e-posta ile kayıtlı kullanıcı bulunamadı', 'error');
      else if (error.code === 'auth/wrong-password') showToast('❌ Hatalı şifre', 'error');
      else if (error.code === 'auth/invalid-email') showToast('❌ Geçersiz e-posta adresi', 'error');
      else showToast('❌ Giriş başarısız', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['diyetisyen-login-root']}>
      <div className={styles['diyetisyen-login-content']}>
        <div className={styles['diyetisyen-login-logo']}>
          <img src="/logo.png" alt="DiyetimYanımda Logo" />
          <h1>DiyetimYanımda</h1>
          <p>Profesyonel Diyetisyen Paneli</p>
        </div>
        <div className={styles['diyetisyen-login-form']}>
          <div className={styles['diyetisyen-login-form-box']}>
            <h2>👩‍⚕️ Diyetisyen Girişi</h2>
            <p>Diyetisyen hesabınızla giriş yapın</p>
            <form onSubmit={handleSubmit} autoComplete="on">
              <input
                type="email"
                name="email"
                placeholder="E-posta adresiniz"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
              <input
                type="password"
                name="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Giriş yapılıyor...' : '🔐 Giriş Yap'}
              </button>
            </form>
            <div className={styles['alt-link']}>
              Normal kullanıcı mısınız?{' '}
              <a href="/login">Buradan giriş yapın</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


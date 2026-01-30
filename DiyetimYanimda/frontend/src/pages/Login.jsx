import { useState } from "react";
// GÜNCELLENDİ: Google ile giriş için 'signInWithPopup' eklendi
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// GÜNCELLENDİ: Google Provider'ı 'firebase.js' dosyasından import ediyoruz
import { auth, googleProvider } from "../services/firebase.js";
import { useNavigate, Link } from "react-router-dom";
import { getApiUrl } from "../config/apiConfig";
import "./Login.css";

// İkonu tekrar ekliyorum, bir değişiklik yok
const GoogleIcon = () => <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.688,44,30.417,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // YENİ VE İYİLEŞTİRİLMİŞ: Başarılı giriş sonrası yapılacak ortak işlemler
  // Bu fonksiyon hem e-posta hem de Google girişi sonrası çağrılacak.
  const handleSuccessfulLogin = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(getApiUrl("/api/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return navigate("/", { replace: true });
      }
      const data = await res.json();

      if (data.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (data.role === "dietitian") {
        navigate("/dietitian/panel", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (apiError) {
      console.error("API Hatası:", apiError);
      // API'da sorun olsa bile kullanıcı giriş yaptı, ana sayfaya yönlendir.
      navigate("/", { replace: true });
    }
  };

  // E-posta ve şifre ile giriş (Artık daha temiz)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin();
    } catch (err) {
      let friendlyError = "Bir hata oluştu. Lütfen tekrar deneyin.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = "E-posta veya şifre hatalı. Lütfen kontrol ediniz.";
      }
      setError(friendlyError);
      setIsLoading(false);
    }
  };

  // YENİ: Google ile giriş fonksiyonu
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Giriş başarılı olduktan sonra ortak fonksiyonumuzu çağırıyoruz
      await handleSuccessfulLogin();
    } catch (err) {
      // Kullanıcı pop-up'ı kapatırsa hata göstermemesi için kontrol
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google ile giriş sırasında bir hata oluştu.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-info">
          <div className="info-content">
            <h1>Tekrar Hoş Geldin!</h1>
            <p>Dönüşüm yolculuğun seni bekliyor. Kaldığın yerden devam etmeye hazır mısın?</p>
          </div>
        </div>
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Hesabına Giriş Yap</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="input-group">
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder=" " />
              <label htmlFor="email">E-posta Adresin</label>
            </div>
            <div className="input-group">
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder=" " />
              <label htmlFor="password">Şifren</label>
            </div>
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
            <div className="forgot-password-link">
              <Link to="/forgot-password">🔐 Şifremi Unuttum?</Link>
            </div>
            <div className="separator"><span>veya</span></div>
            <div className="social-logins">
              {/* GÜNCELLENDİ: Butona onClick ve disabled özellikleri eklendi */}
              <button
                type="button"
                className="social-btn google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon />
                Google ile Giriş Yap
              </button>
            </div>
            <p className="switch-auth">
              Hesabın yok mu? <Link to="/register">Hemen oluştur</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
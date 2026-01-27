// frontend/src/pages/Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { useToastContext } from "../contexts/ToastContext";
import "./Register.css";

const GoogleIcon = () => <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.688,44,30.417,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>;

export default function Register() {
  // GÜNCELLENDİ: state'e tüm alanları geri ekledik
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    gender: "female", // Varsayılan bir değer atamak iyi bir pratiktir
    height: "",
    weight: "",
    targetWeight: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // E-posta ile kayıt
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // GÜNCELLENDİ: form state'inin tamamını gönderiyoruz
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");
      
      showToast('Kayıt başarılı! Giriş yapabilirsiniz ✅', 'success');
      navigate("/login");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Google ile kayıt
  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/auth/google-sync", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Google ile sunucu senkronizasyonu başarısız.");
      
      // Google ile kayıttan sonra Profil Tamamlama sayfasına yönlendirebiliriz.
      // Çünkü boy, kilo gibi bilgiler eksik kalacak.
      showToast('Google ile başarıyla kayıt oldunuz! Profilinizi tamamlayın 🎉', 'success');
      navigate("/profile"); // veya "/profil-tamamla" gibi özel bir sayfaya

    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google ile kayıt sırasında bir hata oluştu.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-info">
            <div className="info-content">
                <h1>Aramıza Katıl!</h1>
                <p>Kişiselleştirilmiş sağlık yolculuğuna ilk adımını at. Saniyeler içinde ücretsiz hesabını oluştur.</p>
            </div>
        </div>
        <div className="register-form-container">
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>Yeni Hesap Oluştur</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-row">
                <div className="input-group">
                    <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder=" "/>
                    <label htmlFor="name">Adın</label>
                </div>
                <div className="input-group">
                    <input id="surname" name="surname" type="text" value={form.surname} onChange={handleChange} required placeholder=" "/>
                    <label htmlFor="surname">Soyadın</label>
                </div>
            </div>

            <div className="input-group">
              <label htmlFor="gender" className="static-label">Cinsiyet</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
              </select>
            </div>
            
            <div className="input-row">
                <div className="input-group">
                    <input id="height" name="height" type="number" value={form.height} onChange={handleChange} required placeholder=" "/>
                    <label htmlFor="height">Boy (cm)</label>
                </div>
                <div className="input-group">
                    <input id="weight" name="weight" type="number" value={form.weight} onChange={handleChange} required placeholder=" "/>
                    <label htmlFor="weight">Kilo (kg)</label>
                </div>
                <div className="input-group">
                    <input id="targetWeight" name="targetWeight" type="number" value={form.targetWeight} onChange={handleChange} required placeholder=" "/>
                    <label htmlFor="targetWeight">Hedef Kilo (kg)</label>
                </div>
            </div>

            <div className="input-group">
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder=" "/>
                <label htmlFor="email">E-posta Adresin</label>
            </div>
            <div className="input-group">
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder=" "/>
                <label htmlFor="password">Şifren (en az 6 karakter)</label>
            </div>
            
            <button type="submit" className="btn-register" disabled={isLoading}>
              {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesabımı Oluştur'}
            </button>
            
            <div className="separator"><span>veya</span></div>

            <button type="button" className="social-btn google" onClick={handleGoogleRegister} disabled={isLoading}>
                <GoogleIcon />
                Google ile Devam Et
            </button>

            <p className="switch-auth">
              Zaten bir hesabın var mı? <Link to="/login">Giriş yap</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
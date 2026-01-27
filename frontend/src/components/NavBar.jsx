// frontend/src/components/NavBar.jsx

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase'; // Firebase config dosyanızın yolu
import { doc, getDoc } from 'firebase/firestore';
import NotificationBell from './NotificationBell';
import './NavBar.css';

// İkonlar
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function NavBar() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Navigasyon linkleri (hizmet sayfaları navbar'da görünmez)
  const navLinks = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/diet-programs", label: "Programlar" },
    { to: "/pricing", label: "Fiyatlandırma" },
    { to: "/motivation", label: "Motivasyon" },
    { to: "/about-contact", label: "Hakkımızda" },
  ];

  // Sayfa kaydırıldığında navbar'a arkaplan ekleme
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kullanıcının admin olup olmadığını kontrol et
  useEffect(() => {
    if (user) {
      const checkAdminStatus = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().role === 'admin');
          }
        } catch (error) {
          console.log('Admin durumu kontrol edilemedi:', error);
        }
      };
      checkAdminStatus();
    }
  }, [user]);

  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false); // Menüyü kapat
    navigate('/'); // Ana sayfaya yönlendir
  };

  // Linke tıklandığında mobil menüyü kapat
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      {isMenuOpen && (
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu} />
      )}
      <div className="navbar-container">
        {/* Marka Logosu ve Adı */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <h1>DiyetimYanımda</h1>
        </Link>

        {/* Mobil Menü Butonu */}
        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Navigasyon Menüsü */}
        <nav className={`navbar-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className="nav-link" onClick={closeMenu}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {user && !loading && (
              <div className="navbar-notif">
                <NotificationBell />
              </div>
            )}

            {/* Kullanıcı Durumuna Göre Butonlar */}
            <div className="navbar-auth">
              {loading ? (
                <div className="nav-link-placeholder"></div> // Yüklenirken boşluk bırak
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link to="/dashboard" className="btn-nav btn-admin" onClick={closeMenu}>
                      🔧 Yönetim
                    </Link>
                  )}
                  <Link to="/profile" className="btn-nav btn-secondary" onClick={closeMenu}>Profil</Link>
                  <button onClick={handleLogout} className="btn-nav btn-logout">Çıkış Yap</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-nav btn-secondary" onClick={closeMenu}>Giriş Yap</Link>
                  <Link to="/register" className="btn-nav btn-primary" onClick={closeMenu}>Kayıt Ol</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
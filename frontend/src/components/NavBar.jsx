// frontend/src/components/NavBar.jsx

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Firebase config dosyanızın yolu
import './NavBar.css';

// İkonlar
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const BrandLogo = () => <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="#2ecc71" d="M228.4,79.9,148.2,3.3a23.9,23.9,0,0,0-40.4,0L27.6,79.9A24.2,24.2,0,0,0,20,97.7V192a24,24,0,0,0,24,24H212a24,24,0,0,0,24-24V97.7A24.2,24.2,0,0,0,228.4,79.9Zm-3.5,14.6-26,45.1a8,8,0,0,1-13.8,0L159,94.5a8,8,0,0,0-13.8,0l-16.4,28.5a8,8,0,0,1-13.7,0L98.6,94.5a8,8,0,0,0-13.8,0L58.9,139.6a8,8,0,0,1-13.8,0L28.5,94.5,128,15.8l99.9,78.7Z"/></svg>

export default function NavBar() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigasyon linkleri
const navLinks = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/diet-programs", label: "Programlar" },
  { to: "/pricing", label: "Fiyatlandırma" }, // YENİ LİNK
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
      <div className="navbar-container">
        {/* Marka Logosu ve Adı */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <BrandLogo />
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

          {/* Kullanıcı Durumuna Göre Butonlar */}
          <div className="navbar-auth">
            {loading ? (
              <div className="nav-link-placeholder"></div> // Yüklenirken boşluk bırak
            ) : user ? (
              <>
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
        </nav>
      </div>
    </header>
  );
}
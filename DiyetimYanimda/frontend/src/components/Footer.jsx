import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ compact }) {
  return (
    <footer className={`site-footer${compact ? ' footer--compact' : ''}`}>
      <div className="footer-top">
        <div className="footer-section">
          <h4>Hızlı Linkler</h4>
          <ul>
            <li><Link to="/">Ana Sayfa</Link></li>
            <li><Link to="/pricing">Planlar</Link></li>
            <li><Link to="/faq">SSS</Link></li>
            <li><Link to="/contact">İletişim</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Şirket</h4>
          <ul>
            <li><Link to="/terms">Kullanım Şartları</Link></li>
            <li><Link to="/privacy">Gizlilik Politikası</Link></li>
            <li><Link to="/kvkk">KVKK Aydınlatma Metni</Link></li>
            <li><Link to="/security">Güvenlik Politikası</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>İletişim</h4>
          <p>info@dietapp.com</p>
          <p>Muğla, Türkiye</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DietApp. Tüm Hakları Saklıdır.</p>
        <p>KVKK ve güvenlik politikalarımız hakkında detaylı bilgiye yukarıdan ulaşabilirsiniz.</p>
      </div>
    </footer>
  );
}

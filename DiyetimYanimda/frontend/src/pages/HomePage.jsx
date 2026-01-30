import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import "./HomePage.css";

export default function HomePage() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({ users: 0, plusUsers: 0 });
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();

  // Sayıların dinamik olarak artması efekti
  useEffect(() => {
    const userTarget = 1950;
    const plusTarget = 1250;
    let userCurrent = 0;
    let plusCurrent = 0;

    const interval = setInterval(() => {
      let changed = false;
      if (userCurrent < userTarget) {
        userCurrent = Math.min(userCurrent + 25, userTarget);
        changed = true;
      }
      if (plusCurrent < plusTarget) {
        plusCurrent = Math.min(plusCurrent + 15, plusTarget);
        changed = true;
      }
      setStats({ users: userCurrent, plusUsers: plusCurrent });

      if (!changed) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Son buton click handler
  const handleCtaButtonClick = async (e) => {
    e.preventDefault();

    if (!user) {
      // Kullanıcı giriş yapmamış → kayıt formuna git
      navigate('/register');
      return;
    }

    // Kullanıcı giriş yapmış, database'de kontrol et
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Kayıt olmamış → kayıt formuna git
        navigate('/register');
      } else {
        // Kayıt yapmış → profile git
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      // Hata durumunda profile'a yönlendir
      navigate('/profile');
    }
  };

  const faqs = [
    { q: "15 günlük ücretsiz deneme süreci nasıl işliyor?", a: "Kayıt olduğunuz andan itibaren 15 gün boyunca tüm Plus+ özelliklerine hiçbir kısıtlama olmadan erişebilirsiniz. Süre sonunda memnun kalırsanız üyeliğinizi devam ettirebilirsiniz." },
    { q: "Planımı istediğim zaman iptal edebilir miyim?", a: "Evet, üyeliğinizi dilediğiniz zaman tek bir tıkla, hiçbir ek ücret ödemeden profil sayfanızdan iptal edebilirsiniz." },
    { q: "Diyetisyenle görüşmeler nasıl yapılıyor?", a: "Plus+ ve Premium üyelerimiz, panel üzerinden kendilerine uygun saatler için haftalık birebir online video görüşme randevusu oluşturabilirler." },
    { q: "Bu sistem benim için uygun mu?", a: 'Aşağıdaki "Bu Program Kimin İçin?" bölümümüzü inceleyerek sistemimizin hedeflerinize ne kadar uygun olduğunu görebilirsiniz.' },
  ];

  return (
    <div className="home-container">

      {/* Hero Bölümü */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Hayalindeki Vücuda <span>Bizimle</span> Ulaş.</h1>
          <p className="hero-subtitle">
            Sadece bir diyet listesi değil; kişiye özel planlar, psikolojik destek ve sürdürülebilir alışkanlıklarla dolu bir yaşam tarzı dönüşümü sunuyoruz.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary">
                  15 Günlük Ücretsiz Denemeyi Başlat 🚀
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Giriş Yap
                </Link>
                <Link to="/dietitian/login" className="btn btn-secondary">
                  🏥 Diyetisyen Girişi
                </Link>
              </>
            ) : (
              <Link to="/profile" className="btn btn-primary">
                Panelime Git ✨
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <img src="/logo.png" alt="DiyetimYanımda Logo" />
        </div>
      </section>

      {/* İstatistikler Bölümü */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>{stats.users.toLocaleString()}+</h3>
          <p>Mutlu Kullanıcı</p>
        </div>
        <div className="stat-card">
          <h3>{stats.plusUsers.toLocaleString()}+</h3>
          <p>Plus+ Üye</p>
        </div>
        <div className="stat-card">
          <h3>98%</h3>
          <p>Memnuniyet Oranı</p>
        </div>
      </section>

      {/* Neden Biz? / Özellikler Bölümü */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Neden Biz?</span>
          <h2>Sıradan Diyetlerin Ötesinde</h2>
          <p>Başarınız için bilimi, teknolojiyi ve insan dokunuşunu bir araya getirdik.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Kişiye Özel Planlama</h3>
            <p>Yaşam tarzınıza, hedeflerinize ve tercihlerinize %100 uyumlu, sürdürülebilir beslenme ve egzersiz programları.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👩‍⚕️</div>
            <h3>Uzman Desteği</h3>
            <p>Deneyimli diyetisyen ve psikologlarımızla düzenli görüşmelerle motivasyonunuzu her zaman yüksek tutun.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <h3>Psikolojik Motivasyon</h3>
            <p>Yeme alışkanlıklarınızın ardındaki nedenleri anlayın ve "duygusal yeme" gibi engelleri kalıcı olarak aşın.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <h3>Akıllı Takip</h3>
            <p>Gelişiminizi interaktif grafiklerle takip edin, başarılarınızı görün ve bir sonraki adıma güvenle ilerleyin.</p>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır? Bölümü */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-tag">Yol Haritası</span>
          <h2>4 Adımda Dönüşüme Başla</h2>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <h4>Kayıt Ol ve Hedefini Belirle</h4>
            <p>Birkaç basit adımla profilini oluştur ve bize hayallerinden bahset.</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h4>Uzmanımızla Tanış</h4>
            <p>Sana özel atanan diyetisyeninle ilk online görüşmeni yap ve yol haritanı çiz.</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h4>Programını Uygula</h4>
            <p>Mobil uyumlu panelinden günlük planlarını takip et, 7/24 destek al.</p>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <h4>Sonuçları Kutla!</h4>
            <p>Haftalık raporlar ve görüşmelerle ilerlemeni gör, başarılarını birlikte kutlayalım.</p>
          </div>
        </div>
      </section>
      
      {/* YENİ BÖLÜM: Bu Program Kimin İçin? */}
      <section className="who-is-it-for-section">
        <div className="section-header">
            <span className="section-tag">Size Özel</span>
            <h2>Bu Program Kimin İçin?</h2>
        </div>
        <div className="persona-grid">
            <div className="persona-card">
                <h4>Yoğun Çalışan Profesyoneller</h4>
                <p>Kısıtlı zamanda pratik, sağlıklı ve enerjinizi yüksek tutacak çözümler arayanlar.</p>
            </div>
            <div className="persona-card">
                <h4>Yeni Başlayanlar</h4>
                <p>Nereden başlayacağını bilemeyen, bilgi kirliliğinden bunalmış ve güvenilir bir rehber arayanlar.</p>
            </div>
            <div className="persona-card">
                <h4>Sporcular ve Aktif Bireyler</h4>
                <p>Performansını artırmak, kas kütlesi kazanmak veya yağ oranını düşürmek için beslenmesini optimize etmek isteyenler.</p>
            </div>
        </div>
      </section>

      {/* Başarı Hikayeleri Bölümü - Gerçek Kullanıcılar */}
      <section className="success-stories-preview">
        <div className="section-header">
          <span className="section-tag">Gerçek Sonuçlar</span>
          <h2>Onlar Başardı, Sıra Sende!</h2>
          <p>Binlerce kullanıcımız hedeflerine ulaştı. Sen de onlardan biri olabilirsin!</p>
        </div>
        
        <div className="success-stats">
          <div className="success-stat-item">
            <div className="stat-icon">🎯</div>
            <h3>3,850+</h3>
            <p>Başarılı Dönüşüm</p>
          </div>
          <div className="success-stat-item">
            <div className="stat-icon">⚖️</div>
            <h3>42,000+ KG</h3>
            <p>Toplam Kaybedilen Ağırlık</p>
          </div>
          <div className="success-stat-item">
            <div className="stat-icon">⭐</div>
            <h3>4.9/5</h3>
            <p>Ortalama Kullanıcı Puanı</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/success-stories" className="btn btn-primary btn-large">
            🌟 Başarı Hikayelerini Keşfet
          </Link>
        </div>
      </section>

      {/* Değer Teklifi ve Güven İnşası */}
      <section className="value-proposition-section">
        <div className="section-header">
          <span className="section-tag">Neden DiyetimYanımda?</span>
          <h2>Başarınız İçin Her Şey Düşünüldü</h2>
        </div>
        
        <div className="value-grid">
          <div className="value-card">
            <div className="value-icon">🔬</div>
            <h4>Bilimsel Yaklaşım</h4>
            <p>Güncel beslenme bilimi ve araştırmalar ışığında hazırlanan, kişiye özel programlar.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">👨‍⚕️</div>
            <h4>Uzman Kadro</h4>
            <p>10+ yıl deneyimli diyetisyen ve psikologlardan oluşan profesyonel ekip.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💪</div>
            <h4>Sürdürülebilir Sonuçlar</h4>
            <p>Hızlı değil, kalıcı çözümler. Yaşam tarzı değişimi odaklı yaklaşım.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h4>7/24 Destek</h4>
            <p>Yolculuğunuzda hiç yalnız değilsiniz. Her an yanınızdayız.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">📱</div>
            <h4>Teknoloji Entegrasyonu</h4>
            <p>Kullanıcı dostu uygulama ile takip kolay, sonuçlar net.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🎁</div>
            <h4>15 Gün Ücretsiz</h4>
            <p>Risk almadan tüm özellikleri deneyin, memnun kalın sonra karar verin.</p>
          </div>
        </div>
      </section>


      {/* SSS Bölümü */}
      <section className="faq-section">
        <div className="section-header">
          <span className="section-tag">Sorularınız</span>
          <h2>Aklınızda Soru Kalmasın</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <div
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{f.q}</span>
                <span className={`faq-toggle ${openFaq === i ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* YENİ BÖLÜM: Son Çağrı (CTA) */}
      <section className="final-cta-section">
        <h2>Değişime Hazır Mısın?</h2>
        <p>Ertelemeyi bırak. Kendine yapacağın en büyük iyilik için ilk adımı bugün at. <br/>15 günlük ücretsiz deneme ile hiçbir risk almadan aramıza katıl.</p>
        <button 
          onClick={handleCtaButtonClick}
          className="btn btn-primary btn-large"
        >
            Yolculuğuma Şimdi Başlıyorum!
        </button>
      </section>


    </div>
  );
}
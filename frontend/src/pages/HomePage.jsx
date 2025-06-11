import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase"; // Firebase dosyanızın yolunu doğrulayın
import { useState, useEffect } from "react";
import "./HomePage.css";

// İkonları ve görselleri import etmek en iyi pratiktir,
// ancak kolaylık olması için URL veya emoji kullanacağız.
import heroImageUrl from '../styles/karsilama.jpg'; // Kendi resim yolunuzu buraya yazın veya aşağıdakini kullanın

export default function HomePage() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({ users: 0, plusUsers: 0 });
  const [openFaq, setOpenFaq] = useState(null);

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
              </>
            ) : (
              <Link to="/profile" className="btn btn-primary">
                Panelime Git ✨
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          {/* Kendi görselinizi kullanmak için src'yi değiştirin: src={heroImageUrl} */}
          <img src={heroImageUrl} alt="Karşılama Resmi" />
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

      {/* Başarı Hikayeleri Bölümü */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-tag">Gerçek Sonuçlar</span>
          <h2>Onlar Başardı, Sıra Sende!</h2>
        </div>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <img src="https://randomuser.me/api/portraits/women/11.jpg" alt="Ayşe K." />
            <p>"Defalarca tek başıma denedim ama hep yarım kaldı. Buradaki uzman desteği ve topluluk hissi her şeyi değiştirdi. 3 ayda 12 kilo verdim!"</p>
            <h4>— Ayşe K.</h4>
            <span>Plus+ Üye</span>
          </div>
          <div className="testimonial-card">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Mehmet T." />
            <p>"Sadece kilo vermek değil, doğru beslenmeyi öğrendim. Enerjim o kadar arttı ki, artık spor yapmak bir zorunluluk değil, bir keyif."</p>
            <h4>— Mehmet T.</h4>
            <span>Premium Üye</span>
          </div>
          <div className="testimonial-card">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Elif S." />
            <p>"Psikolojik destek seansları benim için bir dönüm noktası oldu. Yeme ataklarımın üstesinden geldim. Teşekkürler!"</p>
            <h4>— Elif S.</h4>
            <span>Premium Üye</span>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma Bölümü */}
      <section className="pricing-section">
        <div className="section-header">
          <span className="section-tag">Yatırım Yap</span>
          <h2>Kendin İçin En İyisini Seç</h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Standart</h3>
            <p className="price"><span>149</span>₺/ay</p>
            <ul>
              <li>✓ Kişiye Özel Beslenme Planı</li>
              <li>✓ Akıllı İlerleme Takibi</li>
              <li>✓ E-posta ile Destek</li>
              <li> </li>
            </ul>
            <Link to="/register" className="btn btn-secondary">Planı Seç</Link>
          </div>
          <div className="pricing-card popular">
            <span className="popular-tag">En Popüler</span>
            <h3>Plus+</h3>
            <p className="price"><span>299</span>₺/ay</p>
            <ul>
              <li>✓ Kişiye Özel Beslenme Planı</li>
              <li>✓ Haftalık 1:1 Diyetisyen Görüşmesi</li>
              <li>✓ 7/24 Anlık Mesajlaşma Desteği</li>
              <li>✓ Kişiye Özel Egzersiz Önerileri</li>
            </ul>
            <Link to="/register" className="btn btn-primary">Ücretsiz Dene</Link>
          </div>
          <div className="pricing-card">
            <h3>Premium</h3>
            <p className="price"><span>499</span>₺/ay</p>
            <ul>
              <li>✓ Tüm Plus+ Özellikleri</li>
              <li>✓ Haftalık Psikolojik Destek Seansı</li>
              <li>✓ Aylık Canlı Grup Antrenmanı</li>
              <li>✓ Öncelikli Destek Hattı</li>
            </ul>
            <Link to="/register" className="btn btn-secondary">Planı Seç</Link>
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
        <Link to="/register" className="btn btn-primary btn-large">
            Yolculuğuma Şimdi Başlıyorum!
        </Link>
      </section>


    </div>
  );
}
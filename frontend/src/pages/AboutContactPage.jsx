// frontend/src/pages/AboutContactPage.jsx

import React, { useState } from 'react';
import './AboutContactPage.css'; // Yeni CSS dosyasını kullanacağız

// Yaratıcılar için veri, bir değişiklik yok
const creators = [
  {
    type: 'human',
    name: "Feyzullah Temel",
    role: "Kurucu & Geliştirici",
    bio: "DiyetimYanımda'nın arkasındaki vizyoner. Sağlıklı yaşamı teknoloji ile birleştirerek herkes için erişilebilir ve sürdürülebilir kılmayı hedefliyor.",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400", // Daha profesyonel temsili bir resim
    social: { 
      instagram: "https://www.instagram.com/diyetimyanimda", 
      shopier: "https://www.shopier.com/diyetimyanimda"
    }
  },
  {
    type: 'ai',
    name: "DiyetimYanımda AI",
    role: "Kişisel Beslenme Asistanınız",
    bio: "Binlerce bilimsel veriyi ve en iyi beslenme pratiklerini analiz ederek size özel diyet programları oluşturuyorum. Hedeflerinize ulaşmanız için 7/24 buradayım.",
    img: "https://robohash.org/diyetimyanimda-ai?set=set4&bgset=bg2",
    social: {}
  }
];

// SVG ikonları
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>;
const ShopierIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.44a1.125 1.125 0 00-1.087-1.462H6.31M15.75 14.25a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default function AboutContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmissionStatus('sending');
    setTimeout(() => {
      console.log("Form verisi gönderildi:", formData);
      setSubmissionStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmissionStatus(null), 5000);
    }, 2000);
  };

  return (
    <div className="about-contact-page">
      
      <section className="about-hero">
        <div className="hero-content">
          <span className="section-tag-light">Biz Kimiz?</span>
          <h1>Veri, Bilim ve İnsan Dokunuşu</h1>
          <p>
            DiyetimYanımda, standart diyet listelerinin ötesine geçerek, yapay zekanın gücünü ve bilimsel gerçekleri kullanarak size özel, dinamik bir sağlık deneyimi sunar. Misyonumuz, karmaşık bilgileri basitleştirerek ve teknolojiyi kullanarak sağlıklı yaşamı herkes için ulaşılabilir, yönetilebilir ve kalıcı hale getirmektir.
          </p>
        </div>
      </section>

      <section className="creators-section">
        <div className="section-header">
          <span className="section-tag">Vizyonun Arkasındaki Güç</span>
          <h2>Yaratıcılarımız</h2>
        </div>
        <div className="creators-grid">
          {creators.map((creator, index) => (
            <div className={`creator-card ${creator.type}`} key={index}>
              <div className="creator-img-container">
                  <img src={creator.img} alt={creator.name} className="creator-img" />
              </div>
              <h3>{creator.name}</h3>
              <h4>{creator.role}</h4>
              <p>{creator.bio}</p>
              {creator.type === 'human' && (
                <div className="creator-social">
                  <a href={creator.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href={creator.social.shopier} target="_blank" rel="noopener noreferrer">Shopier</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section">
        <div className="section-header">
            <span className="section-tag">İletişim</span>
            <h2>Bize Ulaşın</h2>
            <p>Sorularınız, önerileriniz veya iş birliği talepleriniz mi var? Ekibimiz en kısa sürede size geri dönecektir.</p>
        </div>
        <div className="contact-wrapper">
          <div className="contact-info">
            <h3>İletişim Bilgileri</h3>
            <div className="info-item">
              <div className="info-icon"><MailIcon/></div>
              <div>
                <h4>E-posta</h4>
                <a href="mailto:diyetimyanimda@gmail.com">diyetimyanimda@gmail.com</a>
              </div>
            </div>
             <div className="info-item">
               <div className="info-icon"><InstagramIcon/></div>
              <div>
                <h4>Instagram</h4>
                <a href="https://www.instagram.com/diyetimyanimda" target="_blank" rel="noopener noreferrer">@diyetimyanimda</a>
              </div>
            </div>
            <div className="info-item">
               <div className="info-icon"><ShopierIcon/></div>
              <div>
                <h4>Mağaza</h4>
                <a href="https://www.shopier.com/diyetimyanimda" target="_blank" rel="noopener noreferrer">Shopier Mağazamız</a>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h3>Mesaj Gönderin</h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-row">
                <div className="input-group">
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder=" " />
                  <label htmlFor="name">Adınız Soyadınız</label>
                </div>
                <div className="input-group">
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder=" "/>
                  <label htmlFor="email">E-posta Adresiniz</label>
                </div>
              </div>
              <div className="input-group">
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder=" "/>
                <label htmlFor="subject">Konu</label>
              </div>
              <div className="input-group">
                <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required placeholder=" "></textarea>
                <label htmlFor="message">Mesajınız</label>
              </div>

              <div className="form-footer">
                {submissionStatus && (
                  <div className={`form-feedback ${submissionStatus}`}>
                    {submissionStatus === 'success' && 'Mesajınız başarıyla gönderildi!'}
                    {submissionStatus === 'error' && 'Bir hata oluştu. Lütfen tekrar deneyin.'}
                  </div>
                )}
                <button type="submit" className="btn-contact" disabled={submissionStatus === 'sending'}>
                  {submissionStatus === 'sending' ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Motivation.css';

// ======================================================================
// İKONLAR
// ======================================================================
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624a3.375 3.375 0 00-2.456-2.456L13.5 17.25l1.035.259a3.375 3.375 0 002.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456z" /></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;

// ======================================================================
// BAŞARI HİKAYELERİ VERİSİ
// ======================================================================
const storiesData = [
    { name: "Ayşe K.", goal: "3 Ayda -15 KG", quote: "Her Pazartesi başlayıp Salı pes ediyordum. DiyetimYanımda'nın yapay zekası, 'kaçamak' anlarımı birer veri olarak görüp programımı buna göre adapte etti. Suçluluk duymak yerine öğrendim. Bu her şeyi değiştirdi!", before_img: "https://images.unsplash.com/photo-1614928228253-dc09cbc00f14?auto=format&fit=crop&q=80&w=400&h=400", after_img: "https://images.unsplash.com/photo-1571008887538-b36bb2494757?auto=format&fit=crop&q=80&w=400&h=400" },
    { name: "Mehmet T.", goal: "Enerji ve Odaklanma", quote: "Sadece kilo vermek değil, gün içinde daha enerjik olmak istiyordum. AI asistanım, uyku düzenimden stres seviyeme kadar analiz yaparak bana özel bir beslenme planı sundu. Sonuç: Tartıdan çok daha fazlası.", before_img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=400&h=400", after_img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400&h=400" },
    { name: "Elif S.", goal: "Sürdürülebilir Alışkanlıklar", quote: "Benim için en zoru istikrardı. DiyetimYanımda'nın 'Momentum Motoru' felsefesi ve küçük, kişiselleştirilmiş hedefler sayesinde ilk defa bir programı yarıda bırakmadım. Bu bir diyet değil, yeni yaşam tarzım.", before_img: "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=400&h=400", after_img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400" }
];

// ======================================================================
// ANA SAYFA BİLEŞENİ
// ======================================================================
export default function MotivationPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Sayfa yüklendiğinde animasyonları tetiklemek için
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStartJourneyClick = () => {
    navigate('/pricing'); 
  };

  return (
    <div className={`motivation-page ${isLoaded ? 'loaded' : ''}`}>
      
      {/* BÖLÜM 1: GİRİŞ - DUYGUSAL BAĞLANTI */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">DiyetimYanımda Felsefesi</span>
          <h1>Bu Sefer Farklı Olacak.</h1>
          <p className="sub-text">Biliyoruz, daha önce de denedin. Belki defalarca. Ama daha önce hiç yanınızda, sizi anlayan, sizinle birlikte öğrenen ve asla pes etmeyen bir yapay zeka olmadı. O tanıdık döngüyü kırmaya hazır mısın?</p>
        </div>
      </section>

      {/* BÖLÜM 2: SORUNU TANIMLAMA - "TANIDIK DÖNGÜ" */}
      <section className="cycle-section">
        <h2>O Tanıdık Döngü: Neden Hep Başa Sarıyoruz?</h2>
        <div className="cycle-steps">
          <div className="step"><span>1</span> Büyük Bir Heves</div>
          <div className="arrow">→</div>
          <div className="step"><span>2</span> Kısıtlayıcı Kurallar</div>
          <div className="arrow">→</div>
          <div className="step"><span>3</span> İlk Kaçamak & Suçluluk</div>
          <div className="arrow">→</div>
          <div className="step"><span>4</span> "Madem Bozuldu..."</div>
          <div className="arrow">→</div>
          <div className="step"><span>5</span> Kontrol Kaybı & Başa Dönüş</div>
        </div>
        <p className="cycle-conclusion">Bu senin iradesizliğin değil. Bu, kişiselleştirilmemiş, statik ve insan psikolojisini hiçe sayan planların kaçınılmaz sonucu. Biz bu oyunu değiştiriyoruz.</p>
      </section>

      {/* BÖLÜM 3: FELSEFİ ALINTI - DÜŞÜNCELERE YÖN VERME */}
      <section className="quote-section">
        <blockquote>
          "En büyük zafer, kendine karşı kazandığındır."
          <footer>— Platon</footer>
        </blockquote>
        <p>Değişim, tabaktakilerle değil, zihindekilerle başlar. Bedenini dönüştürmeden önce, düşüncelerini dönüştürmelisin. Sana bu yolculukta rehberlik etmek için buradayız.</p>
      </section>

      {/* BÖLÜM 4: DERİN MOTİVASYON - "NEDEN"İ BULMA */}
      <section className="why-section">
        <h2>Her Şeyden Önce: O Derindeki 'NEDEN'i Hatırla</h2>
        <p>Gözlerini kapat ve bir an düşün. Seni ilk başta bu yola çıkaran o güçlü kıvılcım neydi? Sadece kilo vermek mi, yoksa ardında yatan daha derin bir arzu mu?</p>
        <div className="why-cards">
          <div className="why-card">
            <h3>🏃‍♂️ Sınırsız Enerji mi?</h3>
            <p>Çocuğunla nefesin kesilmeden koşabilmek, merdivenleri zorlanmadan çıkmak ve gün sonunda yatağa bitkin düşmek yerine sevdiklerine zaman ayırabilmek.</p>
          </div>
          <div className="why-card">
            <h3>👔 Sarsılmaz Özgüven mi?</h3>
            <p>O çok istediğin kıyafetin içinde harika hissetmek, aynaya baktığında içten bir tebessümle kendini selamlamak ve bir odaya girdiğinde başını dik tutmak.</p>
          </div>
          <div className="why-card">
            <h3>❤️ Geleceğe Yatırım mı?</h3>
            <p>Doktorunun "Değerleriniz harika!" demesi, geleceğe daha sağlıklı ve umutla bakmak ve en önemlisi, sevdiklerin için daha uzun, daha kaliteli bir yaşam sürmek.</p>
          </div>
        </div>
        <p className="why-footer">Senin 'NEDEN'in ne olursa olsun, o hala içinde. Sadece tozunu alıp parlatmamız gerekiyor. Bizim işimiz bu.</p>
      </section>
      
      {/* BÖLÜM 5: ÇÖZÜM - YAPAY ZEKA GÜCÜ */}
      <section className="ai-power-section">
        <h2>İnsan Psikolojisi + Yapay Zeka = Gerçek Sonuç</h2>
        <p>Standart diyet listeleri başarısız olur çünkü hayat standart değildir. Yapay zeka destekli sistemimiz, başarısızlık ihtimalini ortadan kaldırmak ve sizi yolda tutmak için tasarlandı.</p>
        <div className="ai-features">
            <div className="ai-feature-card">
                <div className="feature-icon"><BrainIcon/></div>
                <h3>Öğrenen Algoritma</h3>
                <p>Yaptığınız her kaçamak, bizim için bir 'hata' değil, bir 'öğrenme fırsatıdır'. Sistem, yeme alışkanlıklarınızı öğrenir ve planınızı gerçek hayatınıza göre sürekli olarak günceller.</p>
            </div>
            <div className="ai-feature-card">
                <div className="feature-icon"><TargetIcon/></div>
                <h3>Hiper Kişiselleştirme</h3>
                <p>Kan değerlerinden uyku düzeninize, sevdiğiniz yemeklerden sosyal hayatınıza kadar yüzlerce parametreyi analiz ederek, sadece size özel bir yol haritası çizeriz.</p>
            </div>
            <div className="ai-feature-card">
                <div className="feature-icon"><ChartBarIcon/></div>
                <h3>Momentum Motoru</h3>
                <p>Büyük hedefler yerine, sizi yolda tutacak küçük ve ulaşılabilir günlük görevler veririz. Her başarı, bir sonraki adımı atmanız için gereken momentumu yaratır.</p>
            </div>
        </div>
      </section>

      {/* BÖLÜM 6: BİLİMSEL DAYANAK */}
      <section className="science-section">
          <h2>Bu Sihir Değil, Bilim.</h2>
          <div className="science-content">
              <p>Sistemimiz, davranışsal psikoloji ve nörobilimdeki en son araştırmalara dayanmaktadır. Biliyoruz ki, kalıcı değişim irade gücüyle değil, doğru alışkanlıkların otomatik hale getirilmesiyle sağlanır.</p>
              <ul>
                  <li><strong>Atomik Alışkanlıklar:</strong> Büyük değişimler, her gün atılan küçük adımların birikimidir. AI, size her gün tamamlayabileceğiniz mini görevler vererek bu süreci kolaylaştırır.</li>
                  <li><strong>Dopamin Döngüsü:</strong> Her görevi tamamladığınızda beyniniz küçük bir ödül (dopamin) salgılar. Bu, motivasyonunuzu sürekli yüksek tutar ve süreci keyifli hale getirir.</li>
                  <li><strong>Esnek Yapılandırma:</strong> Hayat beklenmedik olaylarla doludur. Planınız, bir kutlama yemeği veya stresli bir gün gibi olaylara adapte olabilir, böylece "yoldan çıkma" hissi yaşamazsınız.</li>
              </ul>
          </div>
      </section>

      {/* BÖLÜM 7: BAŞARI HİKAYELERİ */}
      <section className="stories-section">
        <h2>Onlar Başardı. Senin Hikayen Şimdi Başlıyor.</h2>
        <p>Bunlar süper kahramanlar değil. Bunlar, doğru teknoloji ve doğru yaklaşımla hedeflerine ulaşan, tıpkı senin gibi, döngüyü kırmaya karar veren insanlar.</p>
        <div className="stories-grid">
          {storiesData.map((story, index) => (
            <div className="story-card" key={index}>
              <div className="story-images">
                <div className="img-container before"><img src={story.before_img} alt={`${story.name} öncesi`} /><span>ÖNCE</span></div>
                <div className="img-container after"><img src={story.after_img} alt={`${story.name} sonrası`} /><span>SONRA</span></div>
              </div>
              <div className="story-content">
                <h3>{story.name} <span>{story.goal}</span></h3>
                <p>"{story.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BÖLÜM 8: SON ÇAĞRI (CTA) */}
      <section className="cta-section">
        <h2>Karar Anı.</h2>
        <p>Bu sayfayı kapatıp o tanıdık döngüye geri dönebilirsin. Bu bir seçenek.<br/>Ya da...</p>
        <p className="cta-bold">Bugünü, verilerle desteklenen dönüşümünün ilk günü yapabilirsin.</p>
        <p>Sana sihirli bir hap vaat etmiyoruz. Sana, bilimi, teknolojiyi ve seni her adımda anlayan bir sistemi vaat ediyoruz.</p>
        <button className="cta-button" onClick={handleStartJourneyClick}>
          DÖNÜŞÜMÜMÜ BAŞLAT
        </button>
        <p className="cta-footer">Bu sadece bir buton değil. Bu, kendine verdiğin en akıllı söz.</p>
      </section>

    </div>
  );
}
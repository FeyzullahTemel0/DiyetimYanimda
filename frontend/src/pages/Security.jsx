import React from "react";

export default function Security() {
  return (
    <div className="policy-page">
      <h1>Güvenlik Politikası</h1>
      <p>DietApp olarak kullanıcı verilerini korumak ve sistem güvenliğini sağlamak için aşağıdaki teknik ve idari tedbirleri alıyoruz.</p>
      
      <h2>1. Teknik Tedbirler</h2>
      <ul>
        <li>Veri iletimi: Tüm trafiğimiz SSL/TLS ile şifrelenir (HTTPS).</li>
        <li>Veri depolama: Firebase’de veri, dinamik anahtarlarla güvenli biçimde saklanır.</li>
        <li>Erişim kontrolü: Rol-bazlı erişim ve güçlü parola politikası uygulanır.</li>
        <li>Güncelleme ve yama yönetimi: Sunucu ve bağımlılıklar düzenli güncellenir.</li>
        <li>DDoS & WAF: Saldırılara karşı WAF ve DDoS koruması kullanılır.</li>
      </ul>
      
      <h2>2. İdari Tedbirler</h2>
      <ul>
        <li>Gizlilik eğitimi: Tüm personel KVKK ve veri güvenliği konusunda eğitilir.</li>
        <li>Politika ve prosedürler: Veri işleme süreçleri dokümante edilmiştir.</li>
        <li>Denetim: Düzenli iç ve dış denetimler yapılmaktadır.</li>
        <li>İhlal yönetimi: Güvenlik ihlali durumunda hızlı bildirim ve müdahale.</li>
      </ul>
      
      <h2>3. İzleme ve Uyarı Sistemleri</h2>
      <p>Gerçek zamanlı loglama ve izleme araçları ile anormal aktiviteler tespit edilir, güvenlik ekiplerine otomatik uyarılar iletilir.</p>
      
      <h2>4. İletişim</h2>
      <p>Güvenlik konularındaki her türlü sorunuz için security@dietapp.com adresinden bize ulaşabilirsiniz.</p>
    </div>
  );
}

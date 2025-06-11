import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <h1>Gizlilik Politikası</h1>
      <p>DietApp (“biz”, “Hizmet”) kişisel verilerinizi korumayı taahhüt eder. Bu politika hangi verileri topladığımızı ve nasıl kullandığımızı açıklar.</p>
      
      <h2>1. Toplanan Veriler</h2>
      <ul>
        <li>Hesap bilgileri: İsim, soyisim, e-posta, şifre (hash’lenmiş).</li>
        <li>Profil bilgileri: Boy, kilo, hedef kilo ve sağlık geçmişi.</li>
        <li>İletişim verileri: Mesajlar, form doldurma içerikleri.</li>
        <li>Teknik veriler: IP adresi, tarayıcı türü, cihaz bilgisi.</li>
      </ul>
      
      <h2>2. Kullanım Amaçları</h2>
      <ul>
        <li>Hizmet sunumu ve üyelik yönetimi.</li>
        <li>Kişiselleştirilmiş diyet önerileri hazırlanması.</li>
        <li>Destek ve iletişim.</li>
        <li>Gizlilik ve güvenlik önlemleri.</li>
      </ul>
      
      <h2>3. Çerezler (Cookies)</h2>
      <p>Oturum takibi ve performans analitiği için çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>
      
      <h2>4. Üçüncü Taraf Hizmet Sağlayıcılar</h2>
      <p>Firebase, Google Analytics gibi üçüncü taraflar veri işleyici olarak görev alır. Gizlilik politikalarını ilgili sağlayıcıların sitelerinden inceleyebilirsiniz.</p>
      
      <h2>5. Veri Saklama Süresi</h2>
      <p>Kullanıcı verilerini hizmet süresi boyunca ve yasa gerektirdiği sürece saklarız.</p>
      
      <h2>6. Kullanıcı Hakları</h2>
      <ul>
        <li>Veri erişim, düzeltme, silme talep hakkı.</li>
        <li>Veri taşınabilirliği hakkı.</li>
        <li>Rızayı geri çekme hakkı.</li>
      </ul>
    </div>
  );
}

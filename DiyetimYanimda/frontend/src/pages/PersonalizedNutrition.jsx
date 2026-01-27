import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function PersonalizedNutrition() {
  return (
    <PlanAccess requiredPlan="basic">
      {(profile) => (
        <div className="service-page">
          <header className="service-header">
            <h1>Kişiselleştirilmiş Beslenme Önerileri</h1>
            <p>Temel plan ve üzeri kullanıcılar için kişisel hedeflere uygun beslenme önerileri.</p>
          </header>
          <section className="service-card">
            <h2>Profil Bilgileriniz</h2>
            <p>Ad Soyad: {profile?.name} {profile?.surname}</p>
            <p>Hedef Kilo: {profile?.targetWeight ? `${profile.targetWeight} kg` : "Belirtilmedi"}</p>
            <p>Mevcut Kilo: {profile?.weight ? `${profile.weight} kg` : "Belirtilmedi"}</p>
            <div className="service-note">Öneriler dinamik değildir; demo amaçlı statik içerik.</div>
          </section>
          <section className="service-card">
            <h2>Örnek Öneriler</h2>
            <ul className="service-list">
              <li>Günlük 3 ana, 2 ara öğün planı</li>
              <li>Protein ağırlıklı kahvaltı (yumurta, peynir, tam buğday ekmeği)</li>
              <li>Öğle: Izgara tavuk + bol salata + yoğurt</li>
              <li>Akşam: Izgara balık + sebze sote</li>
              <li>Ara öğün: Badem, fındık, meyve</li>
            </ul>
          </section>
        </div>
      )}
    </PlanAccess>
  );
}

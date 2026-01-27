import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function SpecialProtocols() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Özel Beslenme Protokolleri (Yenileme, Bulk vb)</h1>
          <p>Plus kullanıcıları için özel protokoller (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnekler</h2>
          <ul className="service-list">
            <li>Refeed haftası planı</li>
            <li>Bulk dönem makro dağılımı</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}

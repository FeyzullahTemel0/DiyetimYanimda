import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function KetoVeganPlans() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Keto / Vegan / Gluten-Free Özel Planlar</h1>
          <p>Plus kullanıcıları için özel beslenme protokolleri (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Planlar</h2>
          <ul className="service-list">
            <li>Keto 1800 kcal</li>
            <li>Vegan 2000 kcal</li>
            <li>Gluten-Free 1900 kcal</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}

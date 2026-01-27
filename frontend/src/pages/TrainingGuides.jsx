import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function TrainingGuides() {
  return (
    <PlanAccess requiredPlan="plus">
      <div className="service-page">
        <header className="service-header">
          <h1>Yaş/Cinsiyet/Hedef Bazlı Antrenman Rehberleri</h1>
          <p>Plus kullanıcıları için antrenman rehberi (demo).</p>
        </header>
        <section className="service-card">
          <h2>Örnek Rehber</h2>
          <ul className="service-list">
            <li>Haftada 3 gün kuvvet + 2 gün kardiyo</li>
            <li>Isınma, ana set, soğuma önerileri</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}

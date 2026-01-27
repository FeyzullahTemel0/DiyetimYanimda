import React from "react";
import PlanAccess from "../components/PlanAccess";
import "./ServicePages.css";

export default function HabitBuilder() {
  return (
    <PlanAccess requiredPlan="premium">
      <div className="service-page">
        <header className="service-header">
          <h1>Alışkanlık Geliştirme Programları</h1>
          <p>Premium ve üzeri için habit tracker demo.</p>
        </header>
        <section className="service-card">
          <h2>Örnek Hedefler</h2>
          <ul className="service-list">
            <li>Günlük 10.000 adım</li>
            <li>Günde 2L su</li>
            <li>Haftada 3 kez kardiyo</li>
          </ul>
        </section>
      </div>
    </PlanAccess>
  );
}

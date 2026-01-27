// frontend/src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ active, activeTab, onSelect }) {
  const current = activeTab || active;
  return (
    <nav className="sidebar">
      <ul>
        <li style={{ fontSize: "0.9rem", color: "#2dd4bf", padding: "1rem", fontWeight: "700" }}>
          🔧 YÖNETİM PANELİ
        </li>
        
        <li className={current === "admin-programs" ? "active" : ""}>
          <Link to="/admin/programs" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            📋 Program Yönetimi
          </Link>
        </li>
        <li className={current === "admin-quotes" ? "active" : ""}>
          <Link to="/admin/quotes" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            💡 Söz Yönetimi
          </Link>
        </li>
        <li className={current === "admin-users" ? "active" : ""}>
          <Link to="/admin/users" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            👥 Kullanıcı Yönetimi
          </Link>
        </li>
        <li className={current === "admin-pricing" ? "active" : ""}>
          <Link to="/admin/pricing" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            💰 Fiyatlandırma
          </Link>
        </li>
        
        <li style={{ fontSize: "0.9rem", color: "#2dd4bf", padding: "1rem", fontWeight: "700", marginTop: "1rem" }}>
          📧 İÇERİK YÖNETİMİ
        </li>
        
        <li className={current === "nutrition-tips" ? "active" : ""}>
          <Link to="/admin/nutrition-tips" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            📧 Beslenme İpuçları
          </Link>
        </li>

        <li className={current === "admin-recipes" ? "active" : ""}>
          <Link to="/admin/recipes" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            🍽️ Tarif Yönetimi
          </Link>
        </li>

        <li className={current === "admin-habits" ? "active" : ""}>
          <Link to="/admin/habits" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            🧭 Alışkanlık Programları
          </Link>
        </li>
      </ul>
    </nav>
  );
}

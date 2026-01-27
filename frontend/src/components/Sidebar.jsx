// frontend/src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      <ul>
        <li style={{ fontSize: "0.9rem", color: "#2dd4bf", padding: "1rem", fontWeight: "700" }}>
          🔧 YÖNETİM PANELİ
        </li>
        
        <li
          className={active === "admin-programs" ? "active" : ""}
          onClick={() => onSelect("admin-programs")}
        >
          📋 Program Yönetimi
        </li>
        <li
          className={active === "admin-quotes" ? "active" : ""}
          onClick={() => onSelect("admin-quotes")}
        >
          💡 Söz Yönetimi
        </li>
        <li
          className={active === "admin-users" ? "active" : ""}
          onClick={() => onSelect("admin-users")}
        >
          👥 Kullanıcı Yönetimi
        </li>
        <li
          className={active === "admin-pricing" ? "active" : ""}
          onClick={() => onSelect("admin-pricing")}
        >
          💰 Fiyatlandırma
        </li>
        
        <li style={{ fontSize: "0.9rem", color: "#2dd4bf", padding: "1rem", fontWeight: "700", marginTop: "1rem" }}>
          📧 İÇERİK YÖNETİMİ
        </li>
        
        <li>
          <Link to="/admin/nutrition-tips" style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}>
            📧 Beslenme İpuçları
          </Link>
        </li>
      </ul>
    </nav>
  );
}

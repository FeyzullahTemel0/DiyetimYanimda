// frontend/src/components/Sidebar.jsx
import React from "react";
import "./Sidebar.css";

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      <ul>
        <li className={active === "profile" ? "active" : ""} onClick={() => onSelect("profile")}>
          Profil
        </li>
        <li className={active === "payment" ? "active" : ""} onClick={() => onSelect("payment")}>
          Ödeme
        </li>
        <li className={active === "request" ? "active" : ""} onClick={() => onSelect("request")}>
          Hizmet Talebi
        </li>
        <li className={active === "users" ? "active" : ""} onClick={() => onSelect("users")}>
          Kullanıcılar
        </li>
        {/* Yeni eklenen bölümler */}
        <li
          className={active === "programs-male" ? "active" : ""}
          onClick={() => onSelect("programs-male")}
        >
          Diyet Programları (Erkek)
        </li>
        <li
          className={active === "programs-female" ? "active" : ""}
          onClick={() => onSelect("programs-female")}
        >
          Diyet Programları (Kadın)
        </li>
      </ul>
    </nav>
  );
}

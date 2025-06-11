// frontend/src/components/Header.jsx
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ userEmail }) {
  const nav = useNavigate();
  const logout = async () => {
    await auth.signOut();
    nav("/login");
  };

  return (
    <header className="header">
      <div className="header__logo">🥗 DietApp</div>
      <div className="header__user">
        <span>{userEmail}</span>
        <button onClick={logout}>Çıkış</button>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useToastContext } from "../contexts/ToastContext";
import "./AdminPanel.css";
import Dashboard from "./Dashboard";

export default function AdminPrograms() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return navigate("/");
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await res.json();
        if (profile.role !== "admin") return navigate("/");
      } catch (err) {
        console.error("Admin kontrolü hatası:", err);
        navigate("/");
      }
    };
    checkAdmin();
  }, [navigate]);

  // Dashboard'u activeTab'ı "admin-programs" olarak render et
  return <Dashboard initialTab="admin-programs" />;
}

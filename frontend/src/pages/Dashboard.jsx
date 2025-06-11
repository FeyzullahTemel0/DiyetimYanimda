import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProfileInfo from "../components/ProfileInfo";
import PaymentStatus from "../components/PaymentStatus";
import ServiceRequest from "../components/ServiceRequest";
import UserList from "../components/UserList";
import UserDetail from "../components/UserDetail";
import ProgramList from "./ProgramList"; 
// DİKKAT: ProgramForm'u components klasöründen import etmek daha standart bir yaklaşımdır.
// Eğer dosya yolu farklıysa, kendi projenize göre düzeltin.
import ProgramForm from "../pages/ProgramForm";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedUid, setSelectedUid] = useState(null);
  const [programToEdit, setProgramToEdit] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Profil yüklenemedi.");
        setProfile(await res.json());
      } catch (error) {
        console.error("Profil yükleme hatası:", error);
      }
    };
    if (auth.currentUser) {
      fetchProfile();
    }
  }, []);

  if (!profile) return <div className="loading">Yükleniyor…</div>;

  const handleTabSelect = (key) => {
    setSelectedUid(null);
    setProgramToEdit(null);
    setActiveTab(key);
  };
  
  // Form başarıyla kaydedildiğinde veya iptal edildiğinde listeye geri dön.
  const handleFormDone = () => {
    setProgramToEdit(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileInfo data={profile} />;
      case "payment":
        return <PaymentStatus subscription={{ plan: "Aylık", lastPayment: "2025-06-05" }} />;
      case "request":
        return <ServiceRequest />;
      case "users":
        return selectedUid ? (
          <UserDetail uid={selectedUid} onBack={() => setSelectedUid(null)} />
        ) : (
          <UserList onUserSelect={setSelectedUid} />
        );

      // DİKKAT: Prop ismi 'initialData' olarak düzeltildi ve onSuccess/onCancel eklendi.
      case "programs-male":
        return programToEdit ? (
          <ProgramForm
            initialData={programToEdit}
            onSuccess={handleFormDone}
            onCancel={handleFormDone}
          />
        ) : (
          <ProgramList gender="male" onEdit={setProgramToEdit} />
        );

      case "programs-female":
        return programToEdit ? (
          <ProgramForm
            initialData={programToEdit}
            onSuccess={handleFormDone}
            onCancel={handleFormDone}
          />
        ) : (
          <ProgramList gender="female" onEdit={setProgramToEdit} />
        );
        
      default:
        return <div>Geçersiz sekme seçildi.</div>;
    }
  };

  return (
    <div className="dashboard">
      <Header userEmail={profile.email} />
      <div className="dashboard__body">
        <Sidebar active={activeTab} onSelect={handleTabSelect} />
        <main className="dashboard__main">{renderContent()}</main>
      </div>
    </div>
  );
}
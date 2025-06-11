// frontend/src/services/programService.js

import { auth } from "./firebase";

// .env.local dosyasını kullanmak en iyisidir, ama şimdilik doğrudan yazalım.
const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı girişi yapılmamış.");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const fetchPrograms = async (gender) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/diet-programs?gender=${gender}`, { headers });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Programlar alınamadı`);
  }
  return response.json();
};

export const deleteProgram = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/diet-programs/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Silme işlemi başarısız`);
  }
  return { success: true, message: "Program başarıyla silindi." };
};
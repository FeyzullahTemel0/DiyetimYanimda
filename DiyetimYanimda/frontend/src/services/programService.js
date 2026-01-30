// frontend/src/services/programService.js


import { API_BASE } from '../config/apiConfig';
import { auth } from "./firebase";

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
  const response = await fetch(`${API_BASE}/admin/diet-programs?gender=${gender}`, { headers });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Programlar alınamadı`);
  }
  return response.json();
};

export const deleteProgram = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/admin/diet-programs/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Silme işlemi başarısız`);
  }
  return { success: true, message: "Program başarıyla silindi." };
};
// frontend/src/config/apiConfig.js
// Centralized API configuration that respects environment variables

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const API_BASE = BACKEND_URL;

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${path}`;
};

export default {
  BACKEND_URL,
  API_BASE,
  getApiUrl,
};

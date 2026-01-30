// frontend/src/services/recipeService.js

import { API_BASE } from '../config/apiConfig';
import { auth } from './firebase';

// Tarifler listesini getir
export const getRecipes = async (category = null, filters = {}) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    let url = `${API_BASE}/recipes`;
    const params = new URLSearchParams();
    
    if (category && category !== 'tümü') {
      params.append('category', category);
    }
    if (filters.vegan) params.append('vegan', 'true');
    if (filters.glutenFree) params.append('glutenFree', 'true');
    if (filters.dairyFree) params.append('dairyFree', 'true');
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Tarifler yüklenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Tarif listesi hatası:', error);
    throw error;
  }
};

// Belirtilen ID'li tarifin detaylarını getir
export const getRecipeDetail = async (recipeId) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Tarif detayı yüklenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Tarif detay hatası:', error);
    throw error;
  }
};

// Tarifin favori olmasını işle
export const toggleFavoriteRecipe = async (recipeId, isFavorite) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const method = isFavorite ? 'DELETE' : 'POST';
    
    const response = await fetch(`${API_BASE}/recipes/${recipeId}/favorite`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Favori işlemi başarısız');
    }

    return await response.json();
  } catch (error) {
    console.error('Favori işlemi hatası:', error);
    throw error;
  }
};

// Kullanıcının favori tariflerini getir
export const getFavoriteRecipes = async () => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/recipes/user/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Favori tarifler yüklenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('Favori tarifler hatası:', error);
    throw error;
  }
};

// Özelleştirilmiş tarif önerileri getir
export const getRecipeSuggestions = async (targetCalories, dietType, allergies = []) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/recipes/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetCalories,
        dietType,
        allergies
      })
    });

    if (!response.ok) {
      throw new Error('Tarif önerileri alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Tarif önerileri hatası:', error);
    throw error;
  }
};

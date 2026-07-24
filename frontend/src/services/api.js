import axios from 'axios';

// Backend Base URL configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Automatic Token Injection Fix)
API.interceptors.request.use((config) => {
  // Check for 'access_token' first, then fallback to 'token'
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Textile Inventory & Waste Management Endpoints ---
export const inventoryService = {
  // 1. Fetch All Batches (GET)
  getInventory: async () => {
    const response = await API.get('/auth/inventory/');
    return response.data;
  },

  // 2. Register New Waste Batch (POST)
  registerWaste: async (data) => {
    const response = await API.post('/auth/inventory/', data);
    return response.data;
  },

  // 3. Update Existing Batch (PUT)
  updateInventory: async (id, data) => {
    const response = await API.put(`/auth/inventory/${id}`, data);
    return response.data;
  },

  // 4. Delete Batch (DELETE)
  deleteInventory: async (id) => {
    const response = await API.delete(`/auth/inventory/${id}`);
    return response.data;
  }
};

// --- 📊 AI Analytics & Vision Engine Endpoints ---
export const analyticsService = {
  // 1. Material Sustainability Assessment (POST)
  assessMaterialSustainability: async (payload) => {
    try {
      const response = await API.post('/auth/analytics/assess', payload);
      return response.data;
    } catch (error) {
      console.error("Error in Material Sustainability Assessment:", error);
      throw error;
    }
  },

  // 2. Upload Textile Image to Vision Pipeline (POST)
  uploadTextileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/auth/analytics/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in Vision Pipeline Upload:", error);
      throw error;
    }
  }
};

// 🎯 CRITICAL FIX: Default Export for API instance
export default API;
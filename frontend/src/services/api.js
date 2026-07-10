import axios from 'axios';

// Backend Base URL configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Automatic Token Injection)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
    // Path updated to match unified backend auth prefix
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

export default API;
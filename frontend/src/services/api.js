import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
};

export const inventoryService = {
  getInventory: async () => {
    const response = await API.get('/inventory/');
    return response.data;
  },
  registerWaste: async (data) => {
    // Exact matching POST endpoint for FastAPI backend
    const response = await API.post('/inventory/', data);
    return response.data;
  },
  updateInventory: async (id, data) => {
    const response = await API.put(`/inventory/${id}`, data);
    return response.data;
  },
  deleteInventory: async (id) => {
    const response = await API.delete(`/inventory/${id}`);
    return response.data;
  },
};

export const analyticsService = {
  assessMaterialSustainability: async (payload) => {
    const response = await API.post('/analytics/assess', payload);
    return response.data;
  },
  uploadTextileImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post('/analytics/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const sustainabilityService = {
  getDataset: async (limit = 20) => {
    const response = await API.get(`/sustainability/?limit=${limit}`);
    return response.data;
  },
};

// ==========================================
// 👑 ADMIN DASHBOARD SERVICES
// ==========================================
export const adminService = {
  getUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },
  updateUserRole: async (userId, newRole) => {
    const response = await API.put(`/admin/users/${userId}/role?new_role=${newRole}`);
    return response.data;
  },
  getSystemHealth: async () => {
    const response = await API.get('/admin/system-health');
    return response.data;
  },
  downloadExcelReport: async () => {
    const response = await API.get('/admin/export/excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sustainability_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  downloadPdfReport: async () => {
    const response = await API.get('/admin/export/pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sustainability_Report.txt');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default API;
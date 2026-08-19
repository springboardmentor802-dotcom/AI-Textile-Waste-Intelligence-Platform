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

  register: async (emailOrData, password, role) => {
    const payload = typeof emailOrData === 'object' 
      ? emailOrData 
      : { email: emailOrData, password, role };

    const response = await API.post('/auth/register', payload);
    return response.data;
  },
};

export const inventoryService = {
  getInventory: async () => {
    const response = await API.get('/inventory/');
    return response.data;
  },
  registerWaste: async (data) => {
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
  
  uploadTextileImage: async (file, isBatch = false, batchWeight = 100) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const timestamp = new Date().getTime();
    const response = await API.post(
      `/analytics/upload-image?is_batch=${isBatch}&batch_weight=${batchWeight}&t=${timestamp}`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // 📊 Live Platform Scan Logs Fetcher
  getScans: async (timeFrame = 'all_time') => {
    const response = await API.get(`/analytics/scans?time_frame=${timeFrame}`);
    return response.data;
  },

  // 📦 Material Recovery Yield Reports Fetcher
  getMaterialRecoveryReports: async () => {
    const response = await API.get('/analytics/material-recovery-reports');
    return response.data;
  },

  // 📄 Multi-Engine PDF Download Helper
  downloadMultiEnginePdf: async (payload) => {
    const response = await API.post('/analytics/export-multi-engine-pdf', payload, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Textile_Intelligence_Report_${payload.batch_id || 'SCAN'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
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
  createUser: async (userData) => {
    const response = await API.post('/admin/users', userData);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
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
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sustainability_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadPdfReport: async () => {
    const response = await API.get('/admin/export/pdf', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sustainability_Inventory_Summary.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default API;
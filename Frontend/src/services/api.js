const API_BASE_URL = 'http://localhost:8000';

export async function registerUser(fullName, email, password) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      password: password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed');
  }
  return data;
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

export async function getAdminData() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/admin-only`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Access denied');
  }
  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function createInventoryItem(item) {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create inventory item');
  }
  return data;
}

export async function getInventoryList() {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch inventory');
  }
  return data;
}

export async function updateInventoryItem(id, updates) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to update inventory item');
  }
  return data;
}

export async function deleteInventoryItem(id) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to delete inventory item');
  }
  return data;
}
export async function getDashboardStats() {
  const items = await getInventoryList();
  const predictionData = await getPredictionCount();    
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const materialCounts = {};
  items.forEach((item) => {
    materialCounts[item.fabric_type] = (materialCounts[item.fabric_type] || 0) + 1;
  });
  const materialBreakdown = Object.entries(materialCounts)
    .map(([name, count]) => ({ name, count, percent: Math.round((count / totalItems) * 100) || 0 }))
    .sort((a, b) => b.count - a.count);
  return { totalItems, totalQuantity, materialBreakdown,totalPredictions: predictionData.totalPredictions, };
}

export async function getPredictionCount() {
  const response = await fetch(`${API_BASE_URL}/predictions/count`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch prediction count");
  }

  return data;
}

export async function getPredictionHistory() {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch prediction history");
  }

  return data;
}

export async function predictFabric(file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Prediction failed");
  }

  return data;
}

export async function deletePredictionHistory(id) {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete this prediction.");
  }
}
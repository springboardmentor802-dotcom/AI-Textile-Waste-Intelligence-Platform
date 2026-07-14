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
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));

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
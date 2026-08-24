const API_BASE_URL = 'http://localhost:8000';

export async function registerUser(fullName, email, password, role) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      password: password,
      role: role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
  let message = 'Failed to create inventory item';

  if (typeof data.detail === 'string') {
    message = data.detail;
  } else if (Array.isArray(data.detail)) {
    message = data.detail
      .map((error) => error.msg || JSON.stringify(error))
      .join(', ');
  } else if (data.detail) {
    message = JSON.stringify(data.detail);
  }

  throw new Error(message);
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

// PROFILE: UPDATE OWN INFO
//
// Calls PUT /auth/me with whichever of full_name/email the caller
// wants to change (both optional -- only send what changed). On
// success, updates the SAME localStorage 'user' key that login()
// writes, so getCurrentUser() (and anything reading it, like
// Sidebar/Topbar) reflects the change immediately without a
// re-login. Same getAuthHeaders() + status-aware error pattern as
// every other authenticated call in this file.
export async function updateCurrentUser(updates) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.detail ||
        (response.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Failed to update profile.')
    );
    error.status = response.status;
    throw error;
  }

  // Keep localStorage in sync with the just-saved values so every
  // component reading getCurrentUser() (Sidebar, Topbar, Profile
  // itself) sees the update without requiring a fresh login.
  localStorage.setItem('user', JSON.stringify(data));

  return data;
}

// SETTINGS: CHANGE PASSWORD
//
// Calls POST /auth/change-password. Does not touch localStorage --
// changing a password does not change the logged-in user's id/name/
// email/role, so there is nothing to update in the stored 'user'
// object.
export async function changePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.detail ||
        (response.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Failed to change password.')
    );
    error.status = response.status;
    throw error;
  }

  return data;
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

// ADMIN: USER MANAGEMENT
//
// Fetches every registered user for the Administrator Users page.
// Uses the same getAuthHeaders() pattern (Authorization: Bearer <token>)
// as every other authenticated call in this file, and the same
// try/response.ok error-handling shape -- no second API pattern.
export async function getAllUsers() {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Preserve the HTTP status so the UI can tell a 401 (not logged in
    // / session expired) apart from a 403 (logged in, but not an
    // Administrator) and show the right message for each.
    const error = new Error(
      data.detail ||
        (response.status === 403
          ? 'You do not have permission to view users.'
          : response.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Failed to load users.')
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// ADMIN: PLATFORM ANALYTICS
//
// Fetches the complete, pre-aggregated platform-wide analytics payload
// (user counts, inventory totals, prediction totals/distributions/trend)
// for the Administrator dashboard section. All calculation happens on
// the backend (GET /admin/analytics) so the frontend never downloads
// raw prediction/user rows just to sum them itself. Same
// getAuthHeaders() + status-aware error pattern as getAllUsers().
export async function getPlatformAnalytics() {
  const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.detail ||
        (response.status === 403
          ? 'You do not have permission to view platform analytics.'
          : response.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Failed to load platform analytics.')
    );
    error.status = response.status;
    throw error;
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

export async function getPredictionDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch prediction dashboard stats");
  }

  return data;
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

// NOTIFICATIONS
//
// Same fetch + getAuthHeaders() + response.ok pattern as every other
// authenticated call in this file (createInventoryItem, getAllUsers,
// etc.) - no separate notification-specific fetch pattern.

export async function getNotifications() {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch notifications');
  }

  return data;
}

export async function getUnreadNotificationCount() {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch unread notification count');
  }

  return data;
}

export async function markNotificationAsRead(id) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to mark notification as read');
  }

  return data;
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to mark all notifications as read');
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
// API Configuration and Helper Functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// API call helper with authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (userData: { username: string; email: string; password: string; fullName?: string }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiCall('/auth/me'),

  updateLanguage: (language: 'en' | 'ar') =>
    apiCall('/auth/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    }),
};

// Posts API
export const postsAPI = {
  create: (formData: FormData) =>
    apiCall('/posts', {
      method: 'POST',
      body: formData,
    }),

  getFeed: () => apiCall('/posts/feed'),

  getPost: (id: string) => apiCall(`/posts/${id}`),

  update: (id: string, data: any) =>
    apiCall(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/posts/${id}`, {
      method: 'DELETE',
    }),

  hide: (id: string) =>
    apiCall(`/posts/${id}/hide`, {
      method: 'POST',
    }),

  unhide: (id: string) =>
    apiCall(`/posts/${id}/unhide`, {
      method: 'POST',
    }),

  getUserPosts: (userId: string) => apiCall(`/posts/user/${userId}`),
};

// Comments API
export const commentsAPI = {
  create: (data: { postId: string; content: string }) =>
    apiCall('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getComments: (postId: string) => apiCall(`/comments/${postId}`),

  delete: (id: string) =>
    apiCall(`/comments/${id}`, {
      method: 'DELETE',
    }),
};

// Reactions API
export const reactionsAPI = {
  toggle: (data: { postId: string; type: 'like' | 'upvote' | 'helpful' | 'insightful' }) =>
    apiCall('/reactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReactions: (postId: string) => apiCall(`/reactions/${postId}`),

  checkReaction: (postId: string) => apiCall(`/reactions/${postId}/check`),
};

// Users API
export const usersAPI = {
  search: (query: string) => apiCall(`/users/search?q=${encodeURIComponent(query)}`),

  getProfile: (id: string) => apiCall(`/users/${id}`),

  sendFriendRequest: (id: string) =>
    apiCall(`/users/${id}/friend-request`, {
      method: 'POST',
    }),

  getFriendRequests: () => apiCall('/users/friend-requests'),

  acceptFriendRequest: (requestId: string) =>
    apiCall(`/users/friend-request/${requestId}/accept`, {
      method: 'POST',
    }),

  rejectFriendRequest: (requestId: string) =>
    apiCall(`/users/friend-request/${requestId}/reject`, {
      method: 'POST',
    }),

  removeFriend: (id: string) =>
    apiCall(`/users/${id}/friend`, {
      method: 'DELETE',
    }),
};

// Real API client for TALKnFIX
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('talknfix_token');
};

// Helper to create headers with auth token
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper to create headers for FormData (without Content-Type)
const createFormDataHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (data: { username: string; email: string; password: string; fullName: string }) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('talknfix_token');
  },
};

// Posts API
export const postsAPI = {
  getFeed: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(`${API_URL}/api/posts/feed?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getPost: async (id: string) => {
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: FormData) => {
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: createFormDataHeaders(),
      body: data,
    });
    return handleResponse(response);
  },

  update: async (id: string, data: FormData) => {
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: createFormDataHeaders(),
      body: data,
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  hide: async (id: string) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/hide`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  search: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/posts/search?${queryString}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getUserPosts: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/posts/user/${userId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Comments API
export const commentsAPI = {
  getByPostId: async (postId: string) => {
    const response = await fetch(`${API_URL}/api/comments/${postId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (postId: string, content: string) => {
    const response = await fetch(`${API_URL}/api/comments`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ postId, content }),
    });
    return handleResponse(response);
  },
};

// Reactions API
export const reactionsAPI = {
  toggle: async (data: { postId: string; type: 'like' | 'upvote' | 'helpful' | 'insightful' }) => {
    const response = await fetch(`${API_URL}/api/reactions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getLeaderboard: async () => {
    const response = await fetch(`${API_URL}/api/users/leaderboard`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getProfile: async (id: string) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  search: async (query: string) => {
    const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getFriendRequests: async () => {
    const response = await fetch(`${API_URL}/api/users/friend-requests`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getFriends: async () => {
    const response = await fetch(`${API_URL}/api/users/friends`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  sendFriendRequest: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/friend-request`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  acceptFriendRequest: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/users/friend-request/${userId}/accept`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  rejectFriendRequest: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/users/friend-request/${userId}/reject`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  removeFriend: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/friend`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getLeaderboard: async (limit: number = 50) => {
    const response = await fetch(`${API_URL}/api/users/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/api/users/profile-picture`, {
      method: 'PUT',
      headers: createFormDataHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/projects`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getByUserId: async (userId: string) => {
    const response = await fetch(`${API_URL}/api/projects/user/${userId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: {
    title: string;
    description: string;
    status: 'done' | 'in-progress' | 'future';
  }) => {
    const response = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (
    id: string,
    data: {
      title: string;
      description: string;
      status: 'done' | 'in-progress' | 'future';
    }
  ) => {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  addUpdate: async (projectId: string, content: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/updates`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  addCollaborator: async (projectId: string, userId: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/collaborators`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },

  removeCollaborator: async (projectId: string, userId: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/collaborators/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Token management
export const getToken = () => localStorage.getItem('talknfix_token');
export const setToken = (token: string) => localStorage.setItem('talknfix_token', token);
export const removeToken = () => localStorage.removeItem('talknfix_token');

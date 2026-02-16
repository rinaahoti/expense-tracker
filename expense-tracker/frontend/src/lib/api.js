import axios from 'axios';

// API base URL from env (no localhost in error messages)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !token.startsWith('demo-token')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: token expiration + hide server URLs in errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    // Normalize error so UI never shows localhost/server URLs
    const friendly = new Error(
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'The server is not reachable. Please make sure the backend is running.'
        : 'Something went wrong. Please try again.')
    );
    friendly.response = error.response;
    friendly.status = error.response?.status;
    return Promise.reject(friendly);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    // Demo mode: accept any registration data and create a demo session
    if (userData?.email && userData?.password) {
      const demoUser = {
        token: 'demo-token-123',
        user: {
          id: 1,
          username: userData.username || userData.email.split('@')[0],
          email: userData.email
        }
      };
      localStorage.setItem('accessToken', demoUser.token);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      return demoUser;
    }

    // Fallback: real backend registration
    const response = await api.post('/auth/register', userData);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  login: async (credentials) => {
    // Demo mode: allow any email/password to log in without backend
    if (credentials?.email && credentials?.password) {
      const demoUser = {
        token: 'demo-token-123',
        user: {
          id: 1,
          username: credentials.email.split('@')[0],
          email: credentials.email
        }
      };
      localStorage.setItem('accessToken', demoUser.token);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      return demoUser;
    }

    // Fallback: real backend login
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Demo categories (no backend required)
      return [
        { id: 1, name: 'Dining & Restaurants', description: 'Fine dining, cafes, delivery', type: 'expense' },
        { id: 2, name: 'Travel & Experiences', description: 'Flights, hotels, getaways', type: 'expense' },
        { id: 3, name: 'Investments', description: 'Stocks, funds, crypto', type: 'income' },
        { id: 4, name: 'Salary & Bonuses', description: 'Primary income streams', type: 'income' }
      ];
    }

    const response = await api.get('/categories');
    return response.data;
  },

  create: async (categoryData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Create demo category client-side only
      return {
        id: Date.now(),
        name: categoryData.name,
        description: categoryData.description || '',
        type: categoryData.type || 'expense'
      };
    }

    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Echo back updated demo category
      return {
        id: parseInt(id),
        name: categoryData.name,
        description: categoryData.description || '',
        type: categoryData.type || 'expense'
      };
    }

    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // No-op delete in demo mode
      return;
    }

    await api.delete(`/categories/${id}`);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params = {}) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Demo transactions (static sample data)
      const demoTransactions = [
        {
          id: 1,
          amount: 1250.00,
          description: 'Monthly salary',
          date: '2025-01-01',
          type: 'income',
          category_id: 4,
          category_name: 'Salary & Bonuses',
          created_at: '2025-01-01T09:00:00Z'
        },
        {
          id: 2,
          amount: 220.50,
          description: 'Dinner at rooftop restaurant',
          date: '2025-01-06',
          type: 'expense',
          category_id: 1,
          category_name: 'Dining & Restaurants',
          created_at: '2025-01-06T20:30:00Z'
        },
        {
          id: 3,
          amount: 780.00,
          description: 'Weekend getaway',
          date: '2025-01-10',
          type: 'expense',
          category_id: 2,
          category_name: 'Travel & Experiences',
          created_at: '2025-01-10T11:00:00Z'
        },
        {
          id: 4,
          amount: 300.00,
          description: 'Investment dividends',
          date: '2025-01-12',
          type: 'income',
          category_id: 3,
          category_name: 'Investments',
          created_at: '2025-01-12T15:00:00Z'
        }
      ];

      return { transactions: demoTransactions };
    }

    const queryParams = new URLSearchParams();

    // Add filters
    if (params.q) queryParams.append('q', params.q);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  create: async (transactionData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Create demo transaction client-side only
      return {
        id: Date.now(),
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || '',
        date: transactionData.date,
        type: transactionData.type,
        category_id: transactionData.category_id || null,
        category_name: null,
        created_at: new Date().toISOString()
      };
    }

    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      return {
        id: parseInt(id),
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || '',
        date: transactionData.date,
        type: transactionData.type,
        category_id: transactionData.category_id || null,
        category_name: null,
        created_at: new Date().toISOString()
      };
    }

    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // No-op delete in demo mode
      return;
    }

    await api.delete(`/transactions/${id}`);
  }
};

export default api;
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5002',
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    // For demo purposes, accept any registration data
    if (userData.username && userData.email && userData.password) {
      const demoUser = {
        token: 'demo-token-123',
        user: {
          id: 1,
          username: userData.username,
          email: userData.email
        }
      };
      localStorage.setItem('accessToken', demoUser.token);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      return demoUser;
    }

    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    // For demo purposes, accept any credentials
    if (credentials.email && credentials.password) {
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

    const response = await api.post('/auth/login', credentials);
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
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
      // Return demo categories
      return [
        { id: 1, name: 'Food & Dining', description: 'Restaurants, groceries, etc.' },
        { id: 2, name: 'Transportation', description: 'Gas, public transport, car maintenance' },
        { id: 3, name: 'Entertainment', description: 'Movies, games, hobbies' },
        { id: 4, name: 'Utilities', description: 'Electricity, water, internet' }
      ];
    }
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (categoryData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Return demo category
      return {
        id: Date.now(),
        name: categoryData.name,
        description: categoryData.description || ''
      };
    }
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Return updated demo category
      return {
        id: parseInt(id),
        name: categoryData.name,
        description: categoryData.description || ''
      };
    }
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Demo delete - just return
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
      // Return demo transactions
      const demoTransactions = [
        {
          id: 1,
          amount: 25.50,
          description: 'Lunch at restaurant',
          date: '2024-01-15',
          type: 'expense',
          category_id: 1,
          category_name: 'Food & Dining',
          created_at: '2024-01-15T12:00:00Z'
        },
        {
          id: 2,
          amount: 150.00,
          description: 'Monthly salary',
          date: '2024-01-01',
          type: 'income',
          category_id: null,
          category_name: null,
          created_at: '2024-01-01T09:00:00Z'
        },
        {
          id: 3,
          amount: 45.00,
          description: 'Gas station',
          date: '2024-01-14',
          type: 'expense',
          category_id: 2,
          category_name: 'Transportation',
          created_at: '2024-01-14T15:30:00Z'
        },
        {
          id: 4,
          amount: 12.99,
          description: 'Netflix subscription',
          date: '2024-01-10',
          type: 'expense',
          category_id: 3,
          category_name: 'Entertainment',
          created_at: '2024-01-10T08:00:00Z'
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
      // Return demo transaction
      const categories = [
        { id: 1, name: 'Food & Dining' },
        { id: 2, name: 'Transportation' },
        { id: 3, name: 'Entertainment' },
        { id: 4, name: 'Utilities' }
      ];

      const category = categories.find(c => c.id == transactionData.category_id);

      return {
        id: Date.now(),
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || '',
        date: transactionData.date,
        type: transactionData.type,
        category_id: transactionData.category_id,
        category_name: category ? category.name : null,
        created_at: new Date().toISOString()
      };
    }

    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Return updated demo transaction
      const categories = [
        { id: 1, name: 'Food & Dining' },
        { id: 2, name: 'Transportation' },
        { id: 3, name: 'Entertainment' },
        { id: 4, name: 'Utilities' }
      ];

      const category = categories.find(c => c.id == transactionData.category_id);

      return {
        id: parseInt(id),
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || '',
        date: transactionData.date,
        type: transactionData.type,
        category_id: transactionData.category_id,
        category_name: category ? category.name : null,
        created_at: new Date().toISOString()
      };
    }

    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token')) {
      // Demo delete - just return
      return;
    }
    await api.delete(`/transactions/${id}`);
  }
};

export default api;
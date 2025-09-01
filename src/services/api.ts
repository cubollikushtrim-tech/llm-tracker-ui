import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface UsageEventRequest {
  customerId: string;
  userId: string;
  vendor: string;
  model: string;
  apiType: string;
  region?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedTokens?: number;
  imageCount?: number;
  videoCount?: number;
  audioMinutes?: number;
  requestCount?: number;
  requestId?: string;
  sessionId?: string;
  endpoint?: string;
  status?: string;
  errorMessage?: string;
  metadata?: string;
  timestamp: string;
  customerDetails?: {
    organizationName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
  };
  userDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    role?: string;
  };
}

export interface UsageEventResponse {
  eventId: string;
  customerId: string;
  userId: string;
  vendor: string;
  model: string;
  apiType: string;
  region?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedTokens?: number;
  imageCount?: number;
  videoCount?: number;
  audioMinutes?: number;
  requestCount?: number;
  inputCost?: number;
  outputCost?: number;
  totalCost?: number;
  revenue?: number;
  profit?: number;
  currency?: string;
  requestId?: string;
  sessionId?: string;
  endpoint?: string;
  status?: string;
  errorMessage?: string;
  metadata?: string;
  timestamp: string;
  createdAt: string;
}

export interface AnalyticsResponse {
  period: string;
  startDate: string;
  endDate: string;
  totalEvents?: number;
  totalTokens?: number;
  totalCost?: number;
  totalRevenue?: number;
  totalProfit?: number;
  profitMargin?: number;
  usageByVendor?: Record<string, number>;
  usageByModel?: Record<string, number>;
  usageByApiType?: Record<string, number>;
  usageByRegion?: Record<string, number>;
  usageByEndpoint?: Record<string, number>;
  usageByUserRole?: Record<string, number>;
  costByVendor?: Record<string, number>;
  costByModel?: Record<string, number>;
  costByApiType?: Record<string, number>;
  timeSeriesData?: Array<{
    date: string;
    events?: number;
    tokens?: number;
    cost?: number;
    revenue?: number;
    profit?: number;
  }>;
  topCustomers?: Array<{
    customerId: string;
    organizationName: string;
    events?: number;
    tokens?: number;
    cost?: number;
    revenue?: number;
    profit?: number;
    profitMargin?: number;
  }>;
  topUsers?: Array<{
    userId: string;
    fullName: string;
    email: string;
    customerId: string;
    events?: number;
    tokens?: number;
    cost?: number;
    revenue?: number;
    profit?: number;
  }>;
  growthMetrics?: {
    eventsGrowth?: number;
    tokensGrowth?: number;
    costGrowth?: number;
    revenueGrowth?: number;
    profitGrowth?: number;
    comparisonPeriod?: string;
  };
  predictions?: {
    predictedEvents?: number;
    predictedTokens?: number;
    predictedCost?: number;
    predictedRevenue?: number;
    predictedProfit?: number;
  };
  efficiencyMetrics?: {
    costPerEvent?: number;
    revenuePerEvent?: number;
    profitPerEvent?: number;
    costPerToken?: number;
    revenuePerToken?: number;
    profitPerToken?: number;
  };
  seasonality?: {
    weeklyPattern?: Record<string, number>;
    monthlyPattern?: Record<string, number>;
  };
  anomalies?: Array<{
    date: string;
    type: string;
    metric: string;
    description: string;
  }>;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  customerId: string;
  customerName: string;
  expiresIn: number;
}

export interface Customer {
  id?: number;
  customerId: string;
  organizationName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  markupPercentage: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role: string;
  active: boolean;
  customerId?: string;
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;
  get fullName(): string;
}

export const apiService = {
  addRandomEvents: async (payload: { count: number; todayOnly?: boolean }) => {
    const response = await api.post('/api/test/add-random-events', payload);
    return response.data;
  },
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  submitEvent: async (event: UsageEventRequest): Promise<UsageEventResponse> => {
    const response = await api.post('/api/events', event);
    return response.data;
  },

  getEvents: async (params?: {
    customerId?: string;
    userId?: string;
    vendor?: string;
    model?: string;
    apiType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: UsageEventResponse[]; totalElements: number; totalPages: number }> => {
    const response = await api.get('/api/events', { params });
    return response.data;
  },

  getAnalytics: async (params: {
    period?: string;
    startDate: string;
    endDate: string;
    customerId?: string;
    userId?: string;
    vendor?: string;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/api/analytics/usage', { params });
    return response.data;
  },

  getCostAnalytics: async (params: {
    period?: string;
    startDate: string;
    endDate: string;
    customerId?: string;
    userId?: string;
    vendor?: string;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/api/analytics/costs', { params });
    return response.data;
  },

  getRevenueAnalytics: async (params: {
    period?: string;
    startDate: string;
    endDate: string;
    customerId?: string;
    userId?: string;
    vendor?: string;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/api/analytics/revenue', { params });
    return response.data;
  },

  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/api/customers');
    return response.data;
  },

  getCustomer: async (customerId: string): Promise<Customer> => {
    const response = await api.get(`/api/customers/${customerId}`);
    return response.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const response = await api.post('/api/customers', customer);
    return response.data;
  },

  updateCustomer: async (customerId: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/api/customers/${customerId}`, customer);
    return response.data;
  },

  deleteCustomer: async (customerId: string): Promise<void> => {
    await api.delete(`/api/customers/${customerId}`);
  },

  searchCustomers: async (searchTerm: string): Promise<Customer[]> => {
    const response = await api.get('/api/customers/search', { params: { searchTerm } });
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await api.post('/api/users', user);
    return response.data;
  },

  updateUser: async (userId: string, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/users/${userId}`, user);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/users/${userId}`);
  },

  searchUsers: async (searchTerm: string): Promise<User[]> => {
    const response = await api.get('/api/users/search', { params: { searchTerm } });
    return response.data;
  },
};

export default api;

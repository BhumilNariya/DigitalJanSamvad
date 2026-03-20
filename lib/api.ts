import axios from 'axios';
// import Cookies from 'js-cookie';
import type { 
  User, 
  Issue, 
  LoginCredentials, 
  RegisterData, 
  CreateIssueData,
  ApiResponse 
} from './types'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return { success: true, data: { user: res.data, token: 'cookie-based' } };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        mobileNumber: data.phone,
      };
      const res = await apiClient.post('/auth/register', payload);
      return { success: true, data: { user: res.data, token: 'cookie-based' } };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },
  async logout(): Promise<ApiResponse<null>> {
    try {
      await apiClient.post('/auth/logout');
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: 'Logout failed' };
    }
  },
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const res = await apiClient.get('/users/me');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Not authenticated' };
    }
  }
};

export const issuesApi = {
  async getAll(params?: any): Promise<ApiResponse<Issue[]>> {
    try {
      const res = await apiClient.get('/issues', { params });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch issues' };
    }
  },
  async getById(id: string): Promise<ApiResponse<Issue>> {
    try {
      const res = await apiClient.get(`/issues/${id}`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch issue' };
    }
  },
  async create(data: CreateIssueData, user: User): Promise<ApiResponse<Issue>> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.location?.lat && data.location?.lng) {
          formData.append('latitude', data.location.lat.toString());
          formData.append('longitude', data.location.lng.toString());
      }
      if (data.location?.address) {
          formData.append('address', data.location.address);
      }
      if (data.images && data.images.length > 0 && typeof data.images[0] !== 'string') {
        formData.append('image', data.images[0]);
      }

      const res = await apiClient.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Failed to create issue' };
    }
  },
  async updateStatus(issueId: string, status: string, categoryId?: string): Promise<ApiResponse<Issue>> {
    try {
      const payload: any = { status };
      if (categoryId) payload.category = categoryId;
      const res = await apiClient.patch(`/admin/issues/${issueId}/status`, payload);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to update issue' };
    }
  },
  async upvote(issueId: string): Promise<ApiResponse<Issue>> {
    // Stub for upvote
    return { success: true, data: {} as Issue };
  }
};

export const leaderboardApi = {
  async getTopUsers(): Promise<ApiResponse<User[]>> {
    try {
      const res = await apiClient.get('/leaderboard');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch leaderboard' };
    }
  }
};

export const adminApi = {
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get('/admin/dashboard');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch admin stats' };
    }
  },
  async getIssues(): Promise<ApiResponse<Issue[]>> {
    try {
      const res = await apiClient.get('/admin/issues');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch admin issues' };
    }
  }
};

export const categoryApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    try {
      const res = await apiClient.get('/categories');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch categories' };
    }
  }
};

export default apiClient;

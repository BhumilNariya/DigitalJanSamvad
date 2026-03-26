import axios from 'axios';
// import Cookies from 'js-cookie';
import type { 
  User, 
  Issue, 
  Comment,
  Notification,
  LoginCredentials, 
  RegisterData, 
  CreateIssueData,
  ApiResponse 
} from './types'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jansamvad_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return { success: true, data: { user: res.data, token: res.data.token || 'cookie-based' } };
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
      return { success: true, data: { user: res.data, token: res.data.token || 'cookie-based' } };
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
  async getAll(params?: any): Promise<ApiResponse<any>> {
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

      const res = await apiClient.post('/issues', formData);
      // Handle the new standardized { success, message, issue } wrapper from backend gracefully
      return { success: true, data: res.data.issue || res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Failed to create issue' };
    }
  },
  async updateStatus(issueId: string, status: string, categoryId?: string): Promise<ApiResponse<Issue>> {
    try {
      if (categoryId) {
        // Just update category via the general update endpoint
        await apiClient.patch(`/admin/issues/${issueId}`, { category: categoryId });
      }
      
      let route = `/admin/issues/${issueId}`;
      if (status === 'verified') route = `/admin/issues/${issueId}/verify`;
      else if (status === 'assigned') route = `/admin/issues/${issueId}/assign`;
      else if (status === 'in-progress') route = `/admin/issues/${issueId}/start`;
      else if (status === 'resolved') route = `/admin/issues/${issueId}/resolve`;
      else if (status === 'closed') route = `/admin/issues/${issueId}/close`;
      else if (status === 'rejected') route = `/admin/issues/${issueId}/reject`;

      const res = await apiClient.patch(route, { status });
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
  async getIssues(params?: any): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get('/admin/issues', { params });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch admin issues' };
    }
  },
  async updateIssueStatus(issueId: string, status: string): Promise<ApiResponse<any>> {
    try {
      let route = `/admin/issues/${issueId}`;
      if (status === 'verified') route = `/admin/issues/${issueId}/verify`;
      else if (status === 'assigned') route = `/admin/issues/${issueId}/assign`;
      else if (status === 'in-progress') route = `/admin/issues/${issueId}/start`;
      else if (status === 'resolved') route = `/admin/issues/${issueId}/resolve`;
      else if (status === 'closed') route = `/admin/issues/${issueId}/close`;
      else if (status === 'rejected') route = `/admin/issues/${issueId}/reject`;

      const res = await apiClient.patch(route);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to update status' };
    }
  },
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const res = await apiClient.get('/admin/users');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch users' };
    }
  },
  async assignStaff(issueId: string, staffId: string): Promise<ApiResponse<Issue>> {
    try {
      const res = await apiClient.patch(`/admin/issues/${issueId}/assign`, { staffId });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to assign staff' };
    }
  },
  async deleteIssue(issueId: string): Promise<ApiResponse<null>> {
    try {
      await apiClient.delete(`/admin/issues/${issueId}`);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: 'Failed to delete issue' };
    }
  },
  async addAdminNote(issueId: string, text: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post(`/admin/issues/${issueId}/note`, { text });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to add note' };
    }
  },
  async getIssueById(issueId: string): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get(`/admin/issues/${issueId}`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch issue details' };
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

export const commentApi = {
  async getByIssue(issueId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const res = await apiClient.get(`/issues/${issueId}/comments`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch comments' };
    }
  },
  async create(issueId: string, text: string): Promise<ApiResponse<Comment>> {
    try {
      const res = await apiClient.post(`/issues/${issueId}/comments`, { text });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to post comment' };
    }
  }
};

export const notificationApi = {
  async getAll(): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> {
    try {
      const res = await apiClient.get('/users/notifications');
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: 'Failed to fetch notifications' };
    }
  },
  async markRead(id: string): Promise<ApiResponse<null>> {
    try {
      await apiClient.patch(`/users/notifications/${id}/read`);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: 'Failed to mark notification read' };
    }
  },
  async markAllRead(): Promise<ApiResponse<null>> {
    try {
      await apiClient.patch('/users/notifications/read-all');
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: 'Failed to mark all read' };
    }
  }
};

export default apiClient;


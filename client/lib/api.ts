const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, config);
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'applicant' | 'recruiter';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  // User endpoints
  async getMe() {
    return this.request('/me');
  }

  async updateMe(data: { name?: string; resumeUrl?: string }) {
    return this.request('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Job endpoints
  async getJobs(params?: {
    q?: string;
    location?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/jobs${queryString ? `?${queryString}` : ''}`);
  }

  async getMyJobs() {
    return this.request('/jobs/my-jobs');
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: {
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    deadline: string;
  }) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: any) {
    return this.request(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobApplications(jobId: string) {
    return this.request(`/jobs/${jobId}/applications`);
  }

  // Application endpoints
  async createApplication(data: { jobId: string; resumeUrl?: string }) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications(params?: { page?: number; pageSize?: number }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/applications/me${queryString ? `?${queryString}` : ''}`);
  }

  async getApplication(id: string) {
    return this.request(`/applications/${id}`);
  }

  async updateApplication(id: string, data: { status?: string; notes?: string }) {
    return this.request(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async getAnalyticsSummary() {
    return this.request('/analytics/summary');
  }
}

export const api = new ApiClient();
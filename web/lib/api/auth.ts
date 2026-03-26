import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface UserSummary {
  weekly_creations: number;
  weekly_creations_delta: string;
  storage_used_gb: number;
  storage_total_gb: number;
  storage_used_pct: number;
  points: number;
  points_delta: string;
  compute_consumed: number;
  compute_delta: string;
  user_name: string;
}

export const authApi = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/auth/login", data);
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/auth/register", data);
  },

  logout(): Promise<void> {
    return apiClient.post<void>("/api/auth/logout");
  },

  refresh(refresh_token: string): Promise<{ access_token: string }> {
    return apiClient.post<{ access_token: string }>("/api/auth/refresh", {
      refresh_token,
    });
  },

  getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/api/auth/me");
  },

  getUserSummary(): Promise<UserSummary> {
    return apiClient.get<UserSummary>('/api/user/summary');
  },

  getFaq(): Promise<{ id: string; q: string; a: string }[]> {
    return apiClient.get('/api/faq');
  },

  submitFeedback(data: { type: string; content: string }): Promise<{ id: string }> {
    return apiClient.post('/api/feedback', data);
  },
};

import { apiClient } from "./client";

export interface UserResponse {
  id: number;
  email: string;
  username?: string | null;
  phone_number?: string | null;
  email_verified: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  phone_number: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<{ message: string }>("/users", payload),

  verifyOtp: (payload: { email: string; otp: string }) =>
    apiClient.post<{ message: string }>("/verify-otp", payload),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthToken>("/login", payload),

  me: () => apiClient.get<UserResponse>("/users/me"),
};

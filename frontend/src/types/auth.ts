export interface User {
  id: string;
  email: string;
  fullName?: string;
  jobTitle?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  roles: string[];
  permissions: string[];
  features: string[];
}

export interface AuthResponse {
  token: string;
  tenantId: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string;
  tenantId: string;
}

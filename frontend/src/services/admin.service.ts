import { apiClient } from './api-client';
import { UserDto, CreateUserDto, UpdateUserDto, RoleDto, RoleWithPermissionsDto, PermissionDto, CreateRoleDto, UserPermissionMatrixDto } from '@/types/admin';

// Users
export const usersService = {
  getAll: () => apiClient.get<UserDto[]>('/tenant/users').then(res => res.data),
  getById: (id: string) => apiClient.get<UserDto>(`/tenant/users/${id}`).then(res => res.data),
  create: (data: CreateUserDto) => apiClient.post('/tenant/users', data).then(res => res.data),
  update: (id: string, data: UpdateUserDto) => apiClient.put(`/tenant/users/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/tenant/users/${id}`).then(res => res.data),
  assignRoles: (id: string, roleIds: string[]) => apiClient.post(`/tenant/users/${id}/roles`, roleIds).then(res => res.data),
  getPermissionMatrix: () => apiClient.get<UserPermissionMatrixDto[]>('/tenant/users/permission-matrix').then(res => res.data),
};

// Roles
export const rolesService = {
  getAll: () => apiClient.get<RoleDto[]>('/tenant/roles').then(res => res.data),
  getById: (id: string) => apiClient.get<RoleWithPermissionsDto>(`/tenant/roles/${id}`).then(res => res.data),
  create: (data: CreateRoleDto) => apiClient.post('/tenant/roles', data).then(res => res.data),
  update: (id: string, name: string, permissionIds: string[]) => apiClient.put(`/tenant/roles/${id}`, { name, permissionIds }).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/tenant/roles/${id}`).then(res => res.data),
  assignPermissions: (id: string, permissionIds: string[]) => apiClient.post(`/tenant/roles/${id}/permissions`, { permissionIds }).then(res => res.data),
};

// Permissions
export const permissionsService = {
  getAll: () => apiClient.get<PermissionDto[]>('/tenant/permissions').then(res => res.data),
};

// Features
export interface FeatureDto {
  id: string;
  featureKey: string;
  isEnabled: boolean;
  description: string;
}

export const featuresService = {
  getAll: () => apiClient.get<FeatureDto[]>('/tenant/features').then(res => res.data),
  toggle: (featureKey: string, isEnabled: boolean) => apiClient.put(`/tenant/features/${featureKey}`, { isEnabled }).then(res => res.data),
};

// Profile
export interface UpdateProfileDto {
  fullName?: string;
  jobTitle?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const profileService = {
  update: (data: UpdateProfileDto) => apiClient.put('/auth/profile', data).then(res => res.data),
};

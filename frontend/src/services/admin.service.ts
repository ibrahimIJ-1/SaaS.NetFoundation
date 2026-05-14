import { apiClient } from './api-client';
import { UserDto, CreateUserDto, UpdateUserDto, RoleDto, RoleWithPermissionsDto, PermissionDto } from '@/types/admin';

// Users
export const usersService = {
  getAll: () => apiClient.get<UserDto[]>('/tenant/users').then(res => res.data),
  getById: (id: string) => apiClient.get<UserDto>(`/tenant/users/${id}`).then(res => res.data),
  create: (data: CreateUserDto) => apiClient.post('/tenant/users', data).then(res => res.data),
  update: (id: string, data: UpdateUserDto) => apiClient.put(`/tenant/users/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/tenant/users/${id}`).then(res => res.data),
  assignRoles: (id: string, roleIds: string[]) => apiClient.post(`/tenant/users/${id}/roles`, { roleIds }).then(res => res.data),
};

// Roles
export const rolesService = {
  getAll: () => apiClient.get<RoleDto[]>('/tenant/roles').then(res => res.data),
  getById: (id: string) => apiClient.get<RoleWithPermissionsDto>(`/tenant/roles/${id}`).then(res => res.data),
  create: (name: string) => apiClient.post('/tenant/roles', { name }).then(res => res.data),
  update: (id: string, name: string) => apiClient.put(`/tenant/roles/${id}`, { name }).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/tenant/roles/${id}`).then(res => res.data),
  assignPermissions: (id: string, permissionIds: string[]) => apiClient.post(`/tenant/roles/${id}/permissions`, { permissionIds }).then(res => res.data),
};

// Permissions
export const permissionsService = {
  getAll: () => apiClient.get<PermissionDto[]>('/tenant/permissions').then(res => res.data),
};

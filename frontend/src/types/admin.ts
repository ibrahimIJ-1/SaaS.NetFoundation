export interface UserDto {
  id: string;
  email: string;
  fullName?: string;
  roles: string[];
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface UpdateUserDto {
  email: string;
  fullName: string;
  password?: string;
  role?: string;
}

export interface PermissionDto {
  id: string;
  name: string;
}

export interface RoleDto {
  id: string;
  name: string;
}

export interface RoleWithPermissionsDto extends RoleDto {
  permissions: PermissionDto[];
}

export interface CreateRoleDto {
  name: string;
  permissionIds: string[];
}

export interface UserPermissionMatrixDto {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

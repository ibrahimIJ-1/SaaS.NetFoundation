export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  avatarUrl?: string;
  isActive: boolean;
  preferredLanguage: string;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  fullName: string;
  role: string;
}

export interface UpdateUserDto {
  email: string;
  fullName: string;
  jobTitle?: string;
  isActive?: boolean;
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

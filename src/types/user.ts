export type UserRole = 'Administrador' | 'Asistente' | 'Secretaria';

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  cedula: string;
  rol: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserData {
  nombres: string;
  apellidos: string;
  username?: string;
  cedula: string;
  rol: UserRole;
}

export interface UpdateUserData {
  nombres?: string;
  apellidos?: string;
  username?: string;
  rol?: UserRole;
  isActive?: boolean;
} 
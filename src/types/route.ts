export interface Route {
  id: string;
  identificador: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRouteData {
  identificador: string;
  nombre: string;
  descripcion?: string;
}

export interface UpdateRouteData {
  identificador?: string;
  nombre?: string;
  descripcion?: string;
  isActive?: boolean;
} 
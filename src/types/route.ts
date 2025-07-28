export interface Route {
  id: string;
  identificador: string;
  nombre: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateRouteData {
  nombre: string;
}

export interface UpdateRouteData {
  nombre?: string;
  isActive?: boolean;
} 
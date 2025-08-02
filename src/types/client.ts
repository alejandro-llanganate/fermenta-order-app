export interface Client {
  id: string;
  institucionEducativa: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string;
  routeId?: string; // ID de la ruta asignada
  routeName?: string; // Nombre de la ruta para mostrar
  isActive: boolean;
  createdAt: Date;
}

export interface CreateClientData {
  institucionEducativa: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string;
  routeId?: string;
}

export interface UpdateClientData {
  institucionEducativa?: string;
  nombreCompleto?: string;
  telefono?: string;
  direccion?: string;
  routeId?: string;
  isActive?: boolean;
} 
export interface Client {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  cedula?: string;
  email?: string;
  routeId?: string;
  routeIdentifier?: string;
  routeName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  nombre: string;
  telefono?: string;
  direccion?: string;
  cedula?: string;
  email?: string;
  routeId?: string;
}

export interface UpdateClientData {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  cedula?: string;
  email?: string;
  routeId?: string;
  isActive?: boolean;
} 
export interface Client {
  id: string;
  institucionEducativa: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateClientData {
  institucionEducativa: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string;
}

export interface UpdateClientData {
  institucionEducativa?: string;
  nombreCompleto?: string;
  telefono?: string;
  direccion?: string;
  isActive?: boolean;
} 
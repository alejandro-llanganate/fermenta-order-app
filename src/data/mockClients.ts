import { Client } from '@/types/client';

export const mockClients: Client[] = [
  {
    id: '1',
    institucionEducativa: 'Unidad Educativa Nacional Quito',
    nombreCompleto: 'María Elena González Pérez',
    telefono: '0998765432',
    direccion: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    institucionEducativa: 'Colegio San Gabriel',
    nombreCompleto: 'Carlos Roberto Martínez López',
    telefono: '0987654321',
    direccion: 'Calle Venezuela N8-45 y Chile, Quito',
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    institucionEducativa: 'Escuela Fiscal Sucre',
    nombreCompleto: 'Ana Patricia Rodríguez Torres',
    telefono: '0976543210',
    direccion: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    institucionEducativa: 'Instituto Tecnológico Superior Central',
    nombreCompleto: 'Luis Fernando Herrera Vásquez',
    telefono: '0965432109',
    direccion: 'Av. 6 de Diciembre N26-145 y Colón, Quito',
    isActive: true,
    createdAt: new Date('2024-02-05')
  },
  {
    id: '5',
    institucionEducativa: 'Colegio Particular La Salle',
    nombreCompleto: 'Carmen Isabel Flores Morales',
    telefono: '0954321098',
    direccion: 'Calle García Moreno S1-47 y Sucre, Quito',
    isActive: false,
    createdAt: new Date('2024-02-10')
  },
  {
    id: '6',
    institucionEducativa: 'Universidad Central del Ecuador',
    nombreCompleto: 'Roberto Miguel Castillo Núñez',
    telefono: '0943210987',
    direccion: 'Av. América y Universitaria, Ciudad Universitaria, Quito',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '7',
    institucionEducativa: 'Escuela de Educación Básica Manuela Cañizares',
    nombreCompleto: 'Patricia Alejandra Ramírez Silva',
    telefono: '0932109876',
    direccion: 'Calle Cuenca N4-23 y Mideros, Quito',
    isActive: true,
    createdAt: new Date('2024-02-20')
  },
  {
    id: '8',
    institucionEducativa: 'Colegio Nacional Mejía',
    nombreCompleto: 'Fernando José Aguirre Moreno',
    telefono: '0921098765',
    direccion: 'Av. Mariscal Sucre y Antisana, Quito',
    isActive: true,
    createdAt: new Date('2024-02-25')
  }
]; 
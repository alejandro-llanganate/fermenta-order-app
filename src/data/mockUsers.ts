import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    nombres: 'Alejandro',
    apellidos: 'Llanga Nate',
    username: 'alejandro.llanga',
    cedula: '1234567890',
    rol: 'Administrador',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    nombres: 'María',
    apellidos: 'González',
    username: 'maria.gonzalez',
    cedula: '0987654321',
    rol: 'Asistente',
    isActive: true,
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    nombres: 'Carlos',
    apellidos: 'Rodríguez',
    username: 'carlos.rodriguez',
    cedula: '1122334455',
    rol: 'Secretaria',
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '4',
    nombres: 'Ana',
    apellidos: 'Martínez',
    username: 'ana.martinez',
    cedula: '5566778899',
    rol: 'Asistente',
    isActive: true,
    createdAt: new Date('2024-02-05')
  },
  {
    id: '5',
    nombres: 'Luis',
    apellidos: 'Hernández',
    username: 'luis.hernandez',
    cedula: '9988776655',
    rol: 'Secretaria',
    isActive: false,
    createdAt: new Date('2024-01-25')
  },
  {
    id: '6',
    nombres: 'Patricia',
    apellidos: 'López',
    username: 'patricia.lopez',
    cedula: '4433221100',
    rol: 'Asistente',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '7',
    nombres: 'Roberto',
    apellidos: 'Pérez',
    username: 'roberto.perez',
    cedula: '6677889900',
    rol: 'Secretaria',
    isActive: true,
    createdAt: new Date('2024-01-30')
  },
  {
    id: '8',
    nombres: 'Carmen',
    apellidos: 'García',
    username: 'carmen.garcia',
    cedula: '2233445566',
    rol: 'Asistente',
    isActive: true,
    createdAt: new Date('2024-02-20')
  },
  {
    id: '9',
    nombres: 'Fernando',
    apellidos: 'Torres',
    username: 'fernando.torres',
    cedula: '7788990011',
    rol: 'Secretaria',
    isActive: false,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '10',
    nombres: 'Isabel',
    apellidos: 'Vargas',
    username: 'isabel.vargas',
    cedula: '3344556677',
    rol: 'Asistente',
    isActive: true,
    createdAt: new Date('2024-02-25')
  }
];
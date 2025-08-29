import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Custom auth types for register users and usuarios table
export interface RegisterUser {
  id: string;
  username: string;
  cedula: string;
  type: 'register' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
  // Campos adicionales para usuarios de la tabla usuarios
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface AuthResponse {
  user: RegisterUser | null;
  error: string | null;
}


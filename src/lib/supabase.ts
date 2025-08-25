import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom auth types for register users
export interface RegisterUser {
  id: string;
  username: string;
  cedula: string;
  type: 'register';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: RegisterUser | null;
  error: string | null;
}


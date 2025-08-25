import { supabase, RegisterUser, AuthResponse } from './supabase';

// Custom authentication for register users
export const authService = {
  // Sign in with username and cedula
  async signIn(username: string, cedula: string): Promise<AuthResponse> {
    try {
      // Query the register_users table to find the user
      const { data: users, error } = await supabase
        .from('register_users')
        .select('*')
        .eq('username', username)
        .eq('cedula', cedula)
        .eq('type', 'register')
        .single();

      if (error) {
        return {
          user: null,
          error: 'Usuario no encontrado o credenciales incorrectas'
        };
      }

      if (!users) {
        return {
          user: null,
          error: 'Usuario no encontrado o credenciales incorrectas'
        };
      }

      // Store user in session storage for persistence
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentUser', JSON.stringify(users));
      }

      return {
        user: users as RegisterUser,
        error: null
      };
    } catch (error) {
      console.error('Error during sign in:', error);
      return {
        user: null,
        error: 'Error interno del servidor'
      };
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
  },

  // Get current user from session storage
  getCurrentUser(): RegisterUser | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as RegisterUser;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};


import { supabase, RegisterUser, AuthResponse } from './supabase';

// Custom authentication for register users and Supabase Auth users
export const authService = {
  // Sign in with username/email and password
  async signIn(username: string, password: string): Promise<AuthResponse> {
    try {
      // First, try to authenticate with Supabase Auth (for admin users)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });

      if (authData.user && !authError) {
        // User authenticated with Supabase Auth
        const user: RegisterUser = {
          id: authData.user.id,
          username: username,
          cedula: 'ADMIN',
          type: 'admin',
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at || authData.user.created_at
        };

        // Store user in session storage for persistence
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        return {
          user: user,
          error: null
        };
      }

      // If Supabase Auth fails, try register_users table
      const { data: users, error } = await supabase
        .from('register_users')
        .select('*')
        .eq('username', username)
        .eq('cedula', password) // Using password as cedula for register users
        .eq('type', 'register')
        .single();

      if (error || !users) {
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
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Clear session storage
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
      const user = JSON.parse(userStr);
      // Verificar si es un usuario de la tabla usuarios o register_users
      if (user.type === 'user' || user.type === 'admin' || user.type === 'register') {
        return user as RegisterUser;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.type === 'admin';
  }
};


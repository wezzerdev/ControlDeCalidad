import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole, getPermissionsForRole } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const role = data.role as UserRole;
        // Merge permissions from DB with default role permissions
        // If DB permissions are empty or null, use role defaults
        // This ensures admins always get full access even if DB is empty
        const rolePermissions = getPermissionsForRole(role);
        const dbPermissions = data.permissions || {};
        
        const finalPermissions = { ...rolePermissions, ...dbPermissions };

        const mappedUser: User = {
          id: data.id,
          email: data.email || email,
          name: data.name,
          role: role,
          avatar: data.avatar_url,
          permissions: finalPermissions,
          preferences: data.preferences,
          createdAt: data.created_at,
          lastLogin: data.last_login || new Date().toISOString()
        };
        setUser(mappedUser);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email!);
      }

      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (email: string, pass: string, name: string, role: string = 'tecnico') => {
    try {
      const permissions = getPermissionsForRole(role as UserRole);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            role, // Use provided role or default
            permissions // Store initial permissions
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (data: { name: string; email: string; password: string; department?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'univ_dashboard_token';
const USER_KEY = 'univ_dashboard_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, sessionToken: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      // Also fetch club IDs if they are a rep
      let clubIds: string[] = [];
      if (profile.role === 'club_rep') {
        const { data: reps } = await supabase
          .from('club_reps')
          .select('club_id')
          .eq('user_id', userId);
        clubIds = reps?.map(r => r.club_id) || [];
      }

      const userData: User = {
        ...profile,
        clubIds
      };

      setUser(userData);
      setToken(sessionToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active sessions and sets up the observer
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.access_token);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user && data.session) {
          // fetchProfile will be called by onAuthStateChange
          return { success: true };
        }
        return { success: false, message: 'Authentication failed.' };
      } catch (error: any) {
        return { success: false, message: error.message || 'Invalid email or password.' };
      }
    },
    []
  );

  const registerUser = useCallback(
    async (data: { name: string; email: string; password: string; department?: string }): Promise<{ success: boolean; message?: string }> => {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              department: data.department
            }
          }
        });
        
        if (error) throw error;
        
        if (authData.user) {
          // Trigger handle_new_user should have run.
          // fetchProfile will be called by onAuthStateChange
          return { success: true };
        }
        return { success: false, message: 'Registration failed.' };
      } catch (error: any) {
        return { success: false, message: error.message || 'Registration failure.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          department: updates.department
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updatedProfile };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Failed to update user profile:', err);
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.user.id, session.access_token);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        registerUser,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

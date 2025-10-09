import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type UserRole = 'student' | 'admin' | 'teacher' | 'parent';

interface CustomUser {
  id: string;
  firstName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  customUser?: CustomUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role as UserRole || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  useEffect(() => {
    // Check for custom login user from localStorage
    const checkCustomUser = () => {
      const customUserData = localStorage.getItem('customUser');
      if (customUserData) {
        try {
          const parsedUser: CustomUser = JSON.parse(customUserData);
          setCustomUser(parsedUser);
          setUserRole(parsedUser.role);
          // Create a mock user object for compatibility
          setUser({ id: parsedUser.id, email: `${parsedUser.id}@nrischools.in` } as User);
          setLoading(false);
          return true;
        } catch (e) {
          console.error('Error parsing custom user:', e);
          localStorage.removeItem('customUser');
        }
      }
      return false;
    };

    // Check custom user first
    if (checkCustomUser()) {
      return;
    }

    // Set up auth state listener for Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setCustomUser(null);
        
        // Defer role fetching to prevent deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        setTimeout(() => {
          fetchUserRole(currentSession.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear both Supabase auth and custom login localStorage
      await supabase.auth.signOut();
      localStorage.removeItem('customUser');
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signOut, refreshUserRole, customUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

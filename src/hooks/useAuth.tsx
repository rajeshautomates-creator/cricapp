import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { User, AuthResponse, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasActiveSubscription: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.get<User>('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role?: UserRole) => {
    try {
      const response = await api.post<{ message: string; user: User }>('/auth/register', {
        email,
        password,
        fullName,
        role,
      });

      toast({
        title: 'Account created!',
        description: response.message || 'You can now sign in to your account.'
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error.message || 'Something went wrong'
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken } = response;

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', accessToken);
      }

      setUser(user);

      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.fullName}`
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message || 'Invalid email or password'
      });
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully'
    });
  };

  const value = {
    user,
    session: user ? { user } : null,
    role: user?.role || null,
    loading,
    signUp,
    signIn,
    signOut,
    hasActiveSubscription: user?.hasActiveSubscription || false,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

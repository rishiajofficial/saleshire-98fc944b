
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any; // Profile data from the profiles table
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // This flag helps prevent redirect loops
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("Auth Provider initialized");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', currentSession?.user?.id);
          if (currentSession?.user) {
            // Defer profile fetching to avoid potential auth deadlocks
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          console.log('User signed out');
          // Only redirect to login if not already there and not on public pages
          if (location.pathname !== '/login' && 
              location.pathname !== '/register' && 
              location.pathname !== '/forgot-password' && 
              location.pathname !== '/reset-password' &&
              location.pathname !== '/') {
            navigate('/login');
          }
        }
      }
    );

    // Get the current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
        setInitialAuthCheckComplete(true);
        // Only redirect to login if on protected pages
        if (location.pathname !== '/login' && 
            location.pathname !== '/register' && 
            location.pathname !== '/forgot-password' && 
            location.pathname !== '/reset-password' &&
            location.pathname !== '/') {
          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Fetch user profile data from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First try with direct query (will work with our new security definer functions)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Log the error but don't throw, we'll try an alternative approach
        console.error('Error fetching profile with direct query:', error.message);
        
        // Try with RPC (server function) to bypass RLS if needed
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_my_profile')
          .eq('user_id', userId);
        
        if (rpcError) {
          throw new Error(`Profile fetch failed: ${error.message}, RPC fetch failed: ${rpcError.message}`);
        }
        
        data = rpcData;
      }

      if (data) {
        console.log('Profile fetched:', data);
        setProfile(data);
        
        // Now fetch additional data separately if needed
        if (data.role === 'candidate') {
          const { data: candidateData, error: candidateError } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (!candidateError && candidateData) {
            setProfile(prev => ({ ...prev, candidateData }));
          }
        } else if (data.role === 'manager') {
          const { data: managerData, error: managerError } = await supabase
            .from('managers')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (!managerError && managerData) {
            setProfile(prev => ({ ...prev, managerData }));
          }
        }
      } else {
        throw new Error('Profile not found');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setIsLoading(false);
      setInitialAuthCheckComplete(true);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      setIsLoading(true);
      
      // Proceed with sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }

      if (data?.user) {
        console.log('Sign in successful for user:', data.user.id);
        toast.success('Successfully signed in');
        
        // For admin accounts, we'll directly redirect
        if (email.toLowerCase() === 'admin@example.com') {
          navigate('/dashboard/admin');
          return;
        }
        
        // Get the profile to determine redirection
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile for redirect:', profileError.message);
            // Default redirect if profile can't be fetched
            navigate('/dashboard/candidate');
            return;
          }
          
          console.log('User role:', profileData?.role);
          
          // Redirect based on role
          if (profileData?.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (profileData?.role === 'manager') {
            navigate('/dashboard/manager');
          } else if (profileData?.role === 'hr' || profileData?.role === 'director') {
            navigate('/dashboard/manager');  // HR and Director use the manager dashboard
          } else {
            navigate('/dashboard/candidate');
          }
        } catch (err) {
          console.error('Error during role-based redirect:', err);
          navigate('/dashboard/candidate'); // Fallback redirect
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      console.error('Error signing up:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      console.error('Error signing out:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      await fetchProfile(user?.id as string);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
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

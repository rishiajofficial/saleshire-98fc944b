
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

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

// Create a custom hook for router independent navigation
// This will be used only when a router is available
const useNavigation = () => {
  // Store navigation function that will be set when used within a router
  const navigate = (path: string) => {
    // This is just a placeholder that will be overridden when used in a component with router context
    console.warn("Navigation attempted outside Router context - this is safe to ignore during initialization");
  };

  return { navigate };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();
  const locationRef = useRef(location);
  const { navigate } = useNavigation(); // This is safe as it doesn't actually use router hooks

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // This flag helps prevent redirect loops
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("Auth Provider initialized");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, 'Session:', currentSession);
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
          console.log('AuthContext: SIGNED_OUT event detected. Clearing profile.');
          setProfile(null);
          
          // Handle navigation through window.location instead of useNavigate
          const currentPath = locationRef.current.pathname;
          if (currentPath !== '/login' && 
              currentPath !== '/register' && 
              currentPath !== '/forgot-password' && 
              currentPath !== '/reset-password' &&
              currentPath !== '/') {
            window.location.href = '/login'; // Use direct URL navigation instead of useNavigate
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
        
        // Handle navigation through window.location instead of useNavigate
        const currentPath = locationRef.current.pathname;
        if (currentPath !== '/login' && 
            currentPath !== '/register' && 
            currentPath !== '/forgot-password' && 
            currentPath !== '/reset-password' &&
            currentPath !== '/') {
          window.location.href = '/login'; // Use direct URL navigation instead of useNavigate
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
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
        
        // Get the profile to determine redirection
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile for redirect:', profileError.message);
          // Default redirect using window.location
          window.location.href = '/dashboard/candidate';
          return;
        }
        
        console.log('User role:', profileData?.role);
        
        // Redirect based on role using window.location
        if (profileData?.role === 'admin') {
          window.location.href = '/dashboard/admin';
        } else if (profileData?.role === 'manager') {
          window.location.href = '/dashboard/manager';
        } else if (profileData?.role === 'hr') {
          window.location.href = '/dashboard/hr';
        } else if (profileData?.role === 'director') {
          window.location.href = '/dashboard/director';
        } else {
          window.location.href = '/dashboard/candidate';
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
      window.location.href = '/login'; // Use window.location instead of useNavigate
      
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
      // Clear any stored session data
      sessionStorage.clear();
      localStorage.clear();
      
      // Log session state right before calling Supabase signout
      console.log("AuthContext: Attempting signOut. Current session state:", session);
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthContext: supabase.auth.signOut() error:", error);
        throw error;
      }
      
      // Explicitly reset all auth state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast.success('Successfully signed out');
      // Navigation is handled by onAuthStateChange listener or redirect to login
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      console.error('AuthContext: Error in signOut function wrapper:', error.message);
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

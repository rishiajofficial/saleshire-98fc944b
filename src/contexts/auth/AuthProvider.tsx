import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { AuthContextProps } from './types';
import { cleanupAuthState, fetchUserProfile } from './authUtils';
import { getDashboardRouteByRole } from './authUtils';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Create a custom hook for router independent navigation
// This will be used only when a router is available
const useNavigation = () => {
  // Store navigation function that will be set when used within a router context
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
  
  // Keep location ref updated
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // This flag helps prevent redirect loops
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);
  
  // Flag to track if profile is being fetched to prevent duplicate requests
  const isProfileFetchingRef = useRef<boolean>(false);
  
  useEffect(() => {
    console.log("Auth Provider initialized");
    
    // Set up auth state listener first before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, 'Session:', currentSession?.user?.id);
        
        // Always update session first
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', currentSession?.user?.id);
          if (currentSession?.user && !isProfileFetchingRef.current) {
            // Defer profile fetching to avoid potential auth deadlocks
            isProfileFetchingRef.current = true;
            setTimeout(() => {
              fetchUserProfile(currentSession.user.id).then(profileData => {
                setProfile(profileData);
                isProfileFetchingRef.current = false;
              });
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: SIGNED_OUT event detected. Clearing profile.');
          setProfile(null);
          
          // Only navigate to login if not already on authentication pages
          const currentPath = locationRef.current.pathname;
          if (initialAuthCheckComplete && 
              !currentPath.includes('/login') && 
              !currentPath.includes('/register') && 
              !currentPath.includes('/forgot-password') && 
              !currentPath.includes('/reset-password') &&
              currentPath !== '/' &&
              !currentPath.includes('/careers')) {
            // Just change location once instead of forcing a reload
            window.location.href = '/login';
          }
        }
      }
    );

    // AFTER setting up the listener, check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session check:', currentSession?.user?.id ? 'User is logged in' : 'No active session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id).then(profileData => {
          setProfile(profileData);
          setIsLoading(false);
          setInitialAuthCheckComplete(true);
        });
      } else {
        setIsLoading(false);
        setInitialAuthCheckComplete(true);
        
        // Only redirect if not on public pages and initial check is complete
        const currentPath = locationRef.current.pathname;
        if (currentPath !== '/login' && 
            currentPath !== '/register' && 
            currentPath !== '/forgot-password' && 
            currentPath !== '/reset-password' &&
            currentPath !== '/' &&
            currentPath !== '/careers') {
          window.location.href = '/login';
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      setIsLoading(true);
      
      // Clean up any existing auth state to prevent conflicts
      cleanupAuthState();
      
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
        
        // Redirect based on role using getDashboardRouteByRole utility
        const dashboardRoute = getDashboardRouteByRole(profileData?.role);
        window.location.href = dashboardRoute;
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

  // Sign out function - optimized to prevent multiple refreshes
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext: Attempting signOut. Current session state:", session ? "Active" : "None");

      // Clean up auth state
      cleanupAuthState();
      
      // Only call supabase.auth.signOut once and handle the redirection directly
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
      
      // Use replace instead of href to prevent additional history entries
      window.location.replace('/login');
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

      // Fetch the updated profile
      const updatedProfile = await fetchUserProfile(user?.id as string);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
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

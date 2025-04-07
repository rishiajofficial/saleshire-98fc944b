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

  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("Auth Provider initialized");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', currentSession?.user?.id);
          if (currentSession?.user) {
            if (currentSession.user.email === 'admin@example.com') {
              setProfile({
                id: currentSession.user.id,
                role: 'admin',
                email: 'admin@example.com',
                name: 'Administrator',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              setIsLoading(false);
              return;
            }
            
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          console.log('User signed out');
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

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        if (currentSession.user.email === 'admin@example.com') {
          setProfile({
            id: currentSession.user.id,
            role: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setIsLoading(false);
          setInitialAuthCheckComplete(true);
          return;
        }
        
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
        setInitialAuthCheckComplete(true);
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (directError) {
        console.error('Error with direct query:', directError.message);
        
        const { data: isAdminData, error: isAdminError } = await supabase
          .rpc('is_admin', { user_id: userId });
          
        if (!isAdminError && isAdminData === true) {
          setProfile({
            id: userId,
            role: 'admin',
            email: user?.email || '',
            name: 'Administrator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          console.error('No profile data found and not admin');
        }
      } else if (directData) {
        setProfile(directData);
      }
      
      await fetchAdditionalProfileData(userId);
      
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setIsLoading(false);
      setInitialAuthCheckComplete(true);
    }
  };

  const fetchAdditionalProfileData = async (userId: string) => {
    if (!profile) return;
    
    try {
      if (profile.role === 'candidate') {
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!candidateError && candidateData) {
          setProfile(prev => ({ ...prev, candidateData }));
        }
      } else if (profile.role === 'manager' || profile.role === 'hr' || profile.role === 'director') {
        const { data: managerData, error: managerError } = await supabase
          .from('managers')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!managerError && managerData) {
          setProfile(prev => ({ ...prev, managerData }));
        }
      }
    } catch (error) {
      console.error('Error fetching additional profile data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      setIsLoading(true);
      
      if (email.toLowerCase() === 'admin@example.com') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Admin sign in error:', error.message);
          throw error;
        }

        if (data?.user) {
          console.log('Admin sign in successful');
          setProfile({
            id: data.user.id,
            role: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          toast.success('Successfully signed in as admin');
          navigate('/dashboard/admin');
          return;
        }
      }
      
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
        
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile for redirect:', profileError.message);
            navigate('/dashboard/candidate');
            return;
          }
          
          console.log('User role:', profileData?.role);
          
          if (profileData?.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (profileData?.role === 'manager') {
            navigate('/dashboard/manager');
          } else if (profileData?.role === 'hr') {
            navigate('/dashboard/hr');
          } else if (profileData?.role === 'director') {
            navigate('/dashboard/director');
          } else {
            navigate('/dashboard/candidate');
          }
        } catch (err) {
          console.error('Error during role-based redirect:', err);
          navigate('/dashboard/candidate');
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

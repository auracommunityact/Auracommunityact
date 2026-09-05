import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Fallback for manually created Uppercase table
      if (error && error.code === 'PGRST205') {
        const fallback = await supabase
          .from('Profiles')
          .select('*')
          .eq('id', userId)
          .single();
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else if (error && error.code === 'PGRST116') {
        // If profile row doesn't exist but user is authenticated, 
        // create a minimal fallback profile state to prevent locking the user out.
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        setProfile({
          id: userId,
          full_name: freshUser?.user_metadata?.full_name || 'User',
          username: freshUser?.user_metadata?.username || 'user',
          email: freshUser?.email || '',
          country: '',
          age_group: '',
          role: '',
          skills_interests: '',
          about: '',
          status: 'not_applied',
          created_at: new Date().toISOString()
        } as Profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Use a single initialization source of truth to avoid race conditions
    // onAuthStateChange fires an INITIAL_SESSION event automatically on mount in newer Supabase versions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Fallback: manually fetch session just in case INITIAL_SESSION doesn't fire immediately
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted && loading) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching session manually", err);
        if (mounted) setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.email === 'auracommunityact@gmail.com' || profile?.is_admin === true;

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

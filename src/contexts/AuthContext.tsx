import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AppUser {
  id: string;
  name: string;
  email: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const toAppUser = (supaUser: User, displayName?: string): AppUser => ({
  id: supaUser.id,
  name: displayName || supaUser.user_metadata?.display_name || "User",
  email: supaUser.email ?? null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const storedName = localStorage.getItem("app_display_name");
          setUser(toAppUser(session.user, storedName || undefined));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const storedName = localStorage.getItem("app_display_name");
        setUser(toAppUser(session.user, storedName || undefined));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (name: string) => {
    // Store display name
    localStorage.setItem("app_display_name", name);

    // Check if already signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(toAppUser(session.user, name));
      return;
    }

    // Sign in anonymously so RLS policies work
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user) {
      // Store name in user metadata
      await supabase.auth.updateUser({ data: { display_name: name } });
      setUser(toAppUser(data.user, name));
    }
  };

  const signOut = async () => {
    localStorage.removeItem("app_display_name");
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

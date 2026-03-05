import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AppUser {
  id: string;
  name: string;
  email: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("app_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = (name: string) => {
    // Generate a stable UUID for this user
    let id = localStorage.getItem("app_user_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("app_user_id", id);
    }
    const appUser: AppUser = { id, name, email: null };
    localStorage.setItem("app_user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const signOut = () => {
    localStorage.removeItem("app_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

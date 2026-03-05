import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AppUser {
  name: string;
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
    const stored = localStorage.getItem("app_user_name");
    if (stored) {
      setUser({ name: stored });
    }
    setLoading(false);
  }, []);

  const signIn = (name: string) => {
    localStorage.setItem("app_user_name", name);
    setUser({ name });
  };

  const signOut = () => {
    localStorage.removeItem("app_user_name");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

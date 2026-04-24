import { useContext, createContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    // Demo: Create user session
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (email: string, password: string) => {
    // Simulate API call
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Demo: Create user account
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

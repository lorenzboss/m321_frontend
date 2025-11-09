import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const GAME_SERVICE_URL =
  (import.meta as any).env.VITE_GAME_SERVICE_URL || "http://localhost:8001";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth status on mount
  useEffect(() => {
    checkAuthStatus();
    setIsLoading(false);
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${GAME_SERVICE_URL}/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Auth check success:", data);

        if (data.user) {
          setUser({
            id: data.user.id,
            username: data.user.username,
          });
          setIsAuthenticated(true);
          return true;
        }
      }

      // If we get here, authentication failed
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${GAME_SERVICE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Login success:", data);

        // Set user data
        setUser({
          id: data.user.id,
          username: data.user.username,
        });
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${GAME_SERVICE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log("Registration success:", data);

        // Set user data
        setUser({
          id: data.user.id,
          username: data.user.username,
        });
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // Call logout endpoint to clear cookie on server
    fetch(`${GAME_SERVICE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.error("Logout error:", err));
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

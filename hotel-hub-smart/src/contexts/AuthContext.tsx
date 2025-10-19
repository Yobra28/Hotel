import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import authService, { User as ApiUser, RegisterData, LoginData } from "@/services/authService";

// Create a compatible User interface for the frontend
export interface User {
  _id: string;
  id?: string; // For backward compatibility
  firstName: string;
  lastName: string;
  name?: string; // Computed from firstName + lastName
  email: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  department?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "admin" | "receptionist" | "housekeeping" | "guest";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert API user to frontend user
const convertApiUser = (apiUser: ApiUser): User => {
  return {
    ...apiUser,
    id: apiUser._id, // Add id for backward compatibility
    name: `${apiUser.firstName} ${apiUser.lastName}`, // Compute full name
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            const frontendUser = convertApiUser(storedUser);
            setUser(frontendUser);
            
            // Optionally verify with server
            try {
              const { user: currentUser } = await authService.getCurrentUser();
              const convertedUser = convertApiUser(currentUser);
              setUser(convertedUser);
              // Update stored user data
              localStorage.setItem('hotelUser', JSON.stringify(currentUser));
            } catch (error) {
              // Token might be expired, user will need to login again
              console.log('Token verification failed:', error);
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials: LoginData = { email, password };
      if (role) {
        credentials.role = role;
      }
      
      const response = await authService.login(credentials);
      const convertedUser = convertApiUser(response.data.user);
      setUser(convertedUser);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      const convertedUser = convertApiUser(response.data.user);
      setUser(convertedUser);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(data);
      const convertedUser = convertApiUser(response.user);
      setUser(convertedUser);
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      // After password change, user typically needs to login again
    } catch (error: any) {
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
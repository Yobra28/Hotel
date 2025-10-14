import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "receptionist" | "housekeeping" | "guest";

// Demo users - these are pre-created for demonstration purposes
const DEMO_USERS = [
  {
    id: "admin-1",
    firstName: "Super",
    lastName: "Admin",
    name: "Super Admin",
    email: "admin@hotel.com",
    role: "admin" as UserRole,
    phone: "+254 700 000 000",
    idNumber: "ADMIN001",
    department: "Management",
    password: "admin123" // In real app, this would be hashed
  },
  {
    id: "admin-2", 
    firstName: "Hotel",
    lastName: "Manager",
    name: "Hotel Manager",
    email: "manager@hotel.com",
    role: "admin" as UserRole,
    phone: "+254 700 000 001",
    idNumber: "ADMIN002",
    department: "Management",
    password: "manager123"
  },
  {
    id: "receptionist-1",
    firstName: "Sarah",
    lastName: "Johnson",
    name: "Sarah Johnson",
    email: "receptionist@hotel.com",
    role: "receptionist" as UserRole,
    phone: "+254 700 000 002",
    idNumber: "REC001",
    department: "Front Desk",
    password: "receptionist123"
  },
  {
    id: "housekeeping-1",
    firstName: "Mary",
    lastName: "Wanjiku",
    name: "Mary Wanjiku",
    email: "housekeeping@hotel.com",
    role: "housekeeping" as UserRole,
    phone: "+254 700 000 003",
    idNumber: "HSK001",
    department: "Housekeeping",
    password: "housekeeping123"
  },
  {
    id: "guest-1",
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    email: "guest@hotel.com",
    role: "guest" as UserRole,
    phone: "+254 700 000 004",
    idNumber: "GUEST001",
    department: undefined,
    password: "guest123"
  }
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  department?: string;
  token?: string;
  refreshToken?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole; // Optional, defaults to 'guest' for public registration
  phone: string;
  idNumber: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  // User Management (Admin only)
  createUser: (data: RegisterData) => Promise<User>;
  updateUser: (userId: string, data: Partial<RegisterData>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("hotelUser");
      const storedToken = localStorage.getItem("hotelToken");
      const storedRefreshToken = localStorage.getItem("hotelRefreshToken");
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, token: storedToken, refreshToken: storedRefreshToken || undefined });
        
        // Check if token is expired and refresh if needed
        if (storedRefreshToken) {
          const tokenValid = await checkTokenValidity(storedToken);
          if (!tokenValid) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        }
      }
    };

    initializeAuth();
  }, []);

  const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
      // Simulate token validation - in real app, decode JWT and check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let userFound: User | null = null;
      
      // First, check demo users
      const demoUser = DEMO_USERS.find(user => 
        user.email === email && user.password === password
      );
      if (demoUser) {
        userFound = {
          id: demoUser.id,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          phone: demoUser.phone,
          idNumber: demoUser.idNumber,
          department: demoUser.department,
          token: "mock.jwt.token",
          refreshToken: "mock.refresh.token",
        };
      }
      
      // If not found in demo users, check created users (receptionist/housekeeping)
      if (!userFound) {
        const existingUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
        const createdUser = existingUsers.find((u: any) => 
          u.email === email && (u.role === "receptionist" || u.role === "housekeeping")
        );
        if (createdUser) {
          userFound = {
            ...createdUser,
            token: "mock.jwt.token",
            refreshToken: "mock.refresh.token",
          };
        }
      }
      
      // If not found in created users, check guest users
      if (!userFound) {
        const existingGuests = JSON.parse(localStorage.getItem("hotelGuests") || "[]");
        const guestUser = existingGuests.find((g: any) => 
          g.email === email && g.role === "guest"
        );
        if (guestUser) {
          userFound = {
            ...guestUser,
            token: "mock.jwt.token",
            refreshToken: "mock.refresh.token",
          };
        }
      }
      
      // If role is specified and found user doesn't match, reject
      if (userFound && role && userFound.role !== role) {
        throw new Error("Invalid credentials for this login type");
      }
      
      if (!userFound) {
        throw new Error("Invalid credentials");
      }
      
      setUser(userFound);
      localStorage.setItem("hotelUser", JSON.stringify(userFound));
      localStorage.setItem("hotelToken", userFound.token!);
      localStorage.setItem("hotelRefreshToken", userFound.refreshToken!);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Default role to 'guest' for public registration
      const userRole = data.role || "guest";
      
      const newUser: User = {
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: userRole,
        phone: data.phone,
        idNumber: data.idNumber,
        department: data.department,
        token: "mock.jwt.token",
        refreshToken: "mock.refresh.token",
      };
      
      // Store user in appropriate location based on role
      if (userRole === "guest") {
        // Store guest users separately
        const existingGuests = JSON.parse(localStorage.getItem("hotelGuests") || "[]");
        existingGuests.push(newUser);
        localStorage.setItem("hotelGuests", JSON.stringify(existingGuests));
      } else if (userRole === "receptionist" || userRole === "housekeeping") {
        // Staff users created by admin
        const existingUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
        existingUsers.push(newUser);
        localStorage.setItem("hotelUsers", JSON.stringify(existingUsers));
      }
      
      setUser(newUser);
      localStorage.setItem("hotelUser", JSON.stringify(newUser));
      localStorage.setItem("hotelToken", newUser.token!);
      localStorage.setItem("hotelRefreshToken", newUser.refreshToken!);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("hotelRefreshToken");
      if (!storedRefreshToken) return false;

      // Simulate API call to refresh token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newToken = "new.mock.jwt.token";
      const newRefreshToken = "new.mock.refresh.token";
      
      if (user) {
        const updatedUser = { ...user, token: newToken, refreshToken: newRefreshToken };
        setUser(updatedUser);
        localStorage.setItem("hotelUser", JSON.stringify(updatedUser));
        localStorage.setItem("hotelToken", newToken);
        localStorage.setItem("hotelRefreshToken", newRefreshToken);
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hotelUser");
    localStorage.removeItem("hotelToken");
    localStorage.removeItem("hotelRefreshToken");
  };

  // User Management Functions (Admin only)
  const createUser = async (data: RegisterData): Promise<User> => {
    if (user?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can create users");
    }
    
    // Only allow creating receptionist and housekeeping roles
    if (!data.role || (data.role !== "receptionist" && data.role !== "housekeeping")) {
      throw new Error("Admin can only create receptionist and housekeeping users");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        phone: data.phone,
        idNumber: data.idNumber,
        department: data.department,
      };
      
      // Store users in localStorage for demo
      const existingUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
      existingUsers.push(newUser);
      localStorage.setItem("hotelUsers", JSON.stringify(existingUsers));
      
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, data: Partial<RegisterData>): Promise<User> => {
    if (user?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can update users");
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
      const userIndex = existingUsers.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      const updatedUser = {
        ...existingUsers[userIndex],
        ...data,
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : existingUsers[userIndex].name,
      };
      
      existingUsers[userIndex] = updatedUser;
      localStorage.setItem("hotelUsers", JSON.stringify(existingUsers));
      
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (user?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can delete users");
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
      const filteredUsers = existingUsers.filter((u: User) => u.id !== userId);
      localStorage.setItem("hotelUsers", JSON.stringify(filteredUsers));
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (user?.role !== "admin") {
      throw new Error("Unauthorized: Only admin can view all users");
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Combine demo users with created users
    const createdUsers = JSON.parse(localStorage.getItem("hotelUsers") || "[]");
    const demoStaffUsers = DEMO_USERS.filter(user => user.role !== "guest").map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      idNumber: user.idNumber,
      department: user.department,
    }));
    const allUsers = [
      ...demoStaffUsers,
      ...createdUsers
    ];
    
    return allUsers;
  };

  const canManageUsers = (): boolean => {
    return user?.role === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        createUser,
        updateUser,
        deleteUser,
        getAllUsers,
        canManageUsers,
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

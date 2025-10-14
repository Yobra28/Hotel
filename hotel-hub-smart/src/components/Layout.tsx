import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Calendar,
  Receipt,
  Sparkles,
  BarChart3,
  LogOut,
  Hotel,
  UserCog,
  UserPlus,
  ChefHat,
  Waves,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "receptionist", "housekeeping"] },
    { name: "Rooms", href: "/rooms", icon: BedDouble, roles: ["admin", "receptionist"] },
    { name: "Guests", href: "/guests", icon: Users, roles: ["admin", "receptionist"] },
    { name: "Bookings", href: "/bookings", icon: Calendar, roles: ["admin", "receptionist"] },
    { name: "Billing", href: "/billing", icon: Receipt, roles: ["admin", "receptionist"] },
    { name: "Food Ordering", href: "/food-ordering", icon: ChefHat, roles: ["admin", "receptionist"] },
    { name: "Swimming & Activities", href: "/swimming-activities", icon: Waves, roles: ["admin", "receptionist"] },
    { name: "Housekeeping", href: "/housekeeping", icon: Sparkles, roles: ["admin", "housekeeping"] },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin"] },
    { name: "User Management", href: "/users", icon: UserCog, roles: ["admin"] },
  ];

  const filteredNavigation = navigation.filter((item) => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Hotel className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Smart Hotel</h1>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

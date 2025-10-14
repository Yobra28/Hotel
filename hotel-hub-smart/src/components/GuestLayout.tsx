import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  User,
  LogOut,
  Hotel,
  Search,
  MessageCircle,
  Star,
  Receipt,
  ChefHat,
  Waves,
} from "lucide-react";

interface GuestLayoutProps {
  children: ReactNode;
}

export const GuestLayout = ({ children }: GuestLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    { name: "Overview", href: "/guest-dashboard", icon: LayoutDashboard, id: "overview" },
    { name: "Book Rooms", href: "/guest-dashboard", icon: Search, id: "bookings" },
    { name: "My Bookings", href: "/guest-dashboard", icon: Calendar, id: "mybookings" },
    { name: "Food Ordering", href: "/guest-dashboard", icon: ChefHat, id: "food-ordering" },
    { name: "Swimming & Activities", href: "/guest-dashboard", icon: Waves, id: "swimming-activities" },
    { name: "Payments", href: "/guest-dashboard", icon: CreditCard, id: "payments" },
    { name: "Profile", href: "/guest-dashboard", icon: User, id: "profile" },
  ];

  const handleNavigation = (item: any) => {
    if (item.href === "/guest-dashboard") {
      // For dashboard sections, we'll use URL hash or pass state
      navigate("/guest-dashboard", { state: { activeTab: item.id } });
      // Trigger a custom event to change tabs
      window.dispatchEvent(new CustomEvent("changeGuestTab", { detail: { tab: item.id } }));
    } else {
      navigate(item.href);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Hotel className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Smart Hotel</h1>
              <p className="text-xs text-muted-foreground">Guest Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            // For guest dashboard sections, we'll consider it active based on current path
            const isActive = location.pathname === "/guest-dashboard" && item.href === "/guest-dashboard";
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(item)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.dispatchEvent(new CustomEvent("changeGuestTab", { detail: { tab: "bookings" } }))}
              >
                <Search className="h-3 w-3 mr-2" />
                Browse Rooms
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.dispatchEvent(new CustomEvent("changeGuestTab", { detail: { tab: "payments" } }))}
              >
                <Receipt className="h-3 w-3 mr-2" />
                View Bills
              </Button>
            </div>
          </div>
        </div>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-border">
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Guest Member</span>
            </div>
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
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BedDouble, Users, DollarSign, TrendingUp, Calendar, Clock, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import roomService from "@/services/roomService";
import bookingService from "@/services/bookingService";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    currentGuests: 0,
    totalRevenue: 0,
    recentBookings: [] as any[]
  });
  
  // Redirect guest users to guest dashboard
  useEffect(() => {
    if (!user) return;
    if (user.role === "guest") {
      navigate("/guest-dashboard");
      return;
    }
    // Load data for admin/receptionist/housekeeping
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getTransformedRooms(),
        bookingService.getAllBookings()
      ]);
      
      setRooms(roomsData);
      setBookings(bookingsData.map(booking => bookingService.transformBooking(booking)));
      
      // Calculate metrics
      const totalRooms = roomsData.length;
      const availableRooms = roomsData.filter(r => r.status === "available").length;
      const occupiedRooms = roomsData.filter(r => r.status === "occupied").length;
      const cleaningRooms = roomsData.filter(r => r.status === "cleaning").length;
      const maintenanceRooms = roomsData.filter(r => r.status === "maintenance").length;
      const currentGuests = bookingsData.filter(b => b.status === "checked_in").length;
      const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
      const recentBookings = bookingsData.slice(0, 5);
      
      setDashboardMetrics({
        totalRooms,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        maintenanceRooms,
        currentGuests,
        totalRevenue,
        recentBookings
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const roomsByStatus = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roomStatusData = [
    { name: "Available", value: dashboardMetrics.availableRooms, color: "#10b981" },
    { name: "Occupied", value: dashboardMetrics.occupiedRooms, color: "#ef4444" },
    { name: "Cleaning", value: dashboardMetrics.cleaningRooms, color: "#f59e0b" },
    { name: "Maintenance", value: dashboardMetrics.maintenanceRooms, color: "#6b7280" },
  ];
  
  // Mock revenue data for chart (would come from API in real app)
  const mockRevenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const getRoleBasedMetrics = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            title: "Total Revenue",
            value: `KES ${(dashboardMetrics.totalRevenue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            trend: "+12% this month",
            trendUp: true,
          },
          {
            title: "Total Rooms",
            value: dashboardMetrics.totalRooms,
            icon: BedDouble,
            trend: "+2 this month",
            trendUp: true,
          },
          {
            title: "Current Guests",
            value: dashboardMetrics.currentGuests,
            icon: Users,
            trend: "+15% this week",
            trendUp: true,
          },
          {
            title: "Occupancy Rate",
            value: `${dashboardMetrics.totalRooms > 0 ? ((dashboardMetrics.occupiedRooms / dashboardMetrics.totalRooms) * 100).toFixed(0) : 0}%`,
            icon: TrendingUp,
            trend: "85% target",
            trendUp: true,
          },
        ];
      case "receptionist":
        return [
          {
            title: "Available Rooms",
            value: dashboardMetrics.availableRooms,
            icon: BedDouble,
            trend: `${dashboardMetrics.totalRooms > 0 ? ((dashboardMetrics.availableRooms / dashboardMetrics.totalRooms) * 100).toFixed(0) : 0}% available`,
            trendUp: true,
          },
          {
            title: "Current Guests",
            value: dashboardMetrics.currentGuests,
            icon: Users,
            trend: "Checked in guests",
            trendUp: true,
          },
          {
            title: "Pending Bookings",
            value: bookings.filter(b => b.status === "confirmed").length,
            icon: Calendar,
            trend: "Needs attention",
            trendUp: false,
          },
          {
            title: "Revenue Today",
            value: `KES ${(dashboardMetrics.totalRevenue / 30).toFixed(0)}K`,
            icon: DollarSign,
            trend: "+8% vs yesterday",
            trendUp: true,
          },
        ];
      case "housekeeping":
        return [
          {
            title: "Pending Tasks",
            value: 0, // Would come from housekeeping API
            icon: Clock,
            trend: "High priority: 0",
            trendUp: false,
          },
          {
            title: "Completed Today",
            value: 0, // Would come from housekeeping API
            icon: CheckCircle,
            trend: "Good progress!",
            trendUp: true,
          },
          {
            title: "Rooms to Clean",
            value: dashboardMetrics.cleaningRooms,
            icon: BedDouble,
            trend: "In progress",
            trendUp: false,
          },
          {
            title: "Maintenance Needed",
            value: dashboardMetrics.maintenanceRooms,
            icon: AlertTriangle,
            trend: "Report issues",
            trendUp: false,
          },
        ];
      case "guest":
        // This shouldn't normally be reached as guests are redirected, but just in case
        return [
          {
            title: "My Bookings",
            value: "2",
            icon: Calendar,
            trend: "Active reservation",
            trendUp: true,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your {user?.role} dashboard overview
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === "admin" && (
              <>
                <Button onClick={() => navigate("/reports")} variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button onClick={() => navigate("/rooms")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </>
            )}
            {user?.role === "receptionist" && (
              <Button onClick={() => navigate("/bookings")}>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            )}
            {user?.role === "housekeeping" && (
              <Button onClick={() => navigate("/housekeeping")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            )}
          </div>
        </div>

        {/* Role-based Metrics */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getRoleBasedMetrics().map((metric, index) => (
            <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
                trendUp={metric.trendUp}
              />
            ))}
          </div>
        )}

        {/* Charts and Analytics */}
        {user?.role === "admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KES ${value}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Room Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roomStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Status Overview */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Room Status Overview</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/rooms")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(roomsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <StatusBadge status={status as any} />
                      <span className="font-semibold">{count} Rooms</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardMetrics.recentBookings.length > 0 ? (
                    dashboardMetrics.recentBookings.map((booking) => {
                      const room = rooms.find(r => r.id === booking.roomId);
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{booking.guestDetails?.firstName} {booking.guestDetails?.lastName}</p>
                            <p className="text-sm text-muted-foreground">Room {room?.number || 'N/A'}</p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent bookings</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Housekeeping Tasks for Housekeeping Role */}
        {user?.role === "housekeeping" && (
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Tasks</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/housekeeping")}>
                View All Tasks
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-muted-foreground text-center py-8">
                  Housekeeping tasks integration pending
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

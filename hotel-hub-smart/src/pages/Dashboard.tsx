import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockRooms, mockGuests, mockBookings, mockHousekeepingTasks, mockRevenueData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { BedDouble, Users, DollarSign, TrendingUp, Calendar, Clock, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect guest users to guest dashboard
  useEffect(() => {
    if (!user) return;
    if (user.role === "guest") {
      navigate("/guest-dashboard");
      return;
    }
    // Receptionists stay on /dashboard by default
  }, [user, navigate]);
  
  const totalRooms = mockRooms.length;
  const availableRooms = mockRooms.filter(r => r.status === "available").length;
  const occupiedRooms = mockRooms.filter(r => r.status === "occupied").length;
  const cleaningRooms = mockRooms.filter(r => r.status === "cleaning").length;
  const currentGuests = mockGuests.length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const pendingTasks = mockHousekeepingTasks.filter(t => t.status === "pending").length;
  const completedTasks = mockHousekeepingTasks.filter(t => t.status === "completed").length;

  const recentBookings = mockBookings.slice(0, 5);
  const roomsByStatus = mockRooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roomStatusData = [
    { name: "Available", value: availableRooms, color: "#10b981" },
    { name: "Occupied", value: occupiedRooms, color: "#ef4444" },
    { name: "Cleaning", value: cleaningRooms, color: "#f59e0b" },
    { name: "Maintenance", value: mockRooms.filter(r => r.status === "maintenance").length, color: "#6b7280" },
  ];

  const getRoleBasedMetrics = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            title: "Total Revenue",
            value: `KES ${(totalRevenue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            trend: "+12% this month",
            trendUp: true,
          },
          {
            title: "Total Rooms",
            value: totalRooms,
            icon: BedDouble,
            trend: "+2 this month",
            trendUp: true,
          },
          {
            title: "Current Guests",
            value: currentGuests,
            icon: Users,
            trend: "+15% this week",
            trendUp: true,
          },
          {
            title: "Occupancy Rate",
            value: `${((occupiedRooms / totalRooms) * 100).toFixed(0)}%`,
            icon: TrendingUp,
            trend: "85% target",
            trendUp: true,
          },
        ];
      case "receptionist":
        return [
          {
            title: "Available Rooms",
            value: availableRooms,
            icon: BedDouble,
            trend: `${((availableRooms / totalRooms) * 100).toFixed(0)}% available`,
            trendUp: true,
          },
          {
            title: "Current Guests",
            value: currentGuests,
            icon: Users,
            trend: "Check-ins today: 3",
            trendUp: true,
          },
          {
            title: "Pending Bookings",
            value: mockBookings.filter(b => b.status === "confirmed").length,
            icon: Calendar,
            trend: "Needs attention",
            trendUp: false,
          },
          {
            title: "Revenue Today",
            value: `KES ${(totalRevenue / 30).toFixed(0)}K`,
            icon: DollarSign,
            trend: "+8% vs yesterday",
            trendUp: true,
          },
        ];
      case "housekeeping":
        return [
          {
            title: "Pending Tasks",
            value: pendingTasks,
            icon: Clock,
            trend: "High priority: 2",
            trendUp: false,
          },
          {
            title: "Completed Today",
            value: completedTasks,
            icon: CheckCircle,
            trend: "Good progress!",
            trendUp: true,
          },
          {
            title: "Rooms to Clean",
            value: cleaningRooms,
            icon: BedDouble,
            trend: "In progress: 1",
            trendUp: false,
          },
          {
            title: "Maintenance Needed",
            value: mockRooms.filter(r => r.status === "maintenance").length,
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
              <div className="space-y-4">
                {Object.entries(roomsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge status={status as any} />
                    <span className="font-semibold">{count} Rooms</span>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const guest = mockGuests.find(g => g.id === booking.guestId);
                  const room = mockRooms.find(r => r.id === booking.roomId);
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{guest?.name}</p>
                        <p className="text-sm text-muted-foreground">Room {room?.number}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  );
                })}
              </div>
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
                {mockHousekeepingTasks.slice(0, 5).map((task) => {
                  const room = mockRooms.find(r => r.id === task.roomId);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Room {room?.number}</p>
                        <p className="text-sm text-muted-foreground">
                          Priority: {task.priority} • Assigned: {task.assignedTo}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

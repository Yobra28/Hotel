import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockRevenueData, mockOccupancyData, mockRooms, mockBookings, mockGuests, mockHousekeepingTasks } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, Users, DollarSign, Download, Calendar, Filter, FileText, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

const Reports = () => {
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("6months");
  const [reportType, setReportType] = useState("overview");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Only allow admins to access this page
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access reports and analytics.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Calculate comprehensive metrics
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPending = mockBookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
  const averageOccupancy = mockOccupancyData.reduce((sum, d) => sum + d.occupancy, 0) / mockOccupancyData.length;
  const totalBookings = mockBookings.length;
  const availableRooms = mockRooms.filter((r) => r.status === "available").length;
  const occupiedRooms = mockRooms.filter((r) => r.status === "occupied").length;
  const cleaningRooms = mockRooms.filter((r) => r.status === "cleaning").length;
  const totalGuests = mockGuests.length;
  const activeGuests = mockGuests.filter(g => {
    const booking = mockBookings.find(b => b.guestId === g.id && b.status === "checked-in");
    return booking;
  }).length;
  const pendingTasks = mockHousekeepingTasks.filter(t => t.status === "pending").length;
  const completedTasks = mockHousekeepingTasks.filter(t => t.status === "completed").length;

  // Room status data for pie chart
  const roomStatusData = [
    { name: "Available", value: availableRooms, color: "#10b981" },
    { name: "Occupied", value: occupiedRooms, color: "#f59e0b" },
    { name: "Cleaning", value: cleaningRooms, color: "#3b82f6" },
    { name: "Maintenance", value: mockRooms.filter(r => r.status === "maintenance").length, color: "#ef4444" },
  ];

  // Booking status data
  const bookingStatusData = [
    { name: "Confirmed", value: mockBookings.filter(b => b.status === "confirmed").length, color: "#3b82f6" },
    { name: "Checked-in", value: mockBookings.filter(b => b.status === "checked-in").length, color: "#10b981" },
    { name: "Checked-out", value: mockBookings.filter(b => b.status === "checked-out").length, color: "#6b7280" },
    { name: "Cancelled", value: mockBookings.filter(b => b.status === "cancelled").length, color: "#ef4444" },
  ];

  const handleExportReport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const generateFinancialReport = () => {
    toast.success("Financial report generated successfully!");
  };

  const generateOperationalReport = () => {
    toast.success("Operational report generated successfully!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateFinancialReport}>
              <FileText className="h-4 w-4 mr-2" />
              Financial Report
            </Button>
            <Button variant="outline" onClick={generateOperationalReport}>
              <Calendar className="h-4 w-4 mr-2" />
              Operational Report
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label>Report Period</Label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportPeriod === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="guest">Guest Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">KES {(totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-success mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last period
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Occupancy</p>
                  <p className="text-3xl font-bold mt-2">{averageOccupancy.toFixed(0)}%</p>
                  <p className="text-sm text-success mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5% from last period
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-3xl font-bold mt-2">{totalBookings}</p>
                  <p className="text-sm text-muted-foreground mt-2">This period</p>
                </div>
                <Calendar className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Revenue</p>
                  <p className="text-3xl font-bold mt-2">KES {(totalPending / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-warning mt-2">Outstanding</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Guests</p>
                  <p className="text-3xl font-bold mt-2">{activeGuests}</p>
                  <p className="text-sm text-muted-foreground mt-2">Currently checked-in</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Room Status</p>
                  <p className="text-3xl font-bold mt-2">{occupiedRooms}/{mockRooms.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Occupied/Total</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cleaning Tasks</p>
                  <p className="text-3xl font-bold mt-2">{pendingTasks}</p>
                  <p className="text-sm text-muted-foreground mt-2">Pending</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-3xl font-bold mt-2">{completedTasks}</p>
                  <p className="text-sm text-success mt-2">This period</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`KES ${value}K`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockOccupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                  <Line type="monotone" dataKey="occupancy" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    fill="#8884d8"
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

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookings.slice(0, 5).map((booking) => {
                const guest = mockGuests.find(g => g.id === booking.guestId);
                const room = mockRooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{guest?.name} checked in to Room {room?.number}</p>
                        <p className="text-sm text-muted-foreground">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KES {booking.totalAmount}</p>
                      <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

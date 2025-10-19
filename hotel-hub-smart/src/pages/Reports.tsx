import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, Users, DollarSign, Download, Calendar, Filter, FileText, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import analyticsService, { AnalyticsMetrics, RevenueData, OccupancyData } from "@/services/analyticsService";
import bookingService from "@/services/bookingService";
import roomService from "@/services/roomService";
import guestService from "@/services/guestService";
import menuService from "@/services/menuService";
import housekeepingService from "@/services/housekeepingService";

const Reports = () => {
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("6months");
  const [reportType, setReportType] = useState("overview");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);

// Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [reportPeriod, startDate, endDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch datasets
      const [bookings, rooms, guests, orders, tasks] = await Promise.all([
        bookingService.getAllBookings(),
        roomService.getAllRooms(),
        guestService.getAllGuests(),
        menuService.getAllOrders().catch(() => []),
        housekeepingService.listTasks().catch(() => []),
      ]);

      // Compute totals
      const completedPaymentsSum = bookings.reduce((sum, b: any) => {
        const paid = (b.payments || []).filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + p.amount, 0);
        return sum + paid;
      }, 0);
      const totalAmountSum = bookings.reduce((sum, b: any) => sum + (b.pricing?.totalAmount || 0), 0);
      const pendingSum = Math.max(totalAmountSum - completedPaymentsSum, 0);

      const roomStatusCounts = rooms.reduce((acc: any, r: any) => {
        const s = r.status;
        acc.total = (acc.total || 0) + 1;
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {} as any);

      // Normalize booking statuses
      const normalize = (s: string) => s.replace('-', '_');
      const bookingStatsCounts = bookings.reduce((acc: any, b: any) => {
        const s = normalize(b.status);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {} as any);

      // Active guests: checked_in bookings' unique guest IDs
      const activeGuestSet = new Set(bookings.filter((b: any) => normalize(b.status) === 'checked_in').map((b: any) => b.guest));

      // Revenue trends by month (KES)
      const revenueByMonth = new Map<string, { revenue: number; bookings: number }>();
      bookings.forEach((b: any) => {
        const month = new Date(b.createdAt).toLocaleString('en-US', { month: 'short' });
        const paid = (b.payments || []).filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + p.amount, 0);
        const cur = revenueByMonth.get(month) || { revenue: 0, bookings: 0 };
        cur.revenue += paid;
        cur.bookings += 1;
        revenueByMonth.set(month, cur);
      });
      const revenueArr: RevenueData[] = Array.from(revenueByMonth.entries()).map(([month, v]) => ({ month, revenue: v.revenue, bookings: v.bookings, occupancy: 0 }));

      // Occupancy trend by month: (occupied rooms / total rooms) approx via bookings with status checked_in per month
      const occByMonth = new Map<string, number>();
      bookings.forEach((b: any) => {
        const month = new Date(b.createdAt).toLocaleString('en-US', { month: 'short' });
        const occ = occByMonth.get(month) || 0;
        const isOcc = normalize(b.status) === 'checked_in' ? 1 : 0;
        occByMonth.set(month, occ + isOcc);
      });
      const totalRooms = roomStatusCounts.total || rooms.length || 1;
      const occupancyArr: OccupancyData[] = Array.from(occByMonth.entries()).map(([month, occ]) => ({ date: month, occupancy: Math.min(100, Math.round((occ / totalRooms) * 100)), availableRooms: totalRooms - Math.min(occ, totalRooms), occupiedRooms: Math.min(occ, totalRooms) }));

      // Build analytics metrics object
      const analyticsData: AnalyticsMetrics = {
        totalRevenue: completedPaymentsSum,
        totalBookings: bookings.length,
        averageOccupancy: totalRooms ? Math.round(((roomStatusCounts.occupied || 0) / totalRooms) * 100) : 0,
        totalGuests: guests.length,
        activeGuests: activeGuestSet.size,
        pendingTasks: (tasks || []).filter((t: any) => t.status === 'pending').length,
        completedTasks: (tasks || []).filter((t: any) => t.status === 'completed').length,
        roomStats: {
          available: roomStatusCounts.available || 0,
          occupied: roomStatusCounts.occupied || 0,
          cleaning: roomStatusCounts.cleaning || 0,
          maintenance: roomStatusCounts.maintenance || 0,
          total: totalRooms,
        },
        bookingStats: {
          confirmed: bookingStatsCounts.confirmed || 0,
          checkedIn: bookingStatsCounts.checked_in || 0,
          checkedOut: bookingStatsCounts.checked_out || 0,
          cancelled: bookingStatsCounts.cancelled || 0,
          total: bookings.length,
        },
        financialStats: {
          totalRevenue: completedPaymentsSum,
          totalPending: pendingSum,
          collectionRate: totalAmountSum ? Math.round((completedPaymentsSum / totalAmountSum) * 100) : 0,
          averageBookingValue: bookings.length ? Math.round(totalAmountSum / bookings.length) : 0,
        },
      };

      setAnalytics(analyticsData);
      setRevenueData(revenueArr);
      setOccupancyData(occupancyArr);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Default values when analytics is loading or failed
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalPending = analytics?.financialStats?.totalPending || 0;
  const averageOccupancy = analytics?.averageOccupancy || 0;
  const totalBookings = analytics?.totalBookings || 0;
  const availableRooms = analytics?.roomStats?.available || 0;
  const occupiedRooms = analytics?.roomStats?.occupied || 0;
  const cleaningRooms = analytics?.roomStats?.cleaning || 0;
  const totalGuests = analytics?.totalGuests || 0;
  const activeGuests = analytics?.activeGuests || 0;
  const pendingTasks = analytics?.pendingTasks || 0;
  const completedTasks = analytics?.completedTasks || 0;

  // Room status data for pie chart
  const roomStatusData = [
    { name: "Available", value: availableRooms, color: "#10b981" },
    { name: "Occupied", value: occupiedRooms, color: "#f59e0b" },
    { name: "Cleaning", value: cleaningRooms, color: "#3b82f6" },
    { name: "Maintenance", value: analytics?.roomStats?.maintenance || 0, color: "#ef4444" },
  ];

  // Booking status data
  const bookingStatusData = [
    { name: "Confirmed", value: analytics?.bookingStats?.confirmed || 0, color: "#3b82f6" },
    { name: "Checked-in", value: analytics?.bookingStats?.checkedIn || 0, color: "#10b981" },
    { name: "Checked-out", value: analytics?.bookingStats?.checkedOut || 0, color: "#6b7280" },
    { name: "Cancelled", value: analytics?.bookingStats?.cancelled || 0, color: "#ef4444" },
  ];

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      const downloadUrl = await analyticsService.exportAnalytics(reportType, reportPeriod, format);
      // In a real app, you would trigger download or open the URL
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error(error.message || 'Failed to export report');
    }
  };

  const generateFinancialReport = async () => {
    try {
      const downloadUrl = await analyticsService.generateFinancialReport(reportPeriod, 'pdf');
      // In a real app, you would trigger download or open the URL
      toast.success("Financial report generated successfully!");
    } catch (error: any) {
      console.error('Error generating financial report:', error);
      toast.error(error.message || 'Failed to generate financial report');
    }
  };

  const generateOperationalReport = async () => {
    try {
      const downloadUrl = await analyticsService.generateOperationalReport(reportPeriod, 'pdf');
      // In a real app, you would trigger download or open the URL
      toast.success("Operational report generated successfully!");
    } catch (error: any) {
      console.error('Error generating operational report:', error);
      toast.error(error.message || 'Failed to generate operational report');
    }
  };

  return (
    <Layout>
      {user?.role !== 'admin' ? (
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access reports and analytics.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                <Button variant="outline" onClick={() => handleExportReport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
        )}

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
                  <p className="text-3xl font-bold mt-2">{occupiedRooms}/{analytics?.roomStats?.total || 0}</p>
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
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Revenue']} />
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
                  <LineChart data={occupancyData.map(d => ({ month: d.date, occupancy: d.occupancy }))}>
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
        )}

        {/* Additional Analytics */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Room Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roomStatusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {roomStatusData.filter(d => d.value > 0).map((entry, index) => (
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
                      data={bookingStatusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {bookingStatusData.filter(d => d.value > 0).map((entry, index) => (
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

        {/* Recent Activity */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Financial Overview</p>
                  <div className="space-y-1">
                    <p className="text-sm">Collection Rate: <span className="font-medium">{analytics?.financialStats?.collectionRate?.toFixed(1) || 0}%</span></p>
                    <p className="text-sm">Avg. Booking Value: <span className="font-medium">KES {analytics?.financialStats?.averageBookingValue?.toLocaleString() || 0}</span></p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Operational Metrics</p>
                  <div className="space-y-1">
                    <p className="text-sm">Total Rooms: <span className="font-medium">{analytics?.roomStats?.total || 0}</span></p>
                    <p className="text-sm">Active Guests: <span className="font-medium">{activeGuests}</span></p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <div className="space-y-1">
                    <p className="text-sm">Occupancy Rate: <span className="font-medium">{averageOccupancy.toFixed(1)}%</span></p>
                    <p className="text-sm">Total Bookings: <span className="font-medium">{totalBookings}</span></p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </Layout>
  );
};

export default Reports;

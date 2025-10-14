import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockBookings, mockGuests, mockRooms, mockPayments, Booking, Payment } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Download, Smartphone, DollarSign, Receipt, CheckCircle, XCircle, Clock, AlertTriangle, Eye, TrendingUp, BarChart3, Calendar, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  status: "active" | "inactive";
}

interface PaymentTransaction {
  id: string;
  bookingId: string;
  method: string;
  amount: number;
  phoneNumber?: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
  transactionCode?: string;
}

const Billing = () => {
  const { user } = useAuth();
  const [bookings] = useState<Booking[]>(mockBookings);
  const [transactions] = useState<PaymentTransaction[]>([]);
  const [payments] = useState<Payment[]>(mockPayments);
  const [activeTab, setActiveTab] = useState("transactions");

  // Analytics calculations
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = bookings.filter(b => b.paidAmount < b.totalAmount);
  const completedPayments = payments.filter(p => p.status === "completed").length;
  const totalOutstanding = bookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: Smartphone,
      description: "Pay using M-Pesa mobile money",
      status: "active"
    },
    {
      id: "cash",
      name: "Cash Payment",
      icon: DollarSign,
      description: "Pay with cash at reception",
      status: "active"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: CreditCard,
      description: "Direct bank transfer",
      status: "active"
    }
  ];


  const downloadAllInvoices = () => {
    toast.success(`Downloading ${bookings.length} invoices...`);
    // In a real application, this would trigger a bulk download of all invoices
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground mt-1">View and monitor all financial transactions and payments</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">KES {(totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1">+12% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Payments</p>
                  <p className="text-2xl font-bold">{completedPayments}</p>
                  <p className="text-xs text-blue-600 mt-1">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold">KES {(totalOutstanding / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-orange-600 mt-1">{pendingPayments.length} invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-bold">{((totalRevenue / (totalRevenue + totalOutstanding)) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-purple-600 mt-1">Above target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
            <TabsTrigger value="analytics">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <div className="space-y-6">

        {/* Transaction Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Payment #{payment.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {payment.amount}</p>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Cards */}
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => {
            const guest = mockGuests.find((g) => g.id === booking.guestId);
            const room = mockRooms.find((r) => r.id === booking.roomId);
            const balance = booking.totalAmount - booking.paidAmount;
            const nights = Math.ceil(
              (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={booking.id} className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{guest?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Room {room?.number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{room?.type}</p>
                      {balance > 0 ? (
                        <Badge className="mt-1 bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Balance Due
                        </Badge>
                      ) : (
                        <Badge className="mt-1 bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid in Full
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Bill Details */}
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room Rate (per night)</span>
                        <span className="font-medium">KES {room?.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Number of Nights</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">KES {Math.round(booking.totalAmount * 0.84)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (16%)</span>
                        <span className="font-medium">KES {Math.round(booking.totalAmount * 0.16)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-bold">Total Amount</span>
                        <span className="font-bold text-lg">KES {booking.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Amount Paid</span>
                        <span className="text-green-600 font-medium">KES {booking.paidAmount}</span>
                      </div>
                      {balance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-orange-600 font-bold">Balance Due</span>
                          <span className="text-orange-600 font-bold text-lg">KES {balance}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions - View Only */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>


            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const booking = bookings.find(b => b.id === payment.bookingId);
                    const guest = booking ? mockGuests.find(g => g.id === booking.guestId) : null;
                    return (
                      <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{guest?.name || 'Unknown Guest'}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                              <div>Amount: KES {payment.amount}</div>
                              <div>Method: {payment.method.toUpperCase()}</div>
                              <div>Date: {new Date(payment.timestamp).toLocaleDateString()}</div>
                              <div>Transaction: {payment.transactionId || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {payments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No payment history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Management</CardTitle>
                  <Button 
                    onClick={downloadAllInvoices}
                    className="bg-gradient-primary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All Invoices
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const guest = mockGuests.find(g => g.id === booking.guestId);
                    const room = mockRooms.find(r => r.id === booking.roomId);
                    const balance = booking.totalAmount - booking.paidAmount;
                    
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{guest?.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                              <div>Invoice: #{booking.id}</div>
                              <div>Room: {room?.number}</div>
                              <div>Total: KES {booking.totalAmount}</div>
                              <div>Status: {balance > 0 ? 'Unpaid' : 'Paid'}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Total Revenue (MTD)</span>
                      <span className="font-bold text-lg">KES {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Outstanding Amount</span>
                      <span className="font-bold text-lg text-orange-600">KES {totalOutstanding.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Collection Efficiency</span>
                      <span className="font-bold text-lg text-green-600">{((totalRevenue / (totalRevenue + totalOutstanding)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['mpesa', 'cash', 'card'].map((method) => {
                      const methodPayments = payments.filter(p => p.method === method);
                      const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                      const percentage = totalRevenue > 0 ? (methodTotal / totalRevenue * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={method} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {method === 'mpesa' && <Smartphone className="h-4 w-4" />}
                            {method === 'cash' && <DollarSign className="h-4 w-4" />}
                            {method === 'card' && <CreditCard className="h-4 w-4" />}
                            <span className="capitalize">{method}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">KES {methodTotal.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Billing;

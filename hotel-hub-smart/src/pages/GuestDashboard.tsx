import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockRooms, mockBookings, mockGuests } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { GuestLayout } from "@/components/GuestLayout";
import GuestFoodOrdering from "@/components/GuestFoodOrdering";
import GuestSwimmingActivities from "@/components/GuestSwimmingActivities";
import { Calendar, DollarSign, CreditCard, Search, Bed, Star, Clock, CheckCircle, User, Phone, Mail, MapPin, LogOut, Bell, Download, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface GuestBooking {
  id: string;
  roomId: string;
    checkIn: string;
    checkOut: string;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled";
    totalAmount: number;
  paidAmount: number;
  guestId: string;
}

const GuestDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<GuestBooking | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Listen for tab changes from sidebar navigation
  useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail.tab);
    };
    
    window.addEventListener("changeGuestTab", handleTabChange);
    
    // Set initial tab from location state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    
    return () => {
      window.removeEventListener("changeGuestTab", handleTabChange);
    };
  }, [location.state]);
  
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guestName: user?.name || "",
    guestEmail: user?.email || "",
    guestPhone: user?.phone || "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    phoneNumber: "",
    method: "mpesa",
  });

  // Get guest bookings (mock data - in real app, filter by guest ID)
  const guestBookings = mockBookings.filter(booking => booking.guestId === "1");

  // Filter available rooms
  const availableRooms = mockRooms.filter(room => 
    room.status === "available" &&
    (selectedRoomType === "all" || room.type === selectedRoomType) &&
    room.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomBooking = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate booking creation
    const newBooking: GuestBooking = {
      id: Date.now().toString(),
      roomId: selectedRoom.id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      status: "confirmed",
      totalAmount: selectedRoom.price * Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
      paidAmount: 0,
      guestId: "1",
    };

    setIsBookingDialogOpen(false);
    toast.success("Room booked successfully! Please proceed to payment.");
    setSelectedBooking(newBooking);
    setPaymentData({ ...paymentData, amount: newBooking.totalAmount.toString() });
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!paymentData.amount || !paymentData.phoneNumber) {
      toast.error("Please fill in all payment details");
      return;
    }

    try {
      // Simulate M-Pesa payment via Daraja API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Payment of KES ${paymentData.amount} processed successfully!`);
      setIsPaymentDialogOpen(false);
      
      // Reset forms
      setBookingData({
        checkIn: "",
        checkOut: "",
        guestName: user?.name || "",
        guestEmail: user?.email || "",
        guestPhone: user?.phone || "",
      });
      setPaymentData({
        amount: "",
        phoneNumber: "",
        method: "mpesa",
      });
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };


  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case "single": return "🏠";
      case "double": return "🏨";
      case "suite": return "🏰";
      case "deluxe": return "🌟";
      default: return "🏠";
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "checked-in":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Checked In</Badge>;
      case "checked-out":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPendingPayments = () => {
    return guestBookings.filter(booking => booking.totalAmount > booking.paidAmount);
  };

  const getTotalOutstanding = () => {
    return getPendingPayments().reduce((total, booking) => total + (booking.totalAmount - booking.paidAmount), 0);
  };

  return (
    <GuestLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your bookings, payments, and reservations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setActiveTab("bookings")} 
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Rooms
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-3xl font-bold">{guestBookings.length}</p>
                      <p className="text-xs text-green-600 mt-1">+2 this month</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                      <p className="text-3xl font-bold">KES {getTotalOutstanding()}</p>
                      <p className="text-xs text-orange-600 mt-1">{getPendingPayments().length} pending</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                      <p className="text-3xl font-bold">{guestBookings.length * 50}</p>
                      <p className="text-xs text-green-600 mt-1">Earn more points</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
                  
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guestBookings.slice(0, 3).map((booking) => {
                    const room = mockRooms.find(r => r.id === booking.roomId);
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                            <p className="font-medium">Room {room?.number} - {room?.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                        <div className="text-right">
                          <p className="font-semibold">KES {booking.totalAmount}</p>
                          {getBookingStatusBadge(booking.status)}
                        </div>
                      </div>
                    );
                  })}
                    </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Available Rooms</h2>
                <p className="text-muted-foreground">Browse and book rooms for your stay</p>
              </div>
              <Button onClick={() => setActiveTab("bookings")}>
                <Search className="h-4 w-4 mr-2" />
                Browse Rooms
              </Button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Room Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{getRoomTypeIcon(room.type)}</span>
                          Room {room.number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize mt-1">{room.type} Room</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>
              </CardHeader>
              <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{room.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Floor {room.floor}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">KES {room.price}</span>
                        <span className="text-sm text-muted-foreground">per night</span>
                      </div>
                      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                        <DialogTrigger asChild>
                  <Button 
                            className="w-full" 
                            onClick={() => setSelectedRoom(room)}
                  >
                            Book Now
                  </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Book Room {room.number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="font-semibold">{room.type} Room - KES {room.price}/night</p>
                              <p className="text-sm text-muted-foreground">Capacity: {room.capacity} guests</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="checkIn">Check-in Date</Label>
                                <Input
                                  id="checkIn"
                                  type="date"
                                  value={bookingData.checkIn}
                                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="checkOut">Check-out Date</Label>
                                <Input
                                  id="checkOut"
                                  type="date"
                                  value={bookingData.checkOut}
                                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guestName">Full Name</Label>
                              <Input
                                id="guestName"
                                value={bookingData.guestName}
                                onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guestEmail">Email</Label>
                              <Input
                                id="guestEmail"
                                type="email"
                                value={bookingData.guestEmail}
                                onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                                placeholder="your@email.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guestPhone">Phone Number</Label>
                              <Input
                                id="guestPhone"
                                value={bookingData.guestPhone}
                                onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                                placeholder="+254 712 345 678"
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleRoomBooking} className="flex-1">Confirm Booking</Button>
                              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>

          </TabsContent>
          
          {/* My Bookings Tab */}
          <TabsContent value="mybookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guestBookings.length > 0 ? (
                    guestBookings.map((booking) => {
                      const room = mockRooms.find(r => r.id === booking.roomId);
                      return (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                  <div>
                              <p className="font-semibold">Room {room?.number}</p>
                              <p className="text-sm text-muted-foreground capitalize">{room?.type}</p>
                      </div>
                            {getBookingStatusBadge(booking.status)}
                      </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Check-in:</p>
                              <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                            <div>
                              <p className="text-muted-foreground">Check-out:</p>
                              <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                            <div>
                              <p className="text-muted-foreground">Total Amount:</p>
                              <p className="font-semibold">KES {booking.totalAmount}</p>
                  </div>
                  <div>
                              <p className="text-muted-foreground">Paid:</p>
                              <p className="font-semibold">KES {booking.paidAmount}</p>
                      </div>
                    </div>
                          {booking.totalAmount > booking.paidAmount && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-orange-600 font-medium mb-2">
                                Outstanding Balance: KES {booking.totalAmount - booking.paidAmount}
                              </p>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setPaymentData({ ...paymentData, amount: (booking.totalAmount - booking.paidAmount).toString() });
                                  setIsPaymentDialogOpen(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                              </Button>
                            </div>
                          )}
                  </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No bookings yet. Book a room to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Management</h2>
              <p className="text-muted-foreground">Manage your payments and outstanding balances</p>
            </div>

            {/* Outstanding Payments */}
            <Card>
                <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  {getPendingPayments().length > 0 ? (
                    getPendingPayments().map((booking) => {
                      const room = mockRooms.find(r => r.id === booking.roomId);
                      const outstanding = booking.totalAmount - booking.paidAmount;
                      return (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                      <div>
                              <p className="font-semibold">Room {room?.number} - {room?.type}</p>
                              <p className="text-sm text-muted-foreground">
                                Booking #{booking.id} • {new Date(booking.checkIn).toLocaleDateString()}
                              </p>
                          </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-orange-600">KES {outstanding}</p>
                              <p className="text-sm text-muted-foreground">Outstanding</p>
                          </div>
                        </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => {
                                setSelectedBooking(booking);
                                setPaymentData({ ...paymentData, amount: outstanding.toString() });
                                setIsPaymentDialogOpen(true);
                              }}
                              className="flex-1"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">All payments are up to date!</p>
                      </div>
                  )}
                    </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guestBookings.filter(b => b.paidAmount > 0).map((booking) => {
                    const room = mockRooms.find(r => r.id === booking.roomId);
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                          <p className="font-medium">Room {room?.number} - {room?.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.checkIn).toLocaleDateString()} • Booking #{booking.id}
                        </p>
                      </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">KES {booking.paidAmount}</p>
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                  </div>
                    );
                  })}
                </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-lg font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-lg">{user?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ID Number</Label>
                      <p className="text-lg">{user?.idNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                      <Badge className="bg-blue-100 text-blue-800">Guest</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                      <p className="text-lg">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Bookings</Label>
                      <p className="text-lg font-semibold">{guestBookings.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+254 20 123 4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>info@hotel.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Nairobi, Kenya</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Food Ordering Tab */}
          <TabsContent value="food-ordering" className="space-y-6">
            <GuestFoodOrdering />
          </TabsContent>

          {/* Swimming Activities Tab */}
          <TabsContent value="swimming-activities" className="space-y-6">
            <GuestSwimmingActivities />
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold">Payment Details</p>
                {selectedBooking && (
                  <p className="text-sm text-muted-foreground">
                    Outstanding balance for your booking
                  </p>
                )}
                <p className="text-lg font-bold text-primary mt-2">
                  Amount: KES {paymentData.amount}
                </p>
                  </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentData.method} onValueChange={(value) => setPaymentData({...paymentData, method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="cash">Cash (At Reception)</SelectItem>
                  </SelectContent>
                </Select>
                  </div>

              {paymentData.method === "mpesa" && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="254712345678"
                    value={paymentData.phoneNumber}
                    onChange={(e) => setPaymentData({...paymentData, phoneNumber: e.target.value})}
                  />
                  </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handlePayment} className="flex-1">
                  {paymentData.method === "mpesa" ? "Pay with M-Pesa" : "Pay at Reception"}
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                  </div>
                  </div>
          </DialogContent>
        </Dialog>
      </div>
    </GuestLayout>
  );
};

export default GuestDashboard;
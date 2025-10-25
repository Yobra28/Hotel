/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useAuth } from "@/contexts/AuthContext";
import { GuestLayout } from "@/components/GuestLayout";
import GuestFoodOrdering from "@/components/GuestFoodOrdering";
import GuestSwimmingActivities from "@/components/GuestSwimmingActivities";
import GuestUpcomingActivities from "@/components/GuestUpcomingActivities";
import { Calendar, DollarSign, CreditCard, Search, Bed, Star, Clock, CheckCircle, User, Phone, Mail, MapPin, LogOut, Bell, Download, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import roomService from "@/services/roomService";
import bookingService from "@/services/bookingService";

interface GuestBooking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "pending" | "no_show" | "completed";
  totalAmount: number;
  paidAmount: number;
  guestId: string;
  bookingNumber?: string;
  adults: number;
  children: number;
  nights: number;
  paymentStatus: string;
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  guestDetails?: any;
  pricing?: any;
  payments?: any[];
  services?: any[];
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
  const [rooms, setRooms] = useState<any[]>([]);
  const [filterCheckIn, setFilterCheckIn] = useState<string>("");
  const [filterCheckOut, setFilterCheckOut] = useState<string>("");
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Load rooms when bookings tab is accessed
  useEffect(() => {
    if (activeTab === "bookings" && rooms.length === 0) {
      loadRooms();
    }
  }, [activeTab, rooms.length]);

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

  // Load bookings from API
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getTransformedMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Load rooms summary from API to show occupancy per selected dates
  const loadRooms = async () => {
    try {
      setRoomsLoading(true);
      const params: any = {};
      if (filterCheckIn && filterCheckOut) {
        params.checkIn = filterCheckIn;
        params.checkOut = filterCheckOut;
      }
      const data = await roomService.getTransformedRoomsSummary(params);
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setRoomsLoading(false);
    }
  };
  
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

  // Use real bookings from state
  const guestBookings = bookings;

  // Map UI type to backend type
  const mapType = (ui: string) => {
    const m: any = { single: 'Smart Economy', double: 'Business Suite', suite: 'Premium Deluxe', deluxe: 'Presidential' };
    return m[ui] || ui;
  };

  // Filter rooms for display (do not hide occupied ones)
  const filteredRooms = rooms.filter(room =>
    (selectedRoomType === 'all' || room.type === mapType(selectedRoomType)) &&
    room.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Calculate number of adults and children (default to 1 adult)
      const bookingPayload = {
        roomId: selectedRoom.id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        numberOfGuests: {
          adults: 1,
          children: 0
        },
        guestDetails: {
          firstName: bookingData.guestName.split(' ')[0] || bookingData.guestName,
          lastName: bookingData.guestName.split(' ').slice(1).join(' ') || '',
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone,
          idNumber: user?.idNumber || 'N/A'
        },
        source: 'website'
      };

      const newBooking = await bookingService.createBooking(bookingPayload);
      const transformedBooking = bookingService.transformBooking(newBooking);

      setIsBookingDialogOpen(false);
      toast.success("Room booked successfully! Please proceed to payment.");
      
      // Refresh bookings and rooms to reflect new availability
      await Promise.all([loadBookings(), loadRooms()]);
      
      setSelectedBooking(transformedBooking);
      setPaymentData({ ...paymentData, amount: transformedBooking.totalAmount.toString() });
      setIsPaymentDialogOpen(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  const handlePayment = async () => {
    if (!paymentData.amount || (paymentData.method === 'mpesa' && !paymentData.phoneNumber)) {
      toast.error("Please fill in all payment details");
      return;
    }

    try {
      if (!selectedBooking) {
        toast.error('No booking selected');
        return;
      }

      if (paymentData.method === 'mpesa') {
        // Simulate M-Pesa STK push delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await bookingService.addGuestPayment(selectedBooking.id, {
          amount: Number(paymentData.amount),
          method: 'mpesa',
          transactionId: `MPESA-${Date.now()}`,
        });
        toast.success(`M-Pesa payment of KES ${paymentData.amount} completed!`);
      } else {
        // Cash: create a pending payment that receptionist will confirm
        await bookingService.addGuestPayment(selectedBooking.id, {
          amount: Number(paymentData.amount),
          method: 'cash',
        });
        toast.info('Cash payment recorded. Please visit reception to complete confirmation.');
      }

      setIsPaymentDialogOpen(false);

      // Refresh data
      await loadBookings();
      
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
      case "checked_in":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Checked In</Badge>;
      case "checked_out":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "no_show":
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-3xl font-bold">{guestBookings.length}</p>
                        <p className="text-xs text-green-600 mt-1">Lifetime bookings</p>
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
            )}
                  
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : guestBookings.length > 0 ? (
                    guestBookings.slice(0, 3).map((booking) => {
                      // Find room by roomId in the rooms state, fallback to basic display
                      const room = rooms.find(r => r.id === booking.roomId) || { number: 'N/A', type: 'Unknown' };
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div>
                              <p className="font-medium">Room {room.number} - {room.type}</p>
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
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No bookings yet. Book a room to get started!</p>
                  )}
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
              <Select value={selectedRoomType} onValueChange={(v) => { setSelectedRoomType(v); }}>
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

            {/* Date range for availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Check-in</Label>
                <Input type="date" value={filterCheckIn} onChange={(e) => setFilterCheckIn(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Check-out</Label>
                <Input type="date" value={filterCheckOut} onChange={(e) => setFilterCheckOut(e.target.value)} />
              </div>
            </div>
            <div>
              <Button variant="outline" onClick={loadRooms} className="mt-2">Refresh Rooms</Button>
            </div>

            {/* Room Cards */}
            {roomsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
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
                      {room.availableForRange ? (
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Occupied</Badge>
                      )}
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
                      <Dialog 
                        open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                        <DialogTrigger asChild>
                  <Button 
                            className="w-full" 
                            onClick={() => {
                              setSelectedRoom(room);
                              if (filterCheckIn && filterCheckOut) {
                                setBookingData({ ...bookingData, checkIn: filterCheckIn, checkOut: filterCheckOut });
                              }
                            }}
                            disabled={!room.availableForRange}
                  >
                            {room.availableForRange ? 'Book Now' : 'Unavailable for selected dates'}
                  </Button>
                        </DialogTrigger>
                        {!room.availableForRange && room.blockedRanges?.length > 0 && (
                          <p className="text-xs text-red-600 mt-2">
                            Unavailable from {new Date(room.blockedRanges[0].start).toLocaleDateString()} to {new Date(room.blockedRanges[0].end).toLocaleDateString()}
                          </p>
                        )}
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No rooms available matching your criteria</p>
                <Button onClick={loadRooms} variant="outline">
                  Refresh Rooms
                </Button>
              </div>
            )}

          </TabsContent>
          
          {/* My Bookings Tab */}
          <TabsContent value="mybookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : guestBookings.length > 0 ? (
                    guestBookings.map((booking) => {
                      const room = rooms.find(r => r.id === booking.roomId) || { number: 'N/A', type: 'Unknown' };
                      return (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">Room {room.number}</p>
                              <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                              {booking.bookingNumber && (
                                <p className="text-xs text-muted-foreground">Booking #{booking.bookingNumber}</p>
                              )}
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
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : getPendingPayments().length > 0 ? (
                    getPendingPayments().map((booking) => {
                      const room = rooms.find(r => r.id === booking.roomId) || { number: 'N/A', type: 'Unknown' };
                      const outstanding = booking.totalAmount - booking.paidAmount;
                      return (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold">Room {room.number} - {room.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.bookingNumber ? `Booking #${booking.bookingNumber}` : `Booking #${booking.id}`} • {new Date(booking.checkIn).toLocaleDateString()}
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
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : guestBookings.filter(b => b.paidAmount > 0).length > 0 ? (
                    guestBookings.filter(b => b.paidAmount > 0).map((booking) => {
                      const room = rooms.find(r => r.id === booking.roomId) || { number: 'N/A', type: 'Unknown' };
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Room {room.number} - {room.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.checkIn).toLocaleDateString()} • {booking.bookingNumber ? `Booking #${booking.bookingNumber}` : `Booking #${booking.id}`}
                            </p>
                          </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">KES {booking.paidAmount}</p>
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                  </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No payment history available</p>
                  )}
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

          {/* Upcoming Activities Tab */}
          <TabsContent value="upcoming-activities" className="space-y-6">
            <GuestUpcomingActivities />
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
                <Label htmlFor="guestPaymentMethod">Payment Method</Label>
                <Select value={paymentData.method} onValueChange={(value) => setPaymentData({...paymentData, method: value})}>
                  <SelectTrigger id="guestPaymentMethod">
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
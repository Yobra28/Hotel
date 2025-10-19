/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, DollarSign, CreditCard, Search, Bed, Star, Clock, CheckCircle, User, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import roomService from "@/services/roomService";
import bookingService from "@/services/bookingService";

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

const GuestPortal = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<GuestBooking | null>(null);

  // API state
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [guestBookings, setGuestBookings] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    phoneNumber: "",
    method: "mpesa",
  });

  // Load available rooms on component mount
  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        setLoadingRooms(true);
        console.log('Loading available rooms...');
        const rooms = await roomService.getTransformedAvailableRooms();
        console.log('Loaded rooms:', rooms);
        setAvailableRooms(rooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
        toast.error('Failed to load available rooms');
      } finally {
        setLoadingRooms(false);
      }
    };

    loadAvailableRooms();
  }, []);

  // Load guest bookings on component mount
  useEffect(() => {
    const loadGuestBookings = async () => {
      try {
        setLoadingBookings(true);
        const bookings = await bookingService.getTransformedMyBookings();
        setGuestBookings(bookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
        toast.error('Failed to load your bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      loadGuestBookings();
    } else {
      setLoadingBookings(false);
    }
  }, [user]);

  // Filter available rooms based on search and type
  const filteredRooms = availableRooms.filter(room =>
    (selectedRoomType === "all" || room.type === selectedRoomType) &&
    room.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setBookingLoading(true);

      // Calculate number of nights
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Create booking data for API
      const bookingDataForAPI = {
        roomId: selectedRoom.id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        numberOfGuests: {
          adults: 1, // Default to 1 adult, can be made configurable later
          children: 0
        },
        guestDetails: {
          firstName: bookingData.guestName.split(' ')[0] || bookingData.guestName,
          lastName: bookingData.guestName.split(' ').slice(1).join(' ') || '',
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone,
          idNumber: 'TEMP-' + Date.now(), // Temporary ID, should be collected from user
          nationality: 'Kenyan' // Default, can be made configurable
        },
        source: 'website'
      };

      // Create booking via API
      const newBooking = await bookingService.createBooking(bookingDataForAPI);

      setIsBookingDialogOpen(false);
      toast.success("Room booked successfully! Please proceed to payment.");

      // Transform the API response to match our local format
      const transformedBooking: GuestBooking = {
        id: newBooking._id,
        roomId: newBooking.room,
        checkIn: newBooking.checkInDate.toISOString().split('T')[0],
        checkOut: newBooking.checkOutDate.toISOString().split('T')[0],
        status: newBooking.status === 'confirmed' ? 'confirmed' :
                newBooking.status === 'checked_in' ? 'checked-in' :
                newBooking.status === 'checked_out' ? 'checked-out' :
                newBooking.status === 'cancelled' ? 'cancelled' : 'confirmed',
        totalAmount: newBooking.pricing.totalAmount,
        paidAmount: newBooking.payments.reduce((total, payment) => {
          return payment.status === 'completed' ? total + payment.amount : total;
        }, 0),
        guestId: newBooking.guest
      };

      setSelectedBooking(transformedBooking);
      setPaymentData({ ...paymentData, amount: transformedBooking.totalAmount.toString() });
      setIsPaymentDialogOpen(true);

      // Refresh bookings list
      const updatedBookings = await bookingService.getTransformedMyBookings();
      setGuestBookings(updatedBookings);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
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
        guestName: "",
        guestEmail: "",
        guestPhone: "",
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
              <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Guest Portal</h1>
              <p className="text-gray-600 mt-1">Book rooms, manage reservations, and make payments</p>
              </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.name}</span>
            </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.location.href = '/guest-login'}>
                    Login
                  </Button>
                  <Button onClick={() => window.location.href = '/guest-register'}>
                    Register
            </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingRooms ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading available rooms...</span>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No rooms available matching your criteria.</p>
                  </div>
                ) : (
                  filteredRooms.map((room) => (
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
                              <Button onClick={handleRoomBooking} className="flex-1" disabled={bookingLoading}>
                                {bookingLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating Booking...
                                  </>
                                ) : (
                                  'Confirm Booking'
                                )}
                              </Button>
                                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
            </CardContent>
          </Card>
                  ))
                )}
              </div>
              </div>
        </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading your bookings...</span>
                    </div>
                  ) : guestBookings.length > 0 ? (
                    guestBookings.map((booking) => {
                      const room = availableRooms.find(r => r.id === booking.roomId);
                      return (
                        <div key={booking.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                  <div>
                              <p className="font-semibold">Room {room?.number || booking.roomId}</p>
                              <p className="text-sm text-muted-foreground capitalize">{room?.type || 'Room'}</p>
                  </div>
                            {getBookingStatusBadge(booking.status)}
                  </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Check-in:</span>
                              <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                </div>
                            <div className="flex justify-between">
                              <span>Check-out:</span>
                              <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-semibold">KES {booking.totalAmount}</span>
                    </div>
                  </div>
                </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No bookings yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hotel Info */}
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
          </div>
        </div>

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
                <p className="font-semibold">Booking Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  Room {selectedRoom?.number} - {selectedRoom?.type}
                </p>
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
    </div>
  );
};

export default GuestPortal;
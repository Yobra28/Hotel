import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockGuests, mockRooms, mockBookings, Guest, Room, Booking } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, UserPlus, LogIn, LogOut, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const GuestRegistration = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("register");

  const [guestFormData, setGuestFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    nationality: "",
    address: "",
    specialRequests: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [bookingFormData, setBookingFormData] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    specialRequests: "",
    paymentMethod: "cash",
  });

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  );

  const pendingCheckIns = bookings.filter(b => b.status === "confirmed");
  const currentCheckIns = bookings.filter(b => b.status === "checked-in");

  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === "available");
  };

  const handleGuestRegistration = async () => {
    if (!guestFormData.firstName || !guestFormData.lastName || !guestFormData.email || !guestFormData.phone || !guestFormData.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newGuest: Guest = {
      id: Date.now().toString(),
      firstName: guestFormData.firstName,
      lastName: guestFormData.lastName,
      name: `${guestFormData.firstName} ${guestFormData.lastName}`,
      email: guestFormData.email,
      phone: guestFormData.phone,
      idNumber: guestFormData.idNumber,
      nationality: guestFormData.nationality,
      address: guestFormData.address,
      checkIn: bookingFormData.checkIn,
      checkOut: bookingFormData.checkOut,
      roomId: bookingFormData.roomId,
      specialRequests: guestFormData.specialRequests,
      emergencyContact: {
        name: guestFormData.emergencyContactName,
        phone: guestFormData.emergencyContactPhone,
        relationship: guestFormData.emergencyContactRelationship,
      },
    };

    // Calculate nights and total amount
    const checkInDate = new Date(bookingFormData.checkIn);
    const checkOutDate = new Date(bookingFormData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
    const selectedRoom = rooms.find(r => r.id === bookingFormData.roomId);
    const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;

    const newBooking: Booking = {
      id: Date.now().toString(),
      guestId: newGuest.id,
      roomId: bookingFormData.roomId,
      checkIn: bookingFormData.checkIn,
      checkOut: bookingFormData.checkOut,
      nights,
      adults: parseInt(bookingFormData.adults),
      children: parseInt(bookingFormData.children),
      status: "confirmed",
      totalAmount,
      paidAmount: 0,
      paymentMethod: bookingFormData.paymentMethod as any,
      specialRequests: bookingFormData.specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update room status to occupied if immediate check-in
    if (bookingFormData.checkIn === new Date().toISOString().split('T')[0]) {
      const updatedRooms = rooms.map(room =>
        room.id === bookingFormData.roomId ? { ...room, status: "occupied" as const } : room
      );
      setRooms(updatedRooms);
    }

    setGuests([...guests, newGuest]);
    setBookings([...bookings, newBooking]);
    setIsRegisterDialogOpen(false);
    resetForms();
    toast.success("Guest registered successfully!");
  };

  const handleCheckIn = (bookingId: string) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: "checked-in" as const } : booking
    );
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const updatedRooms = rooms.map(room =>
        room.id === booking.roomId ? { ...room, status: "occupied" as const } : room
      );
      setRooms(updatedRooms);
    }
    setBookings(updatedBookings);
    toast.success("Guest checked in successfully!");
  };

  const handleCheckOut = (bookingId: string) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: "checked-out" as const } : booking
    );
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const updatedRooms = rooms.map(room =>
        room.id === booking.roomId ? { ...room, status: "cleaning" as const } : room
      );
      setRooms(updatedRooms);
    }
    setBookings(updatedBookings);
    toast.success("Guest checked out successfully! Room marked for cleaning.");
  };

  const resetForms = () => {
    setGuestFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: "",
      nationality: "",
      address: "",
      specialRequests: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
    });
    setBookingFormData({
      roomId: "",
      checkIn: "",
      checkOut: "",
      adults: "1",
      children: "0",
      specialRequests: "",
      paymentMethod: "cash",
    });
  };

  const getGuestById = (guestId: string) => {
    return guests.find(g => g.id === guestId);
  };

  const getRoomById = (roomId: string) => {
    return rooms.find(r => r.id === roomId);
  };

  if (user?.role !== "admin" && user?.role !== "receptionist") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to manage guest registration.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Guest Management</h1>
            <p className="text-muted-foreground mt-1">
              Register guests and manage check-ins/check-outs
            </p>
          </div>
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Register Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Guest</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={guestFormData.firstName}
                        onChange={(e) => setGuestFormData({...guestFormData, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={guestFormData.lastName}
                        onChange={(e) => setGuestFormData({...guestFormData, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestFormData.email}
                        onChange={(e) => setGuestFormData({...guestFormData, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={guestFormData.phone}
                        onChange={(e) => setGuestFormData({...guestFormData, phone: e.target.value})}
                        placeholder="+254712345678"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <Input
                        id="idNumber"
                        value={guestFormData.idNumber}
                        onChange={(e) => setGuestFormData({...guestFormData, idNumber: e.target.value})}
                        placeholder="12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={guestFormData.nationality}
                        onChange={(e) => setGuestFormData({...guestFormData, nationality: e.target.value})}
                        placeholder="Kenyan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={guestFormData.address}
                      onChange={(e) => setGuestFormData({...guestFormData, address: e.target.value})}
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Contact Name</Label>
                      <Input
                        id="emergencyName"
                        value={guestFormData.emergencyContactName}
                        onChange={(e) => setGuestFormData({...guestFormData, emergencyContactName: e.target.value})}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={guestFormData.emergencyContactPhone}
                        onChange={(e) => setGuestFormData({...guestFormData, emergencyContactPhone: e.target.value})}
                        placeholder="+254712345678"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={guestFormData.emergencyContactRelationship}
                      onChange={(e) => setGuestFormData({...guestFormData, emergencyContactRelationship: e.target.value})}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="room">Room</Label>
                      <Select value={bookingFormData.roomId} onValueChange={(value) => setBookingFormData({...bookingFormData, roomId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRooms().map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.number} - {room.type} (KES {room.price}/night)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={bookingFormData.paymentMethod} onValueChange={(value) => setBookingFormData({...bookingFormData, paymentMethod: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Date</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={bookingFormData.checkIn}
                        onChange={(e) => setBookingFormData({...bookingFormData, checkIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Date</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={bookingFormData.checkOut}
                        onChange={(e) => setBookingFormData({...bookingFormData, checkOut: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">Adults</Label>
                      <Select value={bookingFormData.adults} onValueChange={(value) => setBookingFormData({...bookingFormData, adults: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children">Children</Label>
                      <Select value={bookingFormData.children} onValueChange={(value) => setBookingFormData({...bookingFormData, children: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={bookingFormData.specialRequests}
                      onChange={(e) => setBookingFormData({...bookingFormData, specialRequests: e.target.value})}
                      placeholder="Any special requests or requirements"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleGuestRegistration} className="flex-1">
                    Register Guest
                  </Button>
                  <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Check-ins</p>
                  <p className="text-2xl font-bold">{pendingCheckIns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Guests</p>
                  <p className="text-2xl font-bold">{currentCheckIns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold">{guests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Guest Registry</TabsTrigger>
            <TabsTrigger value="checkin">Check-ins</TabsTrigger>
            <TabsTrigger value="checkout">Check-outs</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registered Guests</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search guests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGuests.map((guest) => (
                    <div key={guest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{guest.name}</h3>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                            <div>Email: {guest.email}</div>
                            <div>Phone: {guest.phone}</div>
                            <div>ID: {guest.idNumber}</div>
                            <div>Nationality: {guest.nationality}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            Room {guest.roomId ? getRoomById(guest.roomId)?.number || 'N/A' : 'N/A'}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {guest.checkIn} to {guest.checkOut}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCheckIns.map((booking) => {
                    const guest = getGuestById(booking.guestId);
                    const room = getRoomById(booking.roomId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{guest?.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                              <div>Room: {room?.number}</div>
                              <div>Guests: {booking.adults}A + {booking.children}C</div>
                              <div>Check-in: {booking.checkIn}</div>
                              <div>Amount: KES {booking.totalAmount}</div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleCheckIn(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Check In
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {pendingCheckIns.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No pending check-ins</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Check-outs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentCheckIns.map((booking) => {
                    const guest = getGuestById(booking.guestId);
                    const room = getRoomById(booking.roomId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{guest?.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                              <div>Room: {room?.number}</div>
                              <div>Guests: {booking.adults}A + {booking.children}C</div>
                              <div>Check-out: {booking.checkOut}</div>
                              <div>Amount: KES {booking.totalAmount}</div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleCheckOut(booking.id)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Check Out
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {currentCheckIns.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No current guests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GuestRegistration;
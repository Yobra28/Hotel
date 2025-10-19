import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Calendar, DollarSign, Search, Edit, Trash2, Eye, CheckCircle, XCircle, User, Bed } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import bookingService from "@/services/bookingService";
import roomService from "@/services/roomService";
import guestService from "@/services/guestService";

const Bookings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: {
      adults: 1,
      children: 0
    },
    guestDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: ""
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsData, roomsData, guestsData] = await Promise.all([
        bookingService.getAllBookings(),
        roomService.getTransformedRooms(),
        guestService.getTransformedGuests()
      ]);
      
      setBookings(bookingsData.map(booking => bookingService.transformBooking(booking)));
      setRooms(roomsData);
      setGuests(guestsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    const matchesSearch = 
      guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddBooking = async () => {
    if (!formData.roomId || !formData.checkIn || !formData.checkOut || 
        !formData.guestDetails.firstName || !formData.guestDetails.lastName || 
        !formData.guestDetails.email || !formData.guestDetails.phone || 
        !formData.guestDetails.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const genBookingNumber = () => {
        const d = new Date();
        const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
        const rnd = Math.floor(1000 + Math.random()*9000);
        return `BK-${ymd}-${rnd}`;
      };
      const bookingData = {
        roomId: formData.roomId,
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        numberOfGuests: formData.numberOfGuests,
        guestDetails: formData.guestDetails,
        bookingNumber: genBookingNumber(),
        source: 'walk_in'
      } as any;

      await bookingService.createBooking(bookingData);
      await loadData(); // Refresh the data
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Booking created successfully!");
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  const handleEditBooking = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }

    try {
      // For now, we'll just show a message that edit functionality is pending
      toast.info("Booking edit functionality is being implemented");
      setIsEditDialogOpen(false);
      setSelectedBooking(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error(error.message || 'Failed to update booking');
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      await bookingService.cancelBooking(selectedBooking.id, "Cancelled by receptionist");
      await loadData(); // Refresh the data
      setIsDeleteDialogOpen(false);
      setSelectedBooking(null);
      toast.success("Booking cancelled successfully!");
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleCheckIn = async (booking: any) => {
    try {
      await bookingService.updateBookingStatus(booking.id, "checked_in");
      await loadData(); // Refresh the data
      toast.success("Guest checked in successfully!");
    } catch (error: any) {
      console.error('Error checking in guest:', error);
      toast.error(error.message || 'Failed to check in guest');
    }
  };

  const handleCheckOut = async (booking: any) => {
    try {
      await bookingService.updateBookingStatus(booking.id, "checked_out");
      await loadData(); // Refresh the data
      toast.success("Guest checked out successfully!");
    } catch (error: any) {
      console.error('Error checking out guest:', error);
      toast.error(error.message || 'Failed to check out guest');
    }
  };

  const handleCancelBooking = async (booking: any) => {
    try {
      await bookingService.cancelBooking(booking.id, "Cancelled by receptionist");
      await loadData(); // Refresh the data
      toast.success("Booking cancelled successfully!");
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const resetForm = () => {
    setFormData({
      guestId: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      numberOfGuests: {
        adults: 1,
        children: 0
      },
      guestDetails: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        idNumber: ""
      }
    });
  };

  const openEditDialog = (booking: any) => {
    setSelectedBooking(booking);
    setFormData({
      guestId: booking.guestId,
      roomId: booking.roomId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfGuests: {
        adults: booking.adults || 1,
        children: booking.children || 0
      },
      guestDetails: booking.guestDetails || {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        idNumber: ""
      }
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (booking: any) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (booking: any) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Booking Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all bookings • {filteredBookings.length} bookings found
            </p>
          </div>
          {user?.role === "receptionist" && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Booking</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.filter(room => room.status === "available").map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.number} - {room.type} (KES {room.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Date</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Date</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Guest Details */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Guest Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.guestDetails.firstName}
                          onChange={(e) => setFormData({...formData, guestDetails: {...formData.guestDetails, firstName: e.target.value}})}
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.guestDetails.lastName}
                          onChange={(e) => setFormData({...formData, guestDetails: {...formData.guestDetails, lastName: e.target.value}})}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.guestDetails.email}
                        onChange={(e) => setFormData({...formData, guestDetails: {...formData.guestDetails, email: e.target.value}})}
                        placeholder="guest@email.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.guestDetails.phone}
                          onChange={(e) => setFormData({...formData, guestDetails: {...formData.guestDetails, phone: e.target.value}})}
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input
                          id="idNumber"
                          value={formData.guestDetails.idNumber}
                          onChange={(e) => setFormData({...formData, guestDetails: {...formData.guestDetails, idNumber: e.target.value}})}
                          placeholder="12345678"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults</Label>
                        <Input
                          id="adults"
                          type="number"
                          min="1"
                          value={formData.numberOfGuests.adults}
                          onChange={(e) => setFormData({...formData, numberOfGuests: {...formData.numberOfGuests, adults: parseInt(e.target.value) || 1}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">Children</Label>
                        <Input
                          id="children"
                          type="number"
                          min="0"
                          value={formData.numberOfGuests.children}
                          onChange={(e) => setFormData({...formData, numberOfGuests: {...formData.numberOfGuests, children: parseInt(e.target.value) || 0}})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddBooking} className="flex-1">Create Booking</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked-in</SelectItem>
                  <SelectItem value="checked_out">Checked-out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => {
              const guest = guests.find((g) => g.id === booking.guestId);
              const room = rooms.find((r) => r.id === booking.roomId);
            const nights = Math.ceil(
              (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{guest?.name || `${booking.guestDetails?.firstName} ${booking.guestDetails?.lastName}` || 'Guest'}</h3>
                          <p className="text-sm text-muted-foreground">Booking #{booking.bookingNumber || booking.id}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Room Details</p>
                          <p className="font-medium">Room {room?.number}</p>
                          <p className="text-sm text-muted-foreground capitalize">{room?.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{nights} nights</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Payment</p>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">KES {booking.totalAmount}</span>
                          </div>
                          <p className={`text-xs ${booking.paidAmount === booking.totalAmount ? 'text-green-600' : 'text-orange-600'}`}>
                            Paid: KES {booking.paidAmount}
                            {booking.paidAmount < booking.totalAmount && ` (Balance: KES ${booking.totalAmount - booking.paidAmount})`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => openViewDialog(booking)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {user?.role === "receptionist" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 lg:flex-none"
                            onClick={() => openEditDialog(booking)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {booking.status === "confirmed" && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1 lg:flex-none"
                              onClick={() => handleCheckIn(booking)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Check-in
                            </Button>
                          )}
                          {booking.status === "checked_in" && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1 lg:flex-none"
                              onClick={() => handleCheckOut(booking)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Check-out
                            </Button>
                          )}
                          {(booking.status === "confirmed" || booking.status === "checked_in") && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1 lg:flex-none"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                      {user?.role === "admin" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 lg:flex-none"
                          onClick={() => openDeleteDialog(booking)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first booking</p>
            {user?.role === "receptionist" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            )}
          </div>
        )}

        {/* Edit Booking Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Booking edit functionality is currently being implemented. Please contact system administrator for booking modifications.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditBooking} className="flex-1">Update Booking</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Booking Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete booking #{selectedBooking?.id}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Booking Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Booking ID</Label>
                  <p className="text-lg font-semibold">#{selectedBooking.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Guest</Label>
                  <p className="text-sm font-semibold">{guests.find(g => g.id === selectedBooking.guestId)?.name || `${selectedBooking.guestDetails?.firstName} ${selectedBooking.guestDetails?.lastName}` || 'Unknown Guest'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                  <p className="text-sm font-semibold">
                    Room {rooms.find(r => r.id === selectedBooking.roomId)?.number || 'N/A'} - 
                    {rooms.find(r => r.id === selectedBooking.roomId)?.type || 'Unknown'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                    <p className="text-sm font-semibold">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Check-out Date</Label>
                    <p className="text-sm font-semibold">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="text-lg font-bold text-primary">KES {selectedBooking.totalAmount}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Paid Amount</Label>
                    <p className="text-lg font-bold text-primary">KES {selectedBooking.paidAmount}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                {selectedBooking.paidAmount < selectedBooking.totalAmount && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Outstanding Balance:</strong> KES {selectedBooking.totalAmount - selectedBooking.paidAmount}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Bookings;

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Mail, Phone, Edit, Trash2, Eye, User, Calendar, Bed } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import guestService from "@/services/guestService";
import roomService from "@/services/roomService";
import bookingService from "@/services/bookingService";

type RoomType = 'single' | 'double' | 'suite' | 'deluxe';

const Guests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'checked-in' | 'checked-out'>("all");
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
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

  const [roomFormData, setRoomFormData] = useState({
    number: "",
    type: "single" as RoomType,
    price: "",
    floor: "",
    capacity: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [guestsData, roomsData, bookingsData] = await Promise.all([
        guestService.getTransformedGuests(),
        roomService.getTransformedRooms(),
        bookingService.getAllBookings()
      ]);
      
      setGuests(guestsData);
      setRooms(roomsData);
      setBookings(bookingsData.map(booking => bookingService.transformBooking(booking)));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load guest data');
    } finally {
      setLoading(false);
    }
  };

  // Get guest status based on bookings
  const getGuestStatus = (guest: any) => {
    const guestBooking = bookings.find(booking => 
      booking.guestDetails?.email === guest.email || booking.guestId === guest.id
    );
    if (!guestBooking) return "no-booking";
    const today = new Date();
    const checkIn = new Date(guestBooking.checkIn);
    if (guestBooking.status === 'checked_in') return "checked_in";
    if (guestBooking.status === 'checked_out') return "checked_out";
    if (today < checkIn) return "upcoming";
    return "checked_out";
  };

  const filteredGuests = guests.filter((guest) => {
    const guestName = guest.name || `${guest.firstName} ${guest.lastName}`;
    const idNumber = guest.idNumber || guest.identificationNumber || '';
    
    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      idNumber.includes(searchTerm);
    const status = getGuestStatus(guest);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGuest = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const lastName = rest.join(" ") || firstName;

      const guestData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        nationality: formData.nationality || undefined,
        address: formData.address ? {
          street: formData.address,
          city: 'Nairobi',
          state: 'Nairobi County',
          country: 'Kenya',
          zipCode: '00100'
        } : undefined,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship)
          ? {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
              relationship: formData.emergencyContactRelationship,
            }
          : undefined,
        specialRequests: formData.specialRequests || undefined,
      };

      await guestService.createGuest(guestData);
      await loadData(); // Refresh the data
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Guest registered successfully!");
    } catch (error: any) {
      console.error('Error creating guest:', error);
      toast.error(error.message || 'Failed to register guest');
    }
  };


  const handleDeleteGuest = async () => {
    if (!selectedGuest) return;

    try {
      await guestService.deleteGuest(selectedGuest.id);
      await loadData(); // Refresh the data
      setIsDeleteDialogOpen(false);
      setSelectedGuest(null);
      toast.success("Guest deleted successfully!");
    } catch (error: any) {
      console.error('Error deleting guest:', error);
      toast.error(error.message || 'Failed to delete guest');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      idNumber: "",
      nationality: "",
      address: "",
      specialRequests: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      checkIn: "",
      checkOut: "",
      roomId: "",
    });
  };


  const openDeleteDialog = (guest: any) => {
    setSelectedGuest(guest);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (guest: any) => {
    setSelectedGuest(guest);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (guest: any) => {
    setSelectedGuest(guest);
    setFormData({
      name: guest.name || `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      idNumber: guest.idNumber || guest.identificationNumber,
      nationality: guest.nationality || "",
      address: typeof guest.address === 'string' ? guest.address : guest.address?.street || "",
      specialRequests: guest.specialRequests || "",
      emergencyContactName: guest.emergencyContact?.name || "",
      emergencyContactPhone: guest.emergencyContact?.phone || "",
      emergencyContactRelationship: guest.emergencyContact?.relationship || "",
      checkIn: "",
      checkOut: "",
      roomId: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditGuest = async () => {
    if (!selectedGuest || !formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const lastName = rest.join(" ") || firstName;

      const guestData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality || undefined,
        address: formData.address ? {
          street: formData.address,
          city: 'Nairobi',
          state: 'Nairobi County',
          country: 'Kenya',
          zipCode: '00100'
        } : undefined,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship)
          ? {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
              relationship: formData.emergencyContactRelationship,
            }
          : undefined,
        specialRequests: formData.specialRequests || undefined,
      };

      await guestService.updateGuest(selectedGuest.id, guestData);
      await loadData(); // Refresh the data
      setIsEditDialogOpen(false);
      setSelectedGuest(null);
      resetForm();
      toast.success("Guest updated successfully!");
    } catch (error: any) {
      console.error('Error updating guest:', error);
      toast.error(error.message || 'Failed to update guest');
    }
  };

  const checkInGuest = async (guest: any) => {
    try {
      const guestBooking = bookings.find(booking => 
        booking.guestDetails?.email === guest.email || booking.guestId === guest.id
      );
      if (guestBooking) {
        await bookingService.updateBookingStatus(guestBooking.id, 'checked_in');
        await loadData();
        toast.success(`${guest.name || `${guest.firstName} ${guest.lastName}`} checked in`);
      } else {
        toast.error('No active booking found for this guest');
      }
    } catch (error: any) {
      console.error('Error checking in guest:', error);
      toast.error(error.message || 'Failed to check in guest');
    }
  };

  const checkOutGuest = async (guest: any) => {
    try {
      const guestBooking = bookings.find(booking => 
        booking.guestDetails?.email === guest.email || booking.guestId === guest.id
      );
      if (guestBooking) {
        await bookingService.updateBookingStatus(guestBooking.id, 'checked_out');
        await loadData();
        toast.success(`${guest.name || `${guest.firstName} ${guest.lastName}`} checked out`);
      } else {
        toast.error('No active booking found for this guest');
      }
    } catch (error: any) {
      console.error('Error checking out guest:', error);
      toast.error(error.message || 'Failed to check out guest');
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Guest Management</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "admin" 
                ? "View and delete guest records" 
                : user?.role === "receptionist" 
                ? "View guest information and register new guests"
                : "View guest information"
              } • {filteredGuests.length} guests found
            </p>
          </div>
          {user?.role === "receptionist" && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Register Guest
          </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Register New Guest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter guest's full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="guest@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+254 712 345 678"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                      placeholder="Enter ID number"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddGuest} className="flex-1">Register Guest</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-56">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="checked_in">Checked in</SelectItem>
                    <SelectItem value="checked_out">Checked out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest List */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No guests found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'No guests have been registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGuests.map((guest) => {
              const guestBooking = bookings.find(booking => 
                booking.guestDetails?.email === guest.email || booking.guestId === guest.id
              );
              const room = rooms.find((r) => r.id === guestBooking?.roomId);
              const status = getGuestStatus(guest);
              const guestName = guest.name || `${guest.firstName} ${guest.lastName}`;
              const idNumber = guest.idNumber || guest.identificationNumber || 'N/A';
              
              return (
                <Card key={guest.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{guestName}</h3>
                          <p className="text-sm text-muted-foreground">ID: {idNumber}</p>
                        </div>
                        <div className="text-right">
                          {room && (
                            <>
                              <p className="text-sm font-medium">Room {room.number}</p>
                              <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
                            </>
                          )}
                          <Badge 
                            variant={status === "checked_in" ? "default" : status === "upcoming" ? "secondary" : "outline"}
                            className="mt-1"
                          >
                            {status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{guest.phone}</span>
                      </div>
                    </div>

                      {guestBooking && (
                        <div className="flex justify-between pt-4 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Check-in</p>
                            <p className="text-sm font-medium">{new Date(guestBooking.checkIn).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Check-out</p>
                            <p className="text-sm font-medium">{new Date(guestBooking.checkOut).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                    <div className="flex gap-2">
                      {/* Status actions */}
                      {status === "upcoming" && (
                        <Button size="sm" variant="secondary" onClick={() => checkInGuest(guest)} className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" /> Check in
                        </Button>
                      )}
                      {status === "checked-in" && (
                        <Button size="sm" variant="secondary" onClick={() => checkOutGuest(guest)} className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" /> Check out
                        </Button>
                      )}

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openViewDialog(guest)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      {user?.role === "receptionist" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(guest)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedGuest(guest); setIsCreateRoomDialogOpen(true); }}>
                            <Bed className="h-4 w-4 mr-1" /> Create room
                          </Button>
                        </>
                      )}

                      {user?.role === "admin" && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openDeleteDialog(guest)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Guest Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Guest Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter guest's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="guest@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-idNumber">ID Number</Label>
                <Input
                  id="edit-idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  placeholder="Enter ID number"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditGuest} className="flex-1">Update Guest</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* Delete Guest Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Guest</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedGuest?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGuest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Guest Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Guest Details
              </DialogTitle>
            </DialogHeader>
            {selectedGuest && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-semibold">{selectedGuest.name || `${selectedGuest.firstName} ${selectedGuest.lastName}`}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedGuest.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{selectedGuest.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">ID Number</Label>
                    <p className="text-sm">{selectedGuest.idNumber || selectedGuest.identificationNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    <p className="text-sm">{selectedGuest.nationality || 'N/A'}</p>
                  </div>
                </div>
                {(selectedGuest.address || (selectedGuest.address && selectedGuest.address.street)) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-sm">
                      {typeof selectedGuest.address === 'string' 
                        ? selectedGuest.address 
                        : `${selectedGuest.address?.street}, ${selectedGuest.address?.city}, ${selectedGuest.address?.country}`
                      }
                    </p>
                  </div>
                )}
                {selectedGuest.specialRequests && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Special Requests</Label>
                    <p className="text-sm">{selectedGuest.specialRequests}</p>
                  </div>
                )}
                {selectedGuest.emergencyContact && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                    <p className="text-sm font-semibold">{selectedGuest.emergencyContact.name}</p>
                    <p className="text-sm">{selectedGuest.emergencyContact.phone} • {selectedGuest.emergencyContact.relationship}</p>
                  </div>
                )}
                {/* Show booking details if available */}
                {(() => {
                  const guestBooking = bookings.find(booking => 
                    booking.guestDetails?.email === selectedGuest.email || booking.guestId === selectedGuest.id
                  );
                  const room = rooms.find((r) => r.id === guestBooking?.roomId);
                  
                  return guestBooking ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                          <p className="text-sm font-semibold">{new Date(guestBooking.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Check-out Date</Label>
                          <p className="text-sm font-semibold">{new Date(guestBooking.checkOut).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {room && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                          <p className="text-sm font-semibold">
                            Room {room.number} - {room.type}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Booking Status</Label>
                      <p className="text-sm text-muted-foreground">No active booking</p>
                    </div>
                  );
                })()}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge 
                    variant={getGuestStatus(selectedGuest) === "checked-in" ? "default" : getGuestStatus(selectedGuest) === "upcoming" ? "secondary" : "outline"}
                  >
                    {getGuestStatus(selectedGuest).replace("-", " ")}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Booking History</Label>
                  <div className="space-y-2">
                    {bookings.filter(b => 
                      b.guestDetails?.email === selectedGuest.email || b.guestId === selectedGuest.id
                    ).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bookings</p>
                    ) : (
                      bookings.filter(b => 
                        b.guestDetails?.email === selectedGuest.email || b.guestId === selectedGuest.id
                      ).map(b => {
                        const room = rooms.find(r => r.id === b.roomId);
                        return (
                          <div key={b.id} className="text-sm flex justify-between border rounded p-2">
                            <span>Room {room?.number || 'N/A'}</span>
                            <span>{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</span>
                            <Badge variant="outline" className="capitalize">{b.status.replace('_', ' ')}</Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Guests;

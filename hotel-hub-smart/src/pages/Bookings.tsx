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
import { mockBookings, mockGuests, mockRooms, Booking } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Calendar, DollarSign, Search, Edit, Trash2, Eye, CheckCircle, XCircle, User, Bed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Bookings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    status: "confirmed" as "confirmed" | "checked-in" | "checked-out" | "cancelled",
    totalAmount: "",
    paidAmount: "",
  });

  const filteredBookings = bookings.filter((booking) => {
    const guest = mockGuests.find(g => g.id === booking.guestId);
    const room = mockRooms.find(r => r.id === booking.roomId);
    const matchesSearch = 
      guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddBooking = () => {
    if (!formData.guestId || !formData.roomId || !formData.checkIn || !formData.checkOut || !formData.totalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      guestId: formData.guestId,
      roomId: formData.roomId,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: formData.status,
      totalAmount: parseInt(formData.totalAmount),
      paidAmount: parseInt(formData.paidAmount) || 0,
    };

    setBookings([...bookings, newBooking]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Booking created successfully!");
  };

  const handleEditBooking = () => {
    if (!selectedBooking || !formData.guestId || !formData.roomId || !formData.checkIn || !formData.checkOut || !formData.totalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedBookings = bookings.map(booking =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            guestId: formData.guestId,
            roomId: formData.roomId,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            status: formData.status,
            totalAmount: parseInt(formData.totalAmount),
            paidAmount: parseInt(formData.paidAmount) || 0,
          }
        : booking
    );

    setBookings(updatedBookings);
    setIsEditDialogOpen(false);
    setSelectedBooking(null);
    resetForm();
    toast.success("Booking updated successfully!");
  };

  const handleDeleteBooking = () => {
    if (!selectedBooking) return;

    setBookings(bookings.filter(booking => booking.id !== selectedBooking.id));
    setIsDeleteDialogOpen(false);
    setSelectedBooking(null);
    toast.success("Booking deleted successfully!");
  };

  const handleCheckIn = (booking: Booking) => {
    const updatedBookings = bookings.map(b =>
      b.id === booking.id ? { ...b, status: "checked-in" as const } : b
    );
    setBookings(updatedBookings);
    toast.success("Guest checked in successfully!");
  };

  const handleCheckOut = (booking: Booking) => {
    const updatedBookings = bookings.map(b =>
      b.id === booking.id ? { ...b, status: "checked-out" as const } : b
    );
    setBookings(updatedBookings);
    
    // Update room status to "cleaning" for housekeeping
    const updatedRooms = mockRooms.map(room =>
      room.id === booking.roomId ? { ...room, status: "cleaning" as const } : room
    );
    
    // Create automatic housekeeping task
    const newTask = {
      id: Date.now().toString(),
      roomId: booking.roomId,
      assignedTo: "", // Will be assigned by admin
      priority: "medium" as const,
      description: `Clean room after guest checkout - Booking ${booking.id}`,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store task in localStorage (in a real app, this would be an API call)
    const existingTasks = JSON.parse(localStorage.getItem("housekeepingTasks") || "[]");
    existingTasks.push(newTask);
    localStorage.setItem("housekeepingTasks", JSON.stringify(existingTasks));
    
    toast.success("Guest checked out successfully! Cleaning task created automatically.");
  };

  const handleCancelBooking = (booking: Booking) => {
    const updatedBookings = bookings.map(b =>
      b.id === booking.id ? { ...b, status: "cancelled" as const } : b
    );
    setBookings(updatedBookings);
    toast.success("Booking cancelled successfully!");
  };

  const resetForm = () => {
    setFormData({
      guestId: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      status: "confirmed",
      totalAmount: "",
      paidAmount: "",
    });
  };

  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      guestId: booking.guestId,
      roomId: booking.roomId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
      totalAmount: booking.totalAmount.toString(),
      paidAmount: booking.paidAmount.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (booking: Booking) => {
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
                    <Label htmlFor="guestId">Guest</Label>
                    <Select value={formData.guestId} onValueChange={(value) => setFormData({...formData, guestId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockGuests.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id}>
                            {guest.name} - {guest.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockRooms.filter(room => room.status === "available").map((room) => (
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount (KES)</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Paid Amount (KES)</Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked-in">Checked-in</SelectItem>
                        <SelectItem value="checked-out">Checked-out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <SelectItem value="checked-in">Checked-in</SelectItem>
                  <SelectItem value="checked-out">Checked-out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => {
            const guest = mockGuests.find((g) => g.id === booking.guestId);
            const room = mockRooms.find((r) => r.id === booking.roomId);
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
                          <h3 className="text-xl font-bold">{guest?.name}</h3>
                          <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
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
                          {booking.status === "checked-in" && (
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
                          {(booking.status === "confirmed" || booking.status === "checked-in") && (
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

        {/* Edit Booking Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-guestId">Guest</Label>
                <Select value={formData.guestId} onValueChange={(value) => setFormData({...formData, guestId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGuests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name} - {guest.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-roomId">Room</Label>
                <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} - {room.type} (KES {room.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-checkIn">Check-in Date</Label>
                  <Input
                    id="edit-checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-checkOut">Check-out Date</Label>
                  <Input
                    id="edit-checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-totalAmount">Total Amount (KES)</Label>
                  <Input
                    id="edit-totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-paidAmount">Paid Amount (KES)</Label>
                  <Input
                    id="edit-paidAmount"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked-in">Checked-in</SelectItem>
                    <SelectItem value="checked-out">Checked-out</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                  <p className="text-sm font-semibold">{mockGuests.find(g => g.id === selectedBooking.guestId)?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                  <p className="text-sm font-semibold">
                    Room {mockRooms.find(r => r.id === selectedBooking.roomId)?.number} - 
                    {mockRooms.find(r => r.id === selectedBooking.roomId)?.type}
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

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { mockGuests, mockRooms, mockBookings, Guest, Room, RoomType } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Mail, Phone, Edit, Trash2, Eye, User, Calendar, Bed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Guests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'checked-in' | 'checked-out'>("all");
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
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
    checkIn: "",
    checkOut: "",
    roomId: "",
  });

  const [roomFormData, setRoomFormData] = useState({
    number: "",
    type: "single" as RoomType,
    price: "",
    floor: "",
    capacity: "",
  });

  // Moved above filteredGuests to avoid reference error
  const getGuestStatus = (guest: Guest) => {
    const today = new Date();
    const checkIn = new Date(guest.checkIn);
    const checkOut = new Date(guest.checkOut);
    
    if (today < checkIn) return "upcoming";
    if (today >= checkIn && today <= checkOut) return "checked-in";
    return "checked-out";
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      guest.idNumber.includes(searchTerm);
    const status = getGuestStatus(guest);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGuest = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.idNumber || !formData.checkIn || !formData.checkOut || !formData.roomId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const [firstName, ...rest] = formData.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    const newGuest: Guest = {
      id: Date.now().toString(),
      firstName,
      lastName,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      idNumber: formData.idNumber,
      nationality: formData.nationality || "Unknown",
      address: formData.address || undefined,
      specialRequests: formData.specialRequests || undefined,
      emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship)
        ? {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
          }
        : undefined,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomId: formData.roomId,
    };

    setGuests([...guests, newGuest]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Guest registered successfully!");
  };


  const handleDeleteGuest = () => {
    if (!selectedGuest) return;

    setGuests(guests.filter(guest => guest.id !== selectedGuest.id));
    setIsDeleteDialogOpen(false);
    setSelectedGuest(null);
    toast.success("Guest deleted successfully!");
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


  const openDeleteDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData({
      name: guest.name || `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      idNumber: guest.idNumber,
      nationality: guest.nationality || "",
      address: guest.address || "",
      specialRequests: guest.specialRequests || "",
      emergencyContactName: guest.emergencyContact?.name || "",
      emergencyContactPhone: guest.emergencyContact?.phone || "",
      emergencyContactRelationship: guest.emergencyContact?.relationship || "",
      checkIn: guest.checkIn,
      checkOut: guest.checkOut,
      roomId: guest.roomId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditGuest = () => {
    if (!selectedGuest) return;
    const [firstName, ...rest] = formData.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;
    const updated: Guest = {
      ...selectedGuest,
      firstName,
      lastName,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      idNumber: formData.idNumber,
      nationality: formData.nationality || "Unknown",
      address: formData.address || undefined,
      specialRequests: formData.specialRequests || undefined,
      emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship)
        ? {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
          }
        : undefined,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomId: formData.roomId || undefined,
    };
    setGuests(guests.map(g => g.id === selectedGuest.id ? updated : g));
    setIsEditDialogOpen(false);
    setSelectedGuest(updated);
    toast.success("Guest updated successfully!");
  };

  const checkInGuest = (guest: Guest) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const updated = { ...guest, checkIn: todayStr } as Guest;
    setGuests(prev => prev.map(g => g.id === guest.id ? updated : g));
    toast.success(`${guest.name} checked in`);
  };

  const checkOutGuest = (guest: Guest) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const updated = { ...guest, checkOut: todayStr } as Guest;
    setGuests(prev => prev.map(g => g.id === guest.id ? updated : g));
    toast.success(`${guest.name} checked out`);
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
                    <SelectItem value="checked-in">Checked in</SelectItem>
                    <SelectItem value="checked-out">Checked out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGuests.map((guest) => {
    const room = rooms.find((r) => r.id === guest.roomId);
            const status = getGuestStatus(guest);
            return (
              <Card key={guest.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{guest.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {guest.idNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Room {room?.number}</p>
                        <p className="text-xs text-muted-foreground capitalize">{room?.type}</p>
                        <Badge 
                          variant={status === "checked-in" ? "default" : status === "upcoming" ? "secondary" : "outline"}
                          className="mt-1"
                        >
                          {status.replace("-", " ")}
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

                    <div className="flex justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                        <p className="text-sm font-medium">{new Date(guest.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Check-out</p>
                        <p className="text-sm font-medium">{new Date(guest.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>

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
              <div className="space-y-2">
                <Label htmlFor="edit-roomId">Room</Label>
                <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} - {room.type} (KES {room.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditGuest} className="flex-1">Update Guest</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Room and Assign Dialog (Receptionist) */}
        <Dialog open={isCreateRoomDialogOpen} onOpenChange={setIsCreateRoomDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Room and Assign to Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room Number</Label>
                  <Input id="room-number" value={roomFormData.number} onChange={(e)=>setRoomFormData({...roomFormData, number: e.target.value})} placeholder="e.g., 205" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-floor">Floor</Label>
                  <Input id="room-floor" type="number" value={roomFormData.floor} onChange={(e)=>setRoomFormData({...roomFormData, floor: e.target.value})} placeholder="e.g., 2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={roomFormData.type} onValueChange={(v)=>setRoomFormData({...roomFormData, type: v as RoomType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Capacity</Label>
                  <Input id="room-capacity" type="number" value={roomFormData.capacity} onChange={(e)=>setRoomFormData({...roomFormData, capacity: e.target.value})} placeholder="e.g., 2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-price">Price (KES)</Label>
                  <Input id="room-price" type="number" value={roomFormData.price} onChange={(e)=>setRoomFormData({...roomFormData, price: e.target.value})} placeholder="e.g., 8000" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => {
                  if (!roomFormData.number || !roomFormData.price || !roomFormData.floor || !roomFormData.capacity || !selectedGuest) {
                    toast.error("Please fill all fields");
                    return;
                  }
                  const newRoom: Room = {
                    id: Date.now().toString(),
                    number: roomFormData.number,
                    type: roomFormData.type,
                    status: "available",
                    price: parseInt(roomFormData.price),
                    floor: parseInt(roomFormData.floor),
                    capacity: parseInt(roomFormData.capacity),
                    amenities: [],
                  } as any;
                  setRooms(prev => [...prev, newRoom]);
                  // assign to guest
                  setGuests(prev => prev.map(g => g.id === selectedGuest.id ? { ...g, roomId: newRoom.id } : g));
                  setSelectedGuest({ ...selectedGuest, roomId: newRoom.id });
                  toast.success(`Room ${newRoom.number} created and assigned to ${selectedGuest.name}`);
                  setIsCreateRoomDialogOpen(false);
                  setRoomFormData({ number: "", type: "single", price: "", floor: "", capacity: "" });
                }} className="flex-1">Create & Assign</Button>
                <Button variant="outline" onClick={() => setIsCreateRoomDialogOpen(false)}>Cancel</Button>
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
                  <p className="text-lg font-semibold">{selectedGuest.name}</p>
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
                    <p className="text-sm">{selectedGuest.idNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    <p className="text-sm">{selectedGuest.nationality}</p>
                  </div>
                </div>
                {selectedGuest.address && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-sm">{selectedGuest.address}</p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                    <p className="text-sm font-semibold">{new Date(selectedGuest.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Check-out Date</Label>
                    <p className="text-sm font-semibold">{new Date(selectedGuest.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                  <p className="text-sm font-semibold">
                    Room {rooms.find(r => r.id === selectedGuest.roomId)?.number} - 
                    {rooms.find(r => r.id === selectedGuest.roomId)?.type}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge 
                    variant={getGuestStatus(selectedGuest) === "checked-in" ? "default" : getGuestStatus(selectedGuest) === "upcoming" ? "secondary" : "outline"}
                  >
                    {getGuestStatus(selectedGuest).replace("-", " ")}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Bookings</Label>
                  <div className="space-y-2">
                    {mockBookings.filter(b => b.guestId === selectedGuest.id).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bookings</p>
                    ) : (
                      mockBookings.filter(b => b.guestId === selectedGuest.id).map(b => (
                        <div key={b.id} className="text-sm flex justify-between border rounded p-2">
                          <span>Room {rooms.find(r => r.id === b.roomId)?.number}</span>
                          <span>{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</span>
                          <Badge variant="outline" className="capitalize">{b.status.replace('-', ' ')}</Badge>
                        </div>
                      ))
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

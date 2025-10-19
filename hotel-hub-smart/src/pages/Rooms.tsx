import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Grid, List, Plus, Edit, Trash2, Eye, Bed } from "lucide-react";
import { toast } from "sonner";
import roomService from "@/services/roomService";

type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out-of-order';
type RoomType = 'Smart Economy' | 'Business Suite' | 'Premium Deluxe' | 'Presidential';

const Rooms = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<RoomStatus | "all">("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    number: "",
    type: "Smart Economy" as RoomType,
    status: "available" as RoomStatus,
    price: "",
    floor: "",
    capacity: "",
  });

  // Load rooms on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await roomService.getTransformedRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddRoom = async () => {
    if (!formData.number || !formData.price || !formData.floor || !formData.capacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const roomData = {
        number: formData.number,
        type: formData.type,
        status: formData.status,
        price: parseInt(formData.price),
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
      };

      await roomService.createRoom(roomData);
      await loadRooms(); // Refresh the data
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Room added successfully!");
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error(error.message || 'Failed to create room');
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom || !formData.number || !formData.price || !formData.floor || !formData.capacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const roomData = {
        number: formData.number,
        type: formData.type,
        status: formData.status,
        price: parseInt(formData.price),
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
      };

      await roomService.updateRoom(selectedRoom.id, roomData);
      await loadRooms(); // Refresh the data
      setIsEditDialogOpen(false);
      setSelectedRoom(null);
      resetForm();
      toast.success("Room updated successfully!");
    } catch (error: any) {
      console.error('Error updating room:', error);
      toast.error(error.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      await roomService.deleteRoom(selectedRoom.id);
      await loadRooms(); // Refresh the data
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      toast.success("Room deleted successfully!");
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast.error(error.message || 'Failed to delete room');
    }
  };

  const resetForm = () => {
    setFormData({
      number: "",
      type: "single",
      status: "available",
      price: "",
      floor: "",
      capacity: "",
    });
  };

  const openEditDialog = (room: any) => {
    setSelectedRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      status: room.status,
      price: room.price.toString(),
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (room: any) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (room: any) => {
    setSelectedRoom(room);
    setIsViewDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Room Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all hotel rooms • {filteredRooms.length} rooms found
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "receptionist") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Room Number</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                        placeholder="e.g., 101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor}
                        onChange={(e) => setFormData({...formData, floor: e.target.value})}
                        placeholder="e.g., 1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Room Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as RoomType})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Smart Economy">Smart Economy</SelectItem>
                        <SelectItem value="Business Suite">Business Suite</SelectItem>
                        <SelectItem value="Premium Deluxe">Premium Deluxe</SelectItem>
                        <SelectItem value="Presidential">Presidential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="e.g., 5000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as RoomStatus})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddRoom} className="flex-1">Add Room</Button>
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
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Room {room.number}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span className="font-medium">{room.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{room.adults} adults{room.children ? `, ${room.children} child${room.children>1?'ren':''}` : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-primary">KES {room.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openViewDialog(room)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {(user?.role === "admin" || user?.role === "receptionist") && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(room)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user?.role === "admin" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openDeleteDialog(room)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="p-4 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <h3 className="text-lg font-bold">Room {room.number}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                        </div>
                        <StatusBadge status={room.status} />
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                          <p className="text-sm text-muted-foreground">{room.adults} adults{room.children ? `, ${room.children} child${room.children>1?'ren':''}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">KES {room.price}</p>
                        </div>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Room Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Room Number</Label>
                  <Input
                    id="edit-number"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="e.g., 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-floor">Floor</Label>
                  <Input
                    id="edit-floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Room Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as RoomType})}>
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
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g., 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (KES)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as RoomStatus})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditRoom} className="flex-1">Update Room</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Room Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Room</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Room {selectedRoom?.number}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Room Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room {selectedRoom?.number} Details
              </DialogTitle>
            </DialogHeader>
            {selectedRoom && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Room Number</Label>
                    <p className="text-lg font-semibold">{selectedRoom.number}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Floor</Label>
                    <p className="text-lg font-semibold">{selectedRoom.floor}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Room Type</Label>
                    <p className="text-lg font-semibold">{selectedRoom.type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Capacity</Label>
                    <p className="text-lg font-semibold">{selectedRoom.adults} adults{selectedRoom.children ? `, ${selectedRoom.children} child${selectedRoom.children>1?'ren':''}` : ''}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <StatusBadge status={selectedRoom.status} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Price per Night</Label>
                  <p className="text-2xl font-bold text-primary">KES {selectedRoom.price}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Rooms;

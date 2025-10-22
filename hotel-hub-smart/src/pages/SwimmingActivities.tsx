import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Search, Plus, Clock, Users, DollarSign, Waves, Calendar as CalendarIcon, Thermometer, MapPin, Edit, Trash2, Eye, MoreHorizontal, Settings } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import poolService, { type SwimmingActivity as BackendSwimmingActivity, type PoolFacility as BackendPoolFacility, type PoolBooking as BackendPoolBooking } from "@/services/poolService";
import guestService from "@/services/guestService";
import { 
  mockPoolEquipment,
  PoolFacility, 
  SwimmingActivity,
  PoolReservation,
  PoolEquipment,
  ActivityType,
  ReservationStatus,
  EquipmentType 
} from "@/data/mockData";

const SwimmingActivities = () => {
  const { user } = useAuth();
  const [poolFacilities, setPoolFacilities] = useState<PoolFacility[]>([]);
  const [swimmingActivities, setSwimmingActivities] = useState<SwimmingActivity[]>([]);
  const [poolReservations, setPoolReservations] = useState<PoolReservation[]>([]);
  const [poolEquipment, setPoolEquipment] = useState<PoolEquipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | "all">("all");
  const [selectedReservationStatus, setSelectedReservationStatus] = useState<ReservationStatus | "all">("all");
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  // Pool Status Management
  const [isNewPoolOpen, setIsNewPoolOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<PoolFacility | null>(null);
  const [viewingPool, setViewingPool] = useState<PoolFacility | null>(null);
  const [deletingPool, setDeletingPool] = useState<PoolFacility | null>(null);
  const [isPoolViewOpen, setIsPoolViewOpen] = useState(false);
  const [isPoolDeleteOpen, setIsPoolDeleteOpen] = useState(false);
  
  // Equipment Management
  const [isNewEquipmentOpen, setIsNewEquipmentOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<PoolEquipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<PoolEquipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<PoolEquipment | null>(null);
  const [isEquipmentViewOpen, setIsEquipmentViewOpen] = useState(false);
  const [isEquipmentDeleteOpen, setIsEquipmentDeleteOpen] = useState(false);
  
  // Activity Management
  const [editingActivity, setEditingActivity] = useState<SwimmingActivity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<SwimmingActivity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<SwimmingActivity | null>(null);
  const [isActivityViewOpen, setIsActivityViewOpen] = useState(false);
  const [isActivityDeleteOpen, setIsActivityDeleteOpen] = useState(false);
  
  // Reservation Management
  const [deletingReservation, setDeletingReservation] = useState<PoolReservation | null>(null);
  const [isReservationDeleteOpen, setIsReservationDeleteOpen] = useState(false);

  // Guest email suggestions for reservation dialog
  const [guestEmailQuery, setGuestEmailQuery] = useState("");
  const [guestEmailOptions, setGuestEmailOptions] = useState<any[]>([]);

  useEffect(() => {
    let t: any;
    const run = async () => {
      const res = await guestService.getAllGuests(guestEmailQuery);
      setGuestEmailOptions(res.map((g: any) => ({ id: g.id, email: g.email, name: g.name })));
    };
    if (isNewReservationOpen) {
      t = setTimeout(run, 300);
    }
    return () => t && clearTimeout(t);
  }, [guestEmailQuery, isNewReservationOpen]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pools, activities, equipment, myBookings] = await Promise.all([
          poolService.getTransformedPools(),
          poolService.getTransformedActivities(),
          poolService.getTransformedEquipment(),
          poolService.getMyPoolBookings().catch(() => []),
        ]);
        setPoolFacilities(pools as PoolFacility[]);
        setSwimmingActivities(activities as SwimmingActivity[]);
        setPoolEquipment(equipment as PoolEquipment[]);
        // Transform backend bookings to UI reservations
        const reservations: PoolReservation[] = (myBookings as BackendPoolBooking[]).map((b) => ({
          id: b._id,
          guestId: b.guest,
          poolId: b.poolId,
          activityId: b.activityId,
          reservationType: b.activityId ? 'activity' : 'pool-access',
          date: (b.bookingDate as any as string).slice(0,10),
          timeSlot: { start: b.startTime || '', end: b.endTime || '' },
          participants: b.numberOfParticipants,
          status: (b.status as any),
          totalAmount: b.totalAmount,
          paymentStatus: 'paid',
          createdAt: (b.createdAt as any as string),
          updatedAt: (b.updatedAt as any as string),
        }));
        setPoolReservations(reservations);
      } catch (e) {
        console.error('Failed to load swimming data', e);
        toast.error('Failed to load swimming data');
      }
    };
    load();
  }, []);

  const filteredActivities = swimmingActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedActivityType === "all" || activity.type === selectedActivityType;
    return matchesSearch && matchesType;
  });

  const filteredReservations = poolReservations.filter(reservation => {
    return selectedReservationStatus === "all" || reservation.status === selectedReservationStatus;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    const statusMap = {
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      "checked-in": { color: "bg-green-100 text-green-800", label: "Checked In" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      "no-show": { color: "bg-orange-100 text-orange-800", label: "No Show" }
    };
    
    const status_info = statusMap[status];
    return (
      <Badge className={status_info.color}>
        {status_info.label}
      </Badge>
    );
  };

  const getPoolStatusBadge = (status: string) => {
    const statusMap = {
      open: { color: "bg-green-100 text-green-800", label: "Open" },
      closed: { color: "bg-red-100 text-red-800", label: "Closed" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      "private-event": { color: "bg-purple-100 text-purple-800", label: "Private Event" }
    };
    
    const status_info = statusMap[status as keyof typeof statusMap];
    return (
      <Badge className={status_info.color}>
        {status_info.label}
      </Badge>
    );
  };

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      if (newStatus === 'cancelled') {
        const updated = await poolService.cancelPoolBooking(reservationId);
        setPoolReservations(prev => prev.map(res => res.id === reservationId ? {
          ...res,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        } : res));
      } else {
        // No backend endpoint for other status changes yet; update locally
        setPoolReservations(prev => prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: newStatus, updatedAt: new Date().toISOString() }
            : reservation
        ));
      }
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update reservation');
    }
  };

  const handleCreateReservation = async (formData: FormData) => {
    try {
      const payload = {
        poolId: formData.get("poolId") as string,
        activityId: undefined,
        bookingDate: formData.get("date") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        numberOfParticipants: 1,
      } as any;
      const created = await poolService.createPoolBooking(payload as any);
      // Record payment immediately (staff)
      try {
        await poolService.addPoolPayment(created._id, {
          amount: created.totalAmount,
          method: 'mobile_money',
          transactionId: [formData.get("mpesaTxId") as string, formData.get("mpesaPhone") as string].filter(Boolean).join('|') || undefined,
          status: 'completed',
        } as any);
      } catch (e) { /* ignore payment failure here; UI will still show reservation */ }
      const newReservation: PoolReservation = {
        id: created._id,
        guestId: created.guest,
        poolId: created.poolId,
        activityId: created.activityId,
        reservationType: created.activityId ? 'activity' : 'pool-access',
        date: (created.bookingDate as any as string).slice(0,10),
        timeSlot: { start: created.startTime || '', end: created.endTime || '' },
        participants: created.numberOfParticipants,
        status: created.status as any,
        totalAmount: created.totalAmount,
        paymentStatus: 'pending',
        createdAt: (created.createdAt as any as string),
        updatedAt: (created.updatedAt as any as string),
      };
      setPoolReservations(prev => [newReservation, ...prev]);
      toast.success("Reservation created successfully");
      setIsNewReservationOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create reservation');
    }
  };

  // Pool Management Functions
  const handleSavePool = (formData: FormData) => {
    const newPool: PoolFacility = {
      id: editingPool?.id || Date.now().toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as "indoor" | "outdoor" | "infinity" | "kiddie" | "lap",
      capacity: parseInt(formData.get("capacity") as string),
      currentOccupancy: editingPool?.currentOccupancy || 0,
      status: formData.get("status") as "open" | "closed" | "maintenance" | "private-event",
      temperature: parseInt(formData.get("temperature") as string),
      depth: {
        min: parseFloat(formData.get("minDepth") as string),
        max: parseFloat(formData.get("maxDepth") as string)
      },
      operatingHours: {
        open: formData.get("openTime") as string,
        close: formData.get("closeTime") as string
      },
      amenities: (formData.get("amenities") as string).split(",").map(a => a.trim()).filter(Boolean),
      maintenanceSchedule: editingPool?.maintenanceSchedule
    };

    if (editingPool) {
      setPoolFacilities(prev => prev.map(pool => 
        pool.id === editingPool.id ? newPool : pool
      ));
      toast.success("Pool updated successfully");
    } else {
      setPoolFacilities(prev => [...prev, newPool]);
      toast.success("Pool added successfully");
    }
    
    setIsNewPoolOpen(false);
    setEditingPool(null);
  };

  const handleDeletePool = () => {
    if (!deletingPool) return;
    
    setPoolFacilities(prev => prev.filter(pool => pool.id !== deletingPool.id));
    toast.success("Pool deleted successfully");
    setIsPoolDeleteOpen(false);
    setDeletingPool(null);
  };

  // Equipment Management Functions
  const handleSaveEquipment = (formData: FormData) => {
    const newEquipment: PoolEquipment = {
      id: editingEquipment?.id || Date.now().toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as EquipmentType,
      totalQuantity: parseInt(formData.get("totalQuantity") as string),
      availableQuantity: parseInt(formData.get("availableQuantity") as string),
      dailyRate: parseInt(formData.get("dailyRate") as string),
      condition: formData.get("condition") as "excellent" | "good" | "fair" | "poor",
      isAvailable: formData.get("isAvailable") === "true",
      lastMaintenance: formData.get("lastMaintenance") as string,
      description: formData.get("description") as string || ""
    };

    if (editingEquipment) {
      setPoolEquipment(prev => prev.map(equipment => 
        equipment.id === editingEquipment.id ? newEquipment : equipment
      ));
      toast.success("Equipment updated successfully");
    } else {
      setPoolEquipment(prev => [...prev, newEquipment]);
      toast.success("Equipment added successfully");
    }
    
    setIsNewEquipmentOpen(false);
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = async () => {
    if (!deletingEquipment) return;
    try {
      await poolService.deleteEquipment(deletingEquipment.id);
      setPoolEquipment(prev => prev.filter(equipment => equipment.id !== deletingEquipment.id));
      toast.success("Equipment deleted successfully");
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete equipment');
    }
    setIsEquipmentDeleteOpen(false);
    setDeletingEquipment(null);
  };

  const handleDeleteReservation = () => {
    if (!deletingReservation) return;
    
    setPoolReservations(prev => prev.filter(reservation => reservation.id !== deletingReservation.id));
    toast.success("Reservation deleted successfully");
    setIsReservationDeleteOpen(false);
    setDeletingReservation(null);
  };

  // Activity Management Functions
  const handleSaveActivity = (formData: FormData) => {
    const newActivity: SwimmingActivity = {
      id: editingActivity?.id || Date.now().toString(),
      name: formData.get("activityName") as string,
      description: formData.get("activityDescription") as string,
      type: formData.get("activityType") as ActivityType,
      instructor: formData.get("instructor") as string || undefined,
      capacity: parseInt(formData.get("activityCapacity") as string),
      currentParticipants: editingActivity?.currentParticipants || 0,
      price: parseInt(formData.get("activityPrice") as string),
      duration: parseInt(formData.get("duration") as string),
      skillLevel: formData.get("skillLevel") as "beginner" | "intermediate" | "advanced" | "all-levels",
      isActive: formData.get("isActive") === "true",
      nextSession: formData.get("nextSession") as string,
      poolId: formData.get("activityPoolId") as string,
      schedule: {
        days: (formData.get("scheduleDays") as string).split(",").map(d => d.trim() as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"),
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string
      },
      requirements: (formData.get("requirements") as string).split(",").map(r => r.trim()).filter(Boolean),
      equipment: (formData.get("equipment") as string).split(",").map(e => e.trim()).filter(Boolean)
    };

    if (editingActivity) {
      setSwimmingActivities(prev => prev.map(activity => 
        activity.id === editingActivity.id ? newActivity : activity
      ));
      toast.success("Activity updated successfully");
    } else {
      setSwimmingActivities(prev => [...prev, newActivity]);
      toast.success("Activity added successfully");
    }
    
    setIsNewActivityOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (!deletingActivity) return;
    
    setSwimmingActivities(prev => prev.filter(activity => activity.id !== deletingActivity.id));
    toast.success("Activity deleted successfully");
    setIsActivityDeleteOpen(false);
    setDeletingActivity(null);
  };

  const handleToggleActivityStatus = (activityId: string) => {
    setSwimmingActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, isActive: !activity.isActive }
        : activity
    ));
    const activity = swimmingActivities.find(a => a.id === activityId);
    toast.success(`${activity?.name} ${activity?.isActive ? 'deactivated' : 'activated'}`);
  };

  const canManageActivities = user?.role === "admin";
  const canManagePools = user?.role === "admin";
  const canManageEquipment = user?.role === "admin";
  const canCreateReservations = user?.role === "receptionist" || user?.role === "guest";
  const canViewReservations = user?.role === "admin" || user?.role === "receptionist";
  const canDeleteReservations = user?.role === "admin";

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Swimming & Activities</h2>
        </div>
        
        <Tabs defaultValue="pools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pools">Pool Status</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            {canManageActivities && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>
          
          {/* Pool Status Tab */}
          <TabsContent value="pools">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pool Management</CardTitle>
                    <CardDescription>
                      {canManagePools ? "Manage pool facilities and their status" : "View pool status and availability"}
                    </CardDescription>
                  </div>
                  {canManagePools && (
                    <Dialog open={isNewPoolOpen} onOpenChange={setIsNewPoolOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingPool(null)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Pool
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingPool ? "Edit Pool" : "Add New Pool"}</DialogTitle>
                          <DialogDescription>
                            {editingPool ? "Update pool details" : "Create a new pool facility"}
                          </DialogDescription>
                        </DialogHeader>
                        {/* Pool Form */}
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            // Build minimal payload per request
                            const payload: any = {
                              name: fd.get('name') as string,
                              type: fd.get('type') as string,
                              depth: {
                                min: parseFloat(fd.get('minDepth') as string),
                                max: parseFloat(fd.get('maxDepth') as string),
                              },
                              operatingHours: {
                                open: fd.get('openTime') as string,
                                close: fd.get('closeTime') as string,
                              },
                            };
                            try {
                              if (editingPool) {
                                const updated = await poolService.updatePoolFacility(editingPool.id, payload);
                                setPoolFacilities(prev => prev.map(p => p.id === editingPool.id ? updated : p));
                                toast.success('Pool updated successfully');
                              } else {
                                const created = await poolService.createPoolFacility(payload);
                                setPoolFacilities(prev => [created, ...prev]);
                                toast.success('Pool added successfully');
                              }
                              setIsNewPoolOpen(false);
                              setEditingPool(null);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to save pool');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="name">Pool Name</Label>
                            <Input id="name" name="name" defaultValue={editingPool?.name} required />
                          </div>
                          <div>
                            <Label htmlFor="type">Pool Type</Label>
                            <Select name="type" defaultValue={editingPool?.type}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="indoor">Indoor</SelectItem>
                                <SelectItem value="outdoor">Outdoor</SelectItem>
                                <SelectItem value="infinity">Infinity</SelectItem>
                                <SelectItem value="kiddie">Kiddie Pool</SelectItem>
                                <SelectItem value="lap">Lap Pool</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="minDepth">Min Depth (m)</Label>
                              <Input id="minDepth" name="minDepth" type="number" step="0.1" defaultValue={editingPool?.depth.min} required />
                            </div>
                            <div>
                              <Label htmlFor="maxDepth">Max Depth (m)</Label>
                              <Input id="maxDepth" name="maxDepth" type="number" step="0.1" defaultValue={editingPool?.depth.max} required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="openTime">Open Time</Label>
                              <Input id="openTime" name="openTime" type="time" defaultValue={editingPool?.operatingHours.open} required />
                            </div>
                            <div>
                              <Label htmlFor="closeTime">Close Time</Label>
                              <Input id="closeTime" name="closeTime" type="time" defaultValue={editingPool?.operatingHours.close} required />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => { setIsNewPoolOpen(false); setEditingPool(null); }}>Cancel</Button>
                            <Button type="submit">{editingPool ? "Update Pool" : "Add Pool"}</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {poolFacilities.map((pool) => (
                <Card key={pool.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <CardDescription>
                          {pool.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPoolStatusBadge(pool.status)}
                        {canManagePools && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setViewingPool(pool); setIsPoolViewOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingPool(pool); setIsNewPoolOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Pool
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setDeletingPool(pool); setIsPoolDeleteOpen(true); }} className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Pool
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Capacity:</span>
                        <span>{pool.currentOccupancy}/{pool.capacity}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Thermometer className="mr-1 h-3 w-3" />
                          Temperature:
                        </span>
                        <span>{pool.temperature}°C</span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Depth:</span> {pool.depth.min}m - {pool.depth.max}m
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Hours:</span> {pool.operatingHours.open} - {pool.operatingHours.close}
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Amenities:</span>
                        <div className="flex flex-wrap gap-1">
                          {pool.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {pool.maintenanceSchedule && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                          Next maintenance: {pool.maintenanceSchedule.nextMaintenance}
                          <br />
                          Type: {pool.maintenanceSchedule.maintenanceType}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Swimming Activities</CardTitle>
                    <CardDescription>
                      Manage pool activities, classes, and events
                    </CardDescription>
                  </div>
                  {canManageActivities && (
                    <Dialog open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingActivity(null)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingActivity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
                          <DialogDescription>
                            {editingActivity ? "Update swimming activity details" : "Create a new swimming activity or class"}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const payload: any = {
                              name: fd.get('activityName') as string,
                              description: fd.get('activityDescription') as string,
                              type: fd.get('activityType') as string,
                              instructor: (fd.get('instructor') as string) || undefined,
                              capacity: parseInt(fd.get('activityCapacity') as string),
                              price: parseInt(fd.get('activityPrice') as string),
                              duration: parseInt(fd.get('duration') as string),
                              skillLevel: fd.get('skillLevel') as string,
                              isActive: !!fd.get('isActive'),
                              nextSession: fd.get('nextSession') as string,
                              poolId: fd.get('activityPoolId') as string,
                            };
                            try {
                              if (editingActivity) {
                                const updated = await poolService.updateSwimmingActivity(editingActivity.id, payload);
                                setSwimmingActivities(prev => prev.map(a => a.id === editingActivity.id ? updated : a));
                                toast.success('Activity updated successfully');
                              } else {
                                const created = await poolService.createSwimmingActivity(payload);
                                setSwimmingActivities(prev => [created, ...prev]);
                                toast.success('Activity added successfully');
                              }
                              setIsNewActivityOpen(false);
                              setEditingActivity(null);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to save activity');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="activityName">Activity Name</Label>
                              <Input id="activityName" name="activityName" defaultValue={editingActivity?.name} required />
                            </div>
                            <div>
                              <Label htmlFor="activityType">Type</Label>
                              <Select name="activityType" defaultValue={editingActivity?.type}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="swimming">Swimming</SelectItem>
                                  <SelectItem value="water-aerobics">Water Aerobics</SelectItem>
                                  <SelectItem value="pool-party">Pool Party</SelectItem>
                                  <SelectItem value="swimming-lesson">Swimming Lessons</SelectItem>
                                  <SelectItem value="aqua-therapy">Aqua Therapy</SelectItem>
                                  <SelectItem value="pool-games">Pool Games</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="activityDescription">Description</Label>
                            <Textarea id="activityDescription" name="activityDescription" defaultValue={editingActivity?.description} required />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="instructor">Instructor</Label>
                              <Input id="instructor" name="instructor" defaultValue={editingActivity?.instructor} />
                            </div>
                            <div>
                              <Label htmlFor="activityPoolId">Pool</Label>
                              <Select name="activityPoolId" defaultValue={editingActivity?.poolId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pool" />
                                </SelectTrigger>
                                <SelectContent>
                                  {poolFacilities.map(pool => (
                                    <SelectItem key={pool.id} value={pool.id}>{pool.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="activityCapacity">Capacity</Label>
                              <Input id="activityCapacity" name="activityCapacity" type="number" defaultValue={editingActivity?.capacity} required />
                            </div>
                            <div>
                              <Label htmlFor="activityPrice">Price (KES)</Label>
                              <Input id="activityPrice" name="activityPrice" type="number" defaultValue={editingActivity?.price} required />
                            </div>
                            <div>
                              <Label htmlFor="duration">Duration (min)</Label>
                              <Input id="duration" name="duration" type="number" defaultValue={editingActivity?.duration} required />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="skillLevel">Skill Level</Label>
                              <Select name="skillLevel" defaultValue={editingActivity?.skillLevel}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="all-levels">All Levels</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="nextSession">Next Session</Label>
                              <Input id="nextSession" name="nextSession" type="datetime-local" defaultValue={editingActivity?.nextSession} required />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="scheduleDays">Schedule Days</Label>
                              <Input id="scheduleDays" name="scheduleDays" placeholder="monday,tuesday,friday" defaultValue={editingActivity?.schedule?.days.join(",")} />
                            </div>
                            <div>
                              <Label htmlFor="startTime">Start Time</Label>
                              <Input id="startTime" name="startTime" type="time" defaultValue={editingActivity?.schedule?.startTime} />
                            </div>
                            <div>
                              <Label htmlFor="endTime">End Time</Label>
                              <Input id="endTime" name="endTime" type="time" defaultValue={editingActivity?.schedule?.endTime} />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="requirements">Requirements (comma separated)</Label>
                            <Input id="requirements" name="requirements" defaultValue={editingActivity?.requirements?.join(", ")} placeholder="Swimming experience, Age 18+" />
                          </div>
                          
                          <div>
                            <Label htmlFor="equipment">Required Equipment (comma separated)</Label>
                            <Input id="equipment" name="equipment" defaultValue={editingActivity?.equipment?.join(", ")} placeholder="Swimsuit, Towel, Goggles" />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="isActive" 
                              name="isActive" 
                              value="true"
                              defaultChecked={editingActivity?.isActive !== false}
                            />
                            <Label htmlFor="isActive">Active</Label>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setIsNewActivityOpen(false); setEditingActivity(null); }}>Cancel</Button>
                            <Button type="submit">{editingActivity ? "Update Activity" : "Add Activity"}</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedActivityType} onValueChange={(value) => setSelectedActivityType(value as ActivityType | "all")}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="water-aerobics">Water Aerobics</SelectItem>
                      <SelectItem value="pool-party">Pool Party</SelectItem>
                      <SelectItem value="swimming-lesson">Swimming Lessons</SelectItem>
                      <SelectItem value="aqua-therapy">Aqua Therapy</SelectItem>
                      <SelectItem value="pool-games">Pool Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredActivities.map((activity) => (
                    <Card key={activity.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{activity.name}</CardTitle>
                            <CardDescription>{activity.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={activity.isActive ? "default" : "secondary"}>
                              {activity.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {canManageActivities && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setViewingActivity(activity); setIsActivityViewOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setEditingActivity(activity); setIsNewActivityOpen(true); }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Activity
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleActivityStatus(activity.id)}>
                                    {activity.isActive ? '🔴' : '🟢'} 
                                    {activity.isActive ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={async () => {
                                    try {
                                      await poolService.deleteSwimmingActivity(activity.id);
                                      setSwimmingActivities(prev => prev.filter(a => a.id !== activity.id));
                                      toast.success('Activity deleted');
                                    } catch (err: any) {
                                      toast.error(err.message || 'Failed to delete');
                                    }
                                  }} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Activity
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Price:</span>
                            <span className="font-semibold">KES {activity.price.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Duration:</span>
                            <span>{activity.duration} minutes</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Participants:</span>
                            <span>{activity.currentParticipants}/{activity.capacity}</span>
                          </div>
                          
                          {activity.instructor && (
                            <div className="text-sm">
                              <span className="font-medium">Instructor:</span> {activity.instructor}
                            </div>
                          )}
                          
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {activity.skillLevel}
                            </Badge>
                            <Badge variant="outline" className="text-xs ml-1">
                              {activity.type.replace("-", " ")}
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Next Session:</span>
                            <br />
                            {new Date(activity.nextSession).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pool Reservations</CardTitle>
                    <CardDescription>
                      Manage pool and activity bookings
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedReservationStatus} onValueChange={(value) => setSelectedReservationStatus(value as ReservationStatus | "all")}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked-in">Checked In</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                    {canCreateReservations && (
                      <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Reservation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create Pool Reservation</DialogTitle>
                            <DialogDescription>
                              Book a pool session for a guest.
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const fd = new FormData(e.currentTarget as HTMLFormElement);
                              handleCreateReservation(fd);
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="guestEmail">Guest Email</Label>
                              <Input 
                                id="guestEmail" 
                                name="guestEmail" 
                                type="email" 
                                placeholder="Enter guest email" 
                                onChange={(e) => setGuestEmailQuery(e.target.value)}
                                list="swim-guest-emails" 
                                required 
                              />
                              <datalist id="swim-guest-emails">
                                {guestEmailOptions.map((g) => (
                                  <option key={g.id} value={g.email}>{g.name}</option>
                                ))}
                              </datalist>
                            </div>
                            
                            <div>
                              <Label htmlFor="poolId">Pool</Label>
                              <Select name="poolId" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pool" />
                                </SelectTrigger>
                                <SelectContent>
                                  {poolFacilities.map(pool => (
                                    <SelectItem key={pool.id} value={pool.id}>
                                      {pool.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="date">Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !selectedDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <input 
                                type="hidden" 
                                id="date"
                                name="date" 
                                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} 
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input id="startTime" name="startTime" type="time" required />
                              </div>
                              <div>
                                <Label htmlFor="endTime">End Time</Label>
                                <Input id="endTime" name="endTime" type="time" required />
                              </div>
                            </div>
                            
                            {/* Payment */}
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                                <Input id="mpesaPhone" name="mpesaPhone" placeholder="07XXXXXXXX" required />
                              </div>
                              <div>
                                <Label htmlFor="mpesaTxId">M-Pesa Transaction ID (optional)</Label>
                                <Input id="mpesaTxId" name="mpesaTxId" placeholder="ABC123XYZ" />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsNewReservationOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">
                                Create Reservation
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reservation ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Pool</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Status</TableHead>
                      {(canViewReservations || canDeleteReservations) && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-mono">{reservation.id}</TableCell>
                        <TableCell>{reservation.guestId}</TableCell>
                        <TableCell>
                          {poolFacilities.find(p => p.id === reservation.poolId)?.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reservation.reservationType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {reservation.date}
                            <br />
                            {reservation.timeSlot.start} - {reservation.timeSlot.end}
                          </div>
                        </TableCell>
                        <TableCell>{reservation.participants}</TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        {(canViewReservations || canDeleteReservations) && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canViewReservations && (
                                <Select 
                                  value={reservation.status} 
                                  onValueChange={(value) => handleUpdateReservationStatus(reservation.id, value as ReservationStatus)}
                                  disabled={!canViewReservations}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="checked-in">Checked In</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no-show">No Show</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {canDeleteReservations && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => { setDeletingReservation(reservation); setIsReservationDeleteOpen(true); }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pool Equipment</CardTitle>
                    <CardDescription>
                      {canManageEquipment ? "Manage swimming equipment and rentals" : "View available equipment for rental"}
                    </CardDescription>
                  </div>
                  {canManageEquipment && (
                    <Dialog open={isNewEquipmentOpen} onOpenChange={setIsNewEquipmentOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingEquipment(null)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Equipment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
                          <DialogDescription>
                            {editingEquipment ? "Update equipment details" : "Add new equipment to the inventory"}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const payload: any = {
                              name: fd.get('name') as string,
                              type: fd.get('type') as string,
                              totalQuantity: parseInt(fd.get('totalQuantity') as string),
                              availableQuantity: parseInt(fd.get('availableQuantity') as string),
                              dailyRate: parseInt(fd.get('dailyRate') as string),
                              condition: fd.get('condition') as string,
                              isAvailable: !!fd.get('isAvailable'),
                              lastMaintenance: fd.get('lastMaintenance') as string,
                              description: (fd.get('description') as string) || '',
                            };
                            try {
                              if (editingEquipment) {
                                const updated = await poolService.updateEquipment(editingEquipment.id, payload);
                                setPoolEquipment(prev => prev.map(eq => eq.id === editingEquipment.id ? updated : eq));
                                toast.success('Equipment updated successfully');
                              } else {
                                const created = await poolService.createEquipment(payload);
                                setPoolEquipment(prev => [created, ...prev]);
                                toast.success('Equipment added successfully');
                              }
                              setIsNewEquipmentOpen(false);
                              setEditingEquipment(null);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to save equipment');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="equipName">Equipment Name</Label>
                            <Input id="equipName" name="name" defaultValue={editingEquipment?.name} required />
                          </div>
                          <div>
                            <Label htmlFor="equipType">Type</Label>
                            <Select name="type" defaultValue={editingEquipment?.type}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="swimming-aids">Swimming Aids</SelectItem>
                                <SelectItem value="pool-toys">Pool Toys</SelectItem>
                                <SelectItem value="exercise-equipment">Exercise Equipment</SelectItem>
                                <SelectItem value="safety-equipment">Safety Equipment</SelectItem>
                                <SelectItem value="cleaning-equipment">Cleaning Equipment</SelectItem>
                                <SelectItem value="furniture">Pool Furniture</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="totalQuantity">Total Quantity</Label>
                              <Input id="totalQuantity" name="totalQuantity" type="number" defaultValue={editingEquipment?.totalQuantity} required />
                            </div>
                            <div>
                              <Label htmlFor="availableQuantity">Available Quantity</Label>
                              <Input id="availableQuantity" name="availableQuantity" type="number" defaultValue={editingEquipment?.availableQuantity} required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dailyRate">Daily Rate (KES)</Label>
                              <Input id="dailyRate" name="dailyRate" type="number" defaultValue={editingEquipment?.dailyRate} required />
                            </div>
                            <div>
                              <Label htmlFor="condition">Condition</Label>
                              <Select name="condition" defaultValue={editingEquipment?.condition}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="excellent">Excellent</SelectItem>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="fair">Fair</SelectItem>
                                  <SelectItem value="poor">Poor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                            <Input id="lastMaintenance" name="lastMaintenance" type="date" defaultValue={editingEquipment?.lastMaintenance} required />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingEquipment?.description} />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="equipAvailable" 
                              name="isAvailable" 
                              value="true"
                              defaultChecked={editingEquipment?.isAvailable !== false}
                            />
                            <Label htmlFor="equipAvailable">Available for Rent</Label>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => { setIsNewEquipmentOpen(false); setEditingEquipment(null); }}>Cancel</Button>
                            <Button type="submit">{editingEquipment ? "Update Equipment" : "Add Equipment"}</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {poolEquipment.map((equipment) => (
                    <Card key={equipment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{equipment.name}</CardTitle>
                            <CardDescription>
                              {equipment.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </CardDescription>
                          </div>
                          {canManageEquipment && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setViewingEquipment(equipment); setIsEquipmentViewOpen(true); }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingEquipment(equipment); setIsNewEquipmentOpen(true); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Equipment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setDeletingEquipment(equipment); setIsEquipmentDeleteOpen(true); }} className="text-red-600 focus:text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Equipment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Available:</span>
                            <span>{equipment.availableQuantity}/{equipment.totalQuantity}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Daily Rate:</span>
                            <span className="font-semibold">KES {equipment.dailyRate}</span>
                          </div>
                          
                          <div className="text-sm">
                            <Badge 
                              variant={equipment.condition === "excellent" ? "default" : 
                                     equipment.condition === "good" ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {equipment.condition}
                            </Badge>
                            <Badge 
                              variant={equipment.isAvailable ? "default" : "secondary"}
                              className="text-xs ml-1"
                            >
                              {equipment.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Last maintenance: {equipment.lastMaintenance}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          {canManageActivities && (
            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
                    <Waves className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {poolFacilities.filter(pool => pool.status === "open").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of {poolFacilities.length} pools
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{poolReservations.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {poolReservations.filter(r => r.status === "confirmed").length} confirmed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      KES {poolReservations.reduce((sum, reservation) => sum + reservation.totalAmount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From pool activities
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Activities</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {swimmingActivities.filter(activity => activity.isActive).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available now
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Pool View Dialog */}
        <Dialog open={isPoolViewOpen} onOpenChange={setIsPoolViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Pool Details
              </DialogTitle>
            </DialogHeader>
            {viewingPool && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{viewingPool.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="capitalize">{viewingPool.type.replace("-", " ")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    {getPoolStatusBadge(viewingPool.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Capacity</Label>
                    <p className="text-sm">{viewingPool.currentOccupancy}/{viewingPool.capacity}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Temperature</Label>
                    <p className="text-sm">{viewingPool.temperature}°C</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Depth</Label>
                  <p className="text-sm">{viewingPool.depth.min}m - {viewingPool.depth.max}m</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Operating Hours</Label>
                  <p className="text-sm">{viewingPool.operatingHours.open} - {viewingPool.operatingHours.close}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Amenities</Label>
                  <div className="flex flex-wrap gap-1">
                    {viewingPool.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Pool Delete Dialog */}
        <AlertDialog open={isPoolDeleteOpen} onOpenChange={setIsPoolDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pool</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingPool?.name}"? This will also remove all associated reservations and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePool} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Pool
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Equipment View Dialog */}
        <Dialog open={isEquipmentViewOpen} onOpenChange={setIsEquipmentViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Equipment Details
              </DialogTitle>
            </DialogHeader>
            {viewingEquipment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{viewingEquipment.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="capitalize">{viewingEquipment.type.replace("-", " ")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Condition</Label>
                    <Badge variant={viewingEquipment.condition === "excellent" ? "default" : viewingEquipment.condition === "good" ? "secondary" : "destructive"}>
                      {viewingEquipment.condition}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Available</Label>
                    <p className="text-sm">{viewingEquipment.availableQuantity}/{viewingEquipment.totalQuantity}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Daily Rate</Label>
                    <p className="text-lg font-bold text-primary">KES {viewingEquipment.dailyRate}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={viewingEquipment.isAvailable ? "default" : "secondary"}>
                    {viewingEquipment.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Last Maintenance</Label>
                  <p className="text-sm">{viewingEquipment.lastMaintenance}</p>
                </div>
                {viewingEquipment.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{viewingEquipment.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Equipment Delete Dialog */}
        <AlertDialog open={isEquipmentDeleteOpen} onOpenChange={setIsEquipmentDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingEquipment?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEquipment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Equipment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Reservation Delete Dialog */}
        <AlertDialog open={isReservationDeleteOpen} onOpenChange={setIsReservationDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete reservation "{deletingReservation?.id}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReservation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Reservation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Activity View Dialog */}
        <Dialog open={isActivityViewOpen} onOpenChange={setIsActivityViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Activity Details
              </DialogTitle>
            </DialogHeader>
            {viewingActivity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{viewingActivity.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{viewingActivity.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="capitalize">{viewingActivity.type.replace("-", " ")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={viewingActivity.isActive ? "default" : "secondary"}>
                      {viewingActivity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    <p className="text-lg font-bold text-primary">KES {viewingActivity.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm">{viewingActivity.duration} minutes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Capacity</Label>
                    <p className="text-sm">{viewingActivity.currentParticipants}/{viewingActivity.capacity}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Skill Level</Label>
                    <Badge variant="outline" className="capitalize">{viewingActivity.skillLevel.replace("-", " ")}</Badge>
                  </div>
                </div>
                
                {viewingActivity.instructor && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Instructor</Label>
                    <p className="text-sm">{viewingActivity.instructor}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Next Session</Label>
                  <p className="text-sm">{new Date(viewingActivity.nextSession).toLocaleString()}</p>
                </div>
                
                {viewingActivity.schedule && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Schedule</Label>
                    <p className="text-sm">{viewingActivity.schedule.days.join(", ")} • {viewingActivity.schedule.startTime} - {viewingActivity.schedule.endTime}</p>
                  </div>
                )}
                
                {viewingActivity.requirements && viewingActivity.requirements.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
                    <div className="flex flex-wrap gap-1">
                      {viewingActivity.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{req}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingActivity.equipment && viewingActivity.equipment.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Required Equipment</Label>
                    <div className="flex flex-wrap gap-1">
                      {viewingActivity.equipment.map((equip, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{equip}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Activity Delete Dialog */}
        <AlertDialog open={isActivityDeleteOpen} onOpenChange={setIsActivityDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Activity</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingActivity?.name}"? This will also cancel all related reservations and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteActivity} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Activity
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default SwimmingActivities;
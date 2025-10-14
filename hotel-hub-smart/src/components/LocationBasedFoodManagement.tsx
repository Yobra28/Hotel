import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  MapPin, 
  Clock, 
  Users, 
  Truck, 
  ChefHat, 
  Phone, 
  DollarSign,
  Navigation,
  AlertCircle,
  CheckCircle,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  mockFoodOrders, 
  mockHotelLocations, 
  mockDeliveryStaff,
  FoodOrder,
  HotelLocation,
  DeliveryStaff,
  OrderStatus,
  LocationType,
  DeliveryZone 
} from "@/data/mockData";

const LocationBasedFoodManagement = () => {
  const { user } = useAuth();
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(mockFoodOrders);
  const [hotelLocations] = useState<HotelLocation[]>(mockHotelLocations);
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>(mockDeliveryStaff);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | "all">("all");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | "all">("all");
  const [isAssignDeliveryOpen, setIsAssignDeliveryOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);

  // Role-based permissions
  const canManageOrders = user?.role === "admin" || user?.role === "receptionist";
  const canAssignDelivery = user?.role === "admin" || user?.role === "receptionist";
  const canViewAllOrders = user?.role === "admin" || user?.role === "receptionist";
  const isHousekeeper = user?.role === "housekeeping";

  // Filter orders based on role
  const getFilteredOrders = () => {
    let filtered = foodOrders;

    // Role-based filtering
    if (isHousekeeper) {
      // Housekeepers only see room service orders
      filtered = filtered.filter(order => order.orderType === "room-service");
    }

    // Zone filtering
    if (selectedZone !== "all") {
      filtered = filtered.filter(order => order.deliveryLocation.zone === selectedZone);
    }

    // Status filtering
    if (selectedOrderStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedOrderStatus);
    }

    return filtered;
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      preparing: { color: "bg-orange-100 text-orange-800", icon: ChefHat },
      ready: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      delivered: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: AlertCircle }
    };
    
    const statusInfo = statusMap[status];
    const Icon = statusInfo.icon;
    
    return (
      <Badge className={statusInfo.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLocationIcon = (type: LocationType) => {
    const iconMap = {
      room: "🏨",
      restaurant: "🍽️", 
      pool: "🏊",
      spa: "🧘",
      lobby: "🏛️",
      conference: "📋",
      garden: "🌿",
      rooftop: "🌃"
    };
    return iconMap[type] || "📍";
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    if (!canManageOrders) {
      toast.error("You don't have permission to update orders");
      return;
    }

    setFoodOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleAssignDelivery = (staffId: string) => {
    if (!selectedOrder || !canAssignDelivery) {
      toast.error("Cannot assign delivery staff");
      return;
    }

    const staff = deliveryStaff.find(s => s.id === staffId);
    if (!staff) return;

    // Update order
    setFoodOrders(prev => prev.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, assignedDeliveryStaff: staff.name, updatedAt: new Date().toISOString() }
        : order
    ));

    // Update staff
    setDeliveryStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, activeOrders: [...s.activeOrders, selectedOrder.id], isAvailable: s.activeOrders.length + 1 < s.maxCapacity }
        : s
    ));

    toast.success(`Delivery assigned to ${staff.name}`);
    setIsAssignDeliveryOpen(false);
    setSelectedOrder(null);
  };

  const getDeliveryStats = () => {
    const totalOrders = foodOrders.length;
    const pendingDeliveries = foodOrders.filter(order => 
      ["confirmed", "preparing", "ready"].includes(order.status)
    ).length;
    const activeStaff = deliveryStaff.filter(staff => !staff.isAvailable).length;
    const totalRevenue = foodOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return { totalOrders, pendingDeliveries, activeStaff, totalRevenue };
  };

  const stats = getDeliveryStats();
  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Location-Based Food Management</h3>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin" && "Manage orders and deliveries across all hotel locations"}
            {user?.role === "receptionist" && "Support guest orders and coordinate deliveries"}
            {user?.role === "housekeeping" && "View room service orders for your assigned areas"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {canViewAllOrders && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
              <p className="text-xs text-muted-foreground">On deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Including delivery fees</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders & Deliveries</TabsTrigger>
          {canViewAllOrders && <TabsTrigger value="locations">Hotel Locations</TabsTrigger>}
          {canViewAllOrders && <TabsTrigger value="staff">Delivery Staff</TabsTrigger>}
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Food Orders by Location</CardTitle>
                  <CardDescription>
                    Track orders across different hotel areas and manage deliveries
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedZone} onValueChange={(value) => setSelectedZone(value as DeliveryZone | "all")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      <SelectItem value="building-a">Building A</SelectItem>
                      <SelectItem value="pool-area">Pool Area</SelectItem>
                      <SelectItem value="spa-area">Spa Area</SelectItem>
                      <SelectItem value="conference-center">Conference</SelectItem>
                      <SelectItem value="outdoor-areas">Outdoor Areas</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedOrderStatus} onValueChange={(value) => setSelectedOrderStatus(value as OrderStatus | "all")}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Staff</TableHead>
                    {canManageOrders && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getLocationIcon(order.deliveryLocation.type)}</span>
                          <div>
                            <p className="font-medium">{order.deliveryLocation.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.deliveryLocation.zone} • {order.deliveryLocation.deliveryTime} min
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.orderType}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">KES {order.totalAmount.toLocaleString()}</p>
                          {order.deliveryLocation.deliveryFee > 0 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.deliveryLocation.deliveryFee} delivery
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(order.orderTime).toLocaleString()}</p>
                          {order.requestedDeliveryTime && (
                            <p className="text-muted-foreground">
                              → {new Date(order.requestedDeliveryTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>👨‍🍳 {order.assignedKitchenStaff || "Unassigned"}</p>
                          {order.assignedDeliveryStaff && (
                            <p className="text-muted-foreground">🚚 {order.assignedDeliveryStaff}</p>
                          )}
                        </div>
                      </TableCell>
                      {canManageOrders && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {!order.assignedDeliveryStaff && canAssignDelivery && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsAssignDeliveryOpen(true);
                                }}
                              >
                                <Truck className="h-3 w-3" />
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

        {/* Hotel Locations Tab */}
        {canViewAllOrders && (
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Delivery Locations</CardTitle>
                <CardDescription>Manage delivery zones and location settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {hotelLocations.map((location) => (
                    <Card key={location.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getLocationIcon(location.type)}</span>
                            <div>
                              <CardTitle className="text-base">{location.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {location.zone} • Floor {location.floor || "Ground"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={location.isActive ? "default" : "secondary"}>
                            {location.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              Delivery Time:
                            </span>
                            <span>{location.deliveryTime} min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Delivery Fee:
                            </span>
                            <span>KES {location.deliveryFee}</span>
                          </div>
                          {location.operatingHours && (
                            <div className="flex items-center justify-between">
                              <span>Hours:</span>
                              <span>{location.operatingHours.open} - {location.operatingHours.close}</span>
                            </div>
                          )}
                          {location.specialInstructions && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              ℹ️ {location.specialInstructions}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Delivery Staff Tab */}
        {canViewAllOrders && (
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Staff Management</CardTitle>
                <CardDescription>Monitor delivery staff availability and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {deliveryStaff.map((staff) => (
                    <Card key={staff.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-muted rounded-full">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{staff.name}</CardTitle>
                              <CardDescription className="text-sm">
                                <Phone className="inline h-3 w-3 mr-1" />
                                {staff.phone}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={staff.isAvailable ? "default" : "secondary"}>
                            {staff.isAvailable ? "Available" : "Busy"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Assigned Zones:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {staff.assignedZones.map((zone, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {zone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Active Orders:</span>
                            <span>{staff.activeOrders.length}/{staff.maxCapacity}</span>
                          </div>
                          {staff.currentLocation && (
                            <div className="flex items-center space-x-1">
                              <Navigation className="h-3 w-3" />
                              <span className="text-muted-foreground">{staff.currentLocation}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Assign Delivery Dialog */}
      <Dialog open={isAssignDeliveryOpen} onOpenChange={setIsAssignDeliveryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Staff</DialogTitle>
            <DialogDescription>
              Select delivery staff for order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <div className="bg-muted p-3 rounded">
                <p className="font-medium">Order Details:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.deliveryLocation.name} • {selectedOrder.deliveryLocation.zone}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {deliveryStaff
                .filter(staff => 
                  staff.isAvailable && 
                  selectedOrder && 
                  staff.assignedZones.includes(selectedOrder.deliveryLocation.zone)
                )
                .map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.activeOrders.length}/{staff.maxCapacity} orders
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleAssignDelivery(staff.id)}>
                      Assign
                    </Button>
                  </div>
                ))
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationBasedFoodManagement;
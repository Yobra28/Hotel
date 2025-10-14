import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Search, Plus, Clock, Users, DollarSign, ChefHat, Filter, Trash2, Eye, Edit, MoreHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import LocationBasedFoodManagement from "@/components/LocationBasedFoodManagement";
import { 
  mockMenuItems, 
  mockFoodOrders, 
  MenuItem, 
  FoodOrder, 
  MenuCategory,
  OrderStatus,
  DietaryRestriction 
} from "@/data/mockData";
import { mockGuests, mockHotelLocations, Guest } from "@/data/mockData";

const FoodOrdering = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(mockFoodOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | "all">("all");
  const [isNewMenuItemOpen, setIsNewMenuItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Create Order (Receptionist) state
  type CreateCartItem = { id: string; name: string; price: number; quantity: number; specialInstructions?: string };
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [createOrderCart, setCreateOrderCart] = useState<CreateCartItem[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [createOrderType, setCreateOrderType] = useState<"dine-in" | "room-service" | "takeaway" | "poolside" | "spa">("room-service");
  const [selectedLocationId, setSelectedLocationId] = useState<string>(mockHotelLocations[0]?.id || "");
  const [menuSearchForCreate, setMenuSearchForCreate] = useState("");

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = foodOrders.filter(order => {
    return selectedOrderStatus === "all" || order.status === selectedOrderStatus;
  });

  // Helpers for Create Order
  const availableMenuForCreate = menuItems.filter(m => m.isAvailable && (
    m.name.toLowerCase().includes(menuSearchForCreate.toLowerCase()) ||
    m.description.toLowerCase().includes(menuSearchForCreate.toLowerCase())
  ));

  const getDefaultLocationIdForType = (orderType: typeof createOrderType) => {
    switch (orderType) {
      case "room-service":
        return mockHotelLocations.find(l => l.type === "room")?.id || mockHotelLocations[0]?.id || "";
      case "poolside":
        return mockHotelLocations.find(l => l.type === "pool")?.id || mockHotelLocations[0]?.id || "";
      case "spa":
        return mockHotelLocations.find(l => l.type === "spa")?.id || mockHotelLocations[0]?.id || "";
      case "dine-in":
      case "takeaway":
      default:
        return mockHotelLocations.find(l => l.type === "restaurant")?.id || mockHotelLocations[0]?.id || "";
    }
  };

  const addItemToCreateCart = (item: MenuItem) => {
    setCreateOrderCart(prev => {
      const found = prev.find(ci => ci.id === item.id);
      if (found) return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to order`);
  };

  const updateCreateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCreateOrderCart(prev => prev.filter(ci => ci.id !== id));
    } else {
      setCreateOrderCart(prev => prev.map(ci => ci.id === id ? { ...ci, quantity: qty } : ci));
    }
  };

  const updateCreateCartInstructions = (id: string, text: string) => {
    setCreateOrderCart(prev => prev.map(ci => ci.id === id ? { ...ci, specialInstructions: text } : ci));
  };

  const getCreateOrderSubtotal = () => createOrderCart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  const getSelectedLocation = () => mockHotelLocations.find(l => l.id === selectedLocationId);

  const handleCreateOrder = () => {
    if (!selectedGuestId) {
      toast.error("Please select a guest");
      return;
    }
    if (createOrderCart.length === 0) {
      toast.error("Please add at least one menu item");
      return;
    }
    const location = getSelectedLocation();
    if (!location) {
      toast.error("Please select a delivery location");
      return;
    }

    const items = createOrderCart.map(ci => ({
      menuItemId: ci.id,
      quantity: ci.quantity,
      specialInstructions: ci.specialInstructions,
      price: ci.price,
    }));
    const deliveryFee = location.deliveryFee || 0;
    const totalAmount = getCreateOrderSubtotal() + deliveryFee;

    const newOrder: FoodOrder = {
      id: Date.now().toString(),
      guestId: selectedGuestId,
      deliveryLocation: location,
      items,
      totalAmount,
      orderType: createOrderType,
      status: "pending",
      orderTime: new Date().toISOString(),
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    setFoodOrders(prev => [newOrder, ...prev]);
    toast.success("Order created successfully");
    // reset
    setIsCreateOrderOpen(false);
    setCreateOrderCart([]);
    setSelectedGuestId("");
    setCreateOrderType("room-service");
    setSelectedLocationId(getDefaultLocationIdForType("room-service"));
    setMenuSearchForCreate("");
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      preparing: { color: "bg-orange-100 text-orange-800", label: "Preparing" },
      ready: { color: "bg-green-100 text-green-800", label: "Ready" },
      delivered: { color: "bg-gray-100 text-gray-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" }
    };
    
    const status_info = statusMap[status];
    return (
      <Badge className={status_info.color}>
        {status_info.label}
      </Badge>
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setFoodOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleSaveMenuItem = (formData: FormData) => {
    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      category: formData.get("category") as MenuCategory,
      isAvailable: formData.get("isAvailable") === "true",
      preparationTime: parseInt(formData.get("preparationTime") as string),
      ingredients: (formData.get("ingredients") as string).split(",").map(i => i.trim()),
      dietaryRestrictions: [],
      allergens: (formData.get("allergens") as string).split(",").map(a => a.trim()).filter(Boolean)
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      toast.success("Menu item updated successfully");
    } else {
      setMenuItems(prev => [...prev, newItem]);
      toast.success("Menu item added successfully");
    }
    
    setIsNewMenuItemOpen(false);
    setEditingItem(null);
  };

  const handleDeleteMenuItem = () => {
    if (!deletingItem) return;
    
    setMenuItems(prev => prev.filter(item => item.id !== deletingItem.id));
    toast.success("Menu item deleted successfully");
    setIsDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isAvailable: !item.isAvailable }
        : item
    ));
    const item = menuItems.find(i => i.id === itemId);
    toast.success(`${item?.name} ${item?.isAvailable ? 'marked as unavailable' : 'marked as available'}`);
  };

  const openViewDialog = (item: MenuItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setIsNewMenuItemOpen(true);
  };

  const openDeleteDialog = (item: MenuItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const MenuItemForm = () => (
    <form action={handleSaveMenuItem} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={editingItem?.name}
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={editingItem?.description}
          required 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (KES)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            defaultValue={editingItem?.price}
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
          <Input 
            id="preparationTime" 
            name="preparationTime" 
            type="number" 
            defaultValue={editingItem?.preparationTime}
            required 
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={editingItem?.category}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appetizers">Appetizers</SelectItem>
            <SelectItem value="mains">Main Courses</SelectItem>
            <SelectItem value="desserts">Desserts</SelectItem>
            <SelectItem value="beverages">Beverages</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
        <Input 
          id="ingredients" 
          name="ingredients" 
          defaultValue={editingItem?.ingredients.join(", ")}
        />
      </div>
      
      <div>
        <Label htmlFor="allergens">Allergens (comma separated)</Label>
        <Input 
          id="allergens" 
          name="allergens" 
          defaultValue={editingItem?.allergens?.join(", ")}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="isAvailable" 
          name="isAvailable" 
          value="true"
          defaultChecked={editingItem?.isAvailable !== false}
        />
        <Label htmlFor="isAvailable">Available</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsNewMenuItemOpen(false);
            setEditingItem(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingItem ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </form>
  );

  const canManageMenu = user?.role === "admin";
  const canManageOrders = user?.role === "admin" || user?.role === "receptionist";
  const canEditOrders = user?.role === "admin";
  const canViewDelivery = user?.role === "admin";

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Food Ordering</h2>
        </div>
        
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            {canManageMenu && <TabsTrigger value="menu">Menu Management</TabsTrigger>}
            <TabsTrigger value="orders">Orders</TabsTrigger>
            {canViewDelivery && <TabsTrigger value="delivery">Delivery Management</TabsTrigger>}
            {canManageMenu && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>
          
          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>
                      {canManageMenu 
                        ? "Manage your restaurant menu items - add, edit, view, delete, and control availability" 
                        : "View available menu items and place orders"
                      }
                    </CardDescription>
                  </div>
                  {canManageMenu && (
                    <Dialog open={isNewMenuItemOpen} onOpenChange={setIsNewMenuItemOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingItem(null)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Menu Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                          </DialogTitle>
                          <DialogDescription>
                            Fill in the details for the menu item.
                          </DialogDescription>
                        </DialogHeader>
                        <MenuItemForm />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MenuCategory | "all")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="mains">Main Courses</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Menu Items Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMenuItems.map((item) => (
                    <Card key={item.id} className={!item.isAvailable ? "opacity-60" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          {canManageMenu && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewDialog(item)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleToggleAvailability(item.id)}
                                >
                                  {item.isAvailable ? '🔴' : '🟢'} 
                                  {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(item)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">KES {item.price.toLocaleString()}</span>
                            <Badge variant={item.isAvailable ? "default" : "secondary"}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {item.preparationTime} min
                          </div>
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="text-xs text-red-600">
                              ⚠️ Contains: {item.allergens.join(", ")}
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
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Food Orders</CardTitle>
                    <CardDescription>
                      Manage incoming orders and track their status
                    </CardDescription>
                  </div>
                  {canEditOrders && (
                    <Select value={selectedOrderStatus} onValueChange={(value) => setSelectedOrderStatus(value as OrderStatus | "all") }>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {canManageOrders && (
                    <Dialog open={isCreateOrderOpen} onOpenChange={(open) => {
                      setIsCreateOrderOpen(open);
                      if (open) setSelectedLocationId(getDefaultLocationIdForType(createOrderType));
                    }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Create Food Order</DialogTitle>
                          <DialogDescription>Select guest, items, and delivery details</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <Label>Guest</Label>
                                <Select value={selectedGuestId} onValueChange={(v) => setSelectedGuestId(v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select guest" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-64">
                                    {mockGuests.map((g) => (
                                      <SelectItem key={g.id} value={g.id}>{g.name} {g.roomId ? `(Room ${g.roomId})` : ""}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Order Type</Label>
                                  <Select value={createOrderType} onValueChange={(v) => {
                                    const t = v as typeof createOrderType;
                                    setCreateOrderType(t);
                                    setSelectedLocationId(getDefaultLocationIdForType(t));
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="room-service">Room Service</SelectItem>
                                      <SelectItem value="dine-in">Dine-in</SelectItem>
                                      <SelectItem value="takeaway">Takeaway</SelectItem>
                                      <SelectItem value="poolside">Poolside</SelectItem>
                                      <SelectItem value="spa">Spa</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Delivery Location</Label>
                                  <Select value={selectedLocationId} onValueChange={(v) => setSelectedLocationId(v)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                      {mockHotelLocations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>{loc.name} • {loc.zone}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Search Menu</Label>
                              <div className="mt-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  className="pl-9"
                                  placeholder="Search menu items..."
                                  value={menuSearchForCreate}
                                  onChange={(e) => setMenuSearchForCreate(e.target.value)}
                                />
                              </div>
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                                {availableMenuForCreate.map(mi => (
                                  <Card key={mi.id}>
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">{mi.name}</p>
                                          <p className="text-xs text-muted-foreground">KES {mi.price.toLocaleString()} • {mi.preparationTime} min</p>
                                        </div>
                                        <Button size="sm" onClick={() => addItemToCreateCart(mi)} disabled={!mi.isAvailable}>Add</Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Cart ({createOrderCart.reduce((s,c)=>s+c.quantity,0)})</h4>
                              <Button variant="outline" size="sm" onClick={() => setCreateOrderCart([])} disabled={createOrderCart.length===0}>Clear</Button>
                            </div>
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                              {createOrderCart.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No items yet. Add from the menu.</p>
                              ) : (
                                createOrderCart.map(ci => (
                                  <Card key={ci.id}>
                                    <CardContent className="p-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{ci.name}</p>
                                          <p className="text-xs text-muted-foreground">KES {ci.price.toLocaleString()} each</p>
                                          <Textarea
                                            className="mt-2"
                                            rows={2}
                                            placeholder="Special instructions..."
                                            value={ci.specialInstructions || ""}
                                            onChange={(e) => updateCreateCartInstructions(ci.id, e.target.value)}
                                          />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => updateCreateCartQty(ci.id, ci.quantity - 1)}>-</Button>
                                            <span className="w-8 text-center text-sm">{ci.quantity}</span>
                                            <Button size="sm" variant="outline" onClick={() => updateCreateCartQty(ci.id, ci.quantity + 1)}>+</Button>
                                          </div>
                                          <p className="text-sm font-semibold">KES {(ci.price * ci.quantity).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              )}
                            </div>
                            <div className="border-t pt-3 space-y-1 text-sm">
                              <div className="flex justify-between"><span>Subtotal</span><span>KES {getCreateOrderSubtotal().toLocaleString()}</span></div>
                              {getSelectedLocation() && (
                                <div className="flex justify-between"><span>Delivery Fee</span><span>KES {getSelectedLocation()!.deliveryFee.toLocaleString()}</span></div>
                              )}
                              <div className="flex justify-between font-semibold"><span>Total</span><span>KES {(getCreateOrderSubtotal() + (getSelectedLocation()?.deliveryFee || 0)).toLocaleString()}</span></div>
                              <Button className="w-full mt-2" onClick={handleCreateOrder} disabled={!selectedGuestId || createOrderCart.length===0}>Create Order</Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      {canEditOrders && <TableHead>Status</TableHead>}
                      <TableHead>Order Time</TableHead>
                      {canEditOrders && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>{mockGuests.find(g => g.id === order.guestId)?.name || order.guestId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.orderType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.map(item => `${item.quantity}x ${menuItems.find(m => m.id === item.menuItemId)?.name || 'Unknown'}`).join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>KES {order.totalAmount.toLocaleString()}</TableCell>
                        {canEditOrders && (
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        )}
                        <TableCell>{new Date(order.orderTime).toLocaleString()}</TableCell>
                        {canEditOrders && (
                          <TableCell>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Delivery Management Tab */}
          {canViewDelivery && (
            <TabsContent value="delivery">
              <LocationBasedFoodManagement />
            </TabsContent>
          )}
          
          {/* Analytics Tab */}
          {canManageMenu && (
            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{menuItems.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {menuItems.filter(item => item.isAvailable).length} available
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {foodOrders.filter(order => ["pending", "confirmed", "preparing"].includes(order.status)).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Need attention
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      KES {foodOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {foodOrders.length} orders
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      KES {foodOrders.length > 0 ? Math.round(foodOrders.reduce((sum, order) => sum + order.totalAmount, 0) / foodOrders.length).toLocaleString() : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per order value
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* View Menu Item Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Menu Item Details
              </DialogTitle>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{viewingItem.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{viewingItem.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    <p className="text-lg font-bold text-primary">KES {viewingItem.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Prep Time</Label>
                    <p className="text-sm font-semibold">{viewingItem.preparationTime} minutes</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <Badge variant="outline" className="capitalize">{viewingItem.category}</Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={viewingItem.isAvailable ? "default" : "secondary"}>
                    {viewingItem.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                
                {viewingItem.ingredients && viewingItem.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ingredients</Label>
                    <p className="text-sm">{viewingItem.ingredients.join(", ")}</p>
                  </div>
                )}
                
                {viewingItem.allergens && viewingItem.allergens.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Allergens</Label>
                    <div className="flex flex-wrap gap-1">
                      {viewingItem.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          ⚠️ {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Menu Item Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone and will remove the item from your menu permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteMenuItem} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default FoodOrdering;
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Minus, ShoppingCart, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import menuService from "@/services/menuService";

type MenuCategory = 'appetizers' | 'mains' | 'desserts' | 'beverages';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  preparationTime: number;
  isAvailable: boolean;
  allergens: string[];
  dietaryRestrictions: string[];
}

interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

const GuestFoodOrdering = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderType, setOrderType] = useState<"room-service" | "takeaway">("room-service");
  const [loading, setLoading] = useState(true);

  // Load menu items on component mount
  useEffect(() => {
    loadMenuItems();
  }, []);

  // Load menu items from API
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await menuService.getTransformedMenuItems();
      setMenuItems(items.filter(item => item.isAvailable));
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    return selectedCategory === "all" || item.category === selectedCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const updateSpecialInstructions = (id: string, instructions: string) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, specialInstructions: instructions } : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        orderType: orderType as 'room-service' | 'takeaway',
        deliveryLocation: orderType === 'room-service' ? 'Room' : undefined,
        specialInstructions: 'Guest order from mobile app'
      };

      await menuService.createOrder(orderData);
      toast.success("Order placed successfully! You'll receive a confirmation shortly.");
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Food Ordering</h3>
          <p className="text-sm text-muted-foreground">Order delicious meals to your room</p>
        </div>
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogTrigger asChild>
            <Button className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({getTotalItems()})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Your Order</DialogTitle>
              <DialogDescription>
                Review your items and place your order
              </DialogDescription>
            </DialogHeader>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty. Add some items to get started!
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select value={orderType} onValueChange={(value) => setOrderType(value as "room-service" | "takeaway")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room-service">Room Service</SelectItem>
                      <SelectItem value="takeaway">Takeaway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-sm font-semibold mt-1">
                              KES {item.price.toLocaleString()} each
                            </p>
                            
                            <div className="mt-2">
                              <Label htmlFor={`instructions-${item.id}`} className="text-xs">
                                Special Instructions
                              </Label>
                              <Textarea
                                id={`instructions-${item.id}`}
                                placeholder="Any special requests..."
                                value={item.specialInstructions || ""}
                                onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-semibold">
                              KES {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>KES {getTotalAmount().toLocaleString()}</span>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All Items
        </Button>
        {["appetizers", "mains", "desserts", "beverages"].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category as MenuCategory)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMenuItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMenuItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs ml-2">
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    KES {item.price.toLocaleString()}
                  </span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {item.preparationTime} min
                  </div>
                </div>
                
                {item.allergens && item.allergens.length > 0 && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Contains: {item.allergens.join(", ")}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {item.dietaryRestrictions.map((restriction, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {restriction}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">No menu items available at the moment</p>
          <Button onClick={loadMenuItems} variant="outline">
            Refresh Menu
          </Button>
        </div>
      )}
    </div>
  );
};

export default GuestFoodOrdering;
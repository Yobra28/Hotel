import api from './api';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizers' | 'mains' | 'desserts' | 'beverages';
  preparationTime: number;
  isAvailable: boolean;
  allergens: string[];
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodOrder {
  _id: string;
  guest: string;
  room?: string;
  items: Array<{
    menuItem: string;
    quantity: number;
    specialInstructions?: string;
    unitPrice: number;
  }>;
  orderType: 'room-service' | 'takeaway' | 'dine-in' | 'poolside' | 'spa' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryLocation?: string;
  specialInstructions?: string;
  orderDate: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
}

export interface CreateOrderData {
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  orderType: 'room-service' | 'takeaway' | 'dine-in';
  deliveryLocation?: string;
  specialInstructions?: string;
}

class MenuService {
  // Transform backend order to UI-friendly shape
  transformOrder(o: FoodOrder): any {
    return {
      id: (o as any)._id,
      guestId: (o as any).guest,
      roomId: (o as any).room,
      items: (o.items || []).map((it: any) => ({
        menuItemId: it.menuItem || it.menuItemId,
        quantity: it.quantity,
        specialInstructions: it.specialInstructions,
        unitPrice: it.unitPrice,
      })),
      orderType: o.orderType,
      status: o.status,
      totalAmount: o.totalAmount,
      deliveryLocation: o.deliveryLocation,
      specialInstructions: o.specialInstructions,
      orderTime: (o as any).orderDate || (o as any).createdAt,
      createdAt: (o as any).createdAt,
      updatedAt: (o as any).updatedAt,
    };
  }
  // Get all menu items
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await api.get('/menu/items');
      return response.data.data.menuItems || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  // Get menu items by category
  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const response = await api.get(`/menu/items?category=${category}`);
      return response.data.data.menuItems || [];
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      return [];
    }
  }

  // Create food order (tries guest endpoint first)
  async createOrder(orderData: CreateOrderData & { guestId?: string; roomId?: string }): Promise<FoodOrder> {
    const endpoints = ['/orders/food/guest', '/orders/food'];
    let lastErr: any = null;
    for (const ep of endpoints) {
      try {
        const response = await api.post(ep, orderData);
        return response.data.data.order;
      } catch (e: any) {
        lastErr = e;
        if ([401,403].includes(e?.response?.status)) continue;
        break;
      }
    }
    throw new Error(lastErr?.response?.data?.error?.message || lastErr?.message || 'Failed to create order');
  }

  // Get user's food orders
  async getMyOrders(): Promise<any[]> {
    try {
      const response = await api.get('/orders/food/my-orders');
      const orders = response.data.data.orders || [];
      return orders.map((o: any) => this.transformOrder(o));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // Update delivery location (tries guest path first)
  async updateOrderLocation(id: string, deliveryLocation: string): Promise<FoodOrder> {
    const endpoints = [`/orders/food/${id}/location/guest`, `/orders/food/${id}/location`];
    let lastErr: any = null;
    for (const ep of endpoints) {
      try {
        const response = await api.patch(ep, { deliveryLocation });
        return response.data.data.order;
      } catch (e: any) {
        lastErr = e;
        if ([401,403].includes(e?.response?.status)) continue;
        break;
      }
    }
    throw new Error(lastErr?.response?.data?.error?.message || lastErr?.message || 'Failed to update order location');
  }

  // Get order by ID
  async getOrderById(id: string): Promise<any | null> {
    try {
      const response = await api.get(`/orders/food/${id}`);
      return this.transformOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }
  }

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<FoodOrder> {
    try {
      const response = await api.patch(`/orders/food/${id}/status`, { status });
      return response.data.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update order status');
    }
  }

  // Admin/staff: get all food orders
  async getAllOrders(params?: any): Promise<any[]> {
    try {
      const response = await api.get('/orders/food', { params });
      const orders = response.data.data.orders || [];
      return orders.map((o: any) => this.transformOrder(o));
    } catch (error) {
      console.error('Error fetching food orders:', error);
      return [];
    }
  }

  // Admin/staff: update order status
  async updateOrderStatus(id: string, status: string): Promise<FoodOrder> {
    try {
      const response = await api.patch(`/orders/food/${id}/status`, { status });
      return response.data.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update order status');
    }
  }

  // Admin/staff: delete order
  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/food/${id}`);
  }

  // Menu item management (admin/receptionist)
  async createMenuItem(payload: Partial<MenuItem>): Promise<any> {
    const response = await api.post('/menu/items', payload);
    const item = response.data.data.item;
    return this.transformMenuItem(item);
  }
  async updateMenuItem(id: string, payload: Partial<MenuItem>): Promise<any> {
    const response = await api.put(`/menu/items/${id}`, payload);
    return this.transformMenuItem(response.data.data.item);
  }
  async deleteMenuItem(id: string): Promise<void> {
    await api.delete(`/menu/items/${id}`);
  }
  async toggleAvailability(id: string): Promise<any> {
    const response = await api.patch(`/menu/items/${id}/toggle`);
    return this.transformMenuItem(response.data.data.item);
  }

  // Transform backend menu item to frontend format
  transformMenuItem(backendItem: MenuItem): any {
    return {
      id: backendItem._id,
      name: backendItem.name,
      description: backendItem.description,
      price: backendItem.price,
      category: backendItem.category,
      preparationTime: backendItem.preparationTime,
      isAvailable: backendItem.isAvailable,
      allergens: backendItem.allergens || [],
      dietaryRestrictions: backendItem.dietaryRestrictions || [],
      createdAt: backendItem.createdAt,
      updatedAt: backendItem.updatedAt
    };
  }

  // Get transformed menu items for frontend compatibility
  async getTransformedMenuItems(): Promise<any[]> {
    const items = await this.getMenuItems();
    return items.map(item => this.transformMenuItem(item));
  }
}

export default new MenuService();
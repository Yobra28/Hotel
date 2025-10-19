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
  orderType: 'room-service' | 'takeaway' | 'dine-in';
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

  // Create food order
  async createOrder(orderData: CreateOrderData & { guestId?: string; roomId?: string }): Promise<FoodOrder> {
    try {
      const response = await api.post('/orders/food', orderData);
      return response.data.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create order');
    }
  }

  // Get user's food orders
  async getMyOrders(): Promise<FoodOrder[]> {
    try {
      const response = await api.get('/orders/food/my-orders');
      return response.data.data.orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<FoodOrder | null> {
    try {
      const response = await api.get(`/orders/food/${id}`);
      return response.data.data.order;
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
  async getAllOrders(params?: any): Promise<FoodOrder[]> {
    try {
      const response = await api.get('/orders/food', { params });
      return response.data.data.orders || [];
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
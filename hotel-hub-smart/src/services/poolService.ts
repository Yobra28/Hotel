import api from './api';

export interface PoolFacility {
  _id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'heated' | 'infinity' | 'kiddie' | 'lap' | 'therapeutic';
  status: 'open' | 'closed' | 'maintenance' | 'private-event';
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  depth: {
    min: number;
    max: number;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  amenities: string[];
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwimmingActivity {
  _id: string;
  name: string;
  description: string;
  type: 'swimming' | 'water-aerobics' | 'pool-party' | 'swimming-lesson' | 'aqua-therapy' | 'pool-games';
  poolId: string;
  instructor?: string;
  price: number;
  duration: number;
  capacity: number;
  currentParticipants: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  ageRequirement: {
    min: number;
    max?: number;
  };
  isActive: boolean;
  nextSession: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolBooking {
  _id: string;
  guest: string;
  poolId: string;
  activityId?: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  numberOfParticipants: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePoolBookingData {
  poolId: string;
  activityId?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  numberOfParticipants: number;
  specialRequests?: string;
}

class PoolService {
  // Get all pool facilities
  async getPoolFacilities(): Promise<PoolFacility[]> {
    try {
      const response = await api.get('/facilities/pools');
      return response.data.data.pools || [];
    } catch (error) {
      console.error('Error fetching pool facilities:', error);
      return [];
    }
  }

  // Create a pool facility
  async createPoolFacility(payload: Partial<PoolFacility>): Promise<any> {
    try {
      const response = await api.post('/facilities/pools', payload);
      return this.transformPool(response.data.data.pool);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create pool');
    }
  }

  // Update a pool facility
  async updatePoolFacility(id: string, payload: Partial<PoolFacility>): Promise<any> {
    try {
      const response = await api.put(`/facilities/pools/${id}`, payload);
      return this.transformPool(response.data.data.pool);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update pool');
    }
  }

  // Get pool facility by ID
  async getPoolById(id: string): Promise<PoolFacility | null> {
    try {
      const response = await api.get(`/facilities/pools/${id}`);
      return response.data.data.pool;
    } catch (error) {
      console.error('Error fetching pool by ID:', error);
      return null;
    }
  }

  // Get all swimming activities
  async getSwimmingActivities(): Promise<SwimmingActivity[]> {
    try {
      const response = await api.get('/activities/swimming');
      return response.data.data.activities || [];
    } catch (error) {
      console.error('Error fetching swimming activities:', error);
      return [];
    }
  }

  // Get activities by pool
  async getActivitiesByPool(poolId: string): Promise<SwimmingActivity[]> {
    try {
      const response = await api.get(`/activities/swimming?poolId=${poolId}`);
      return response.data.data.activities || [];
    } catch (error) {
      console.error('Error fetching activities by pool:', error);
      return [];
    }
  }

  // Create swimming activity (admin)
  async createSwimmingActivity(payload: Partial<SwimmingActivity>): Promise<any> {
    try {
      const response = await api.post('/activities/swimming', payload);
      return this.transformActivity(response.data.data.activity);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create activity');
    }
  }

  // Update swimming activity (admin)
  async updateSwimmingActivity(id: string, payload: Partial<SwimmingActivity>): Promise<any> {
    try {
      const response = await api.put(`/activities/swimming/${id}`, payload);
      return this.transformActivity(response.data.data.activity);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update activity');
    }
  }

  // Delete swimming activity (admin)
  async deleteSwimmingActivity(id: string): Promise<void> {
    await api.delete(`/activities/swimming/${id}`);
  }

  // Create pool booking
  async createPoolBooking(bookingData: CreatePoolBookingData): Promise<PoolBooking> {
    try {
      const response = await api.post('/bookings/pools', bookingData);
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create pool booking');
    }
  }

  // Get user's pool bookings
  async getMyPoolBookings(): Promise<PoolBooking[]> {
    try {
      const response = await api.get('/bookings/pools/my-bookings');
      return response.data.data.bookings || [];
    } catch (error) {
      console.error('Error fetching user pool bookings:', error);
      return [];
    }
  }

  // Cancel pool booking
  async cancelPoolBooking(id: string): Promise<PoolBooking> {
    try {
      const response = await api.patch(`/bookings/pools/${id}/cancel`);
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to cancel pool booking');
    }
  }

  // Transform backend pool to frontend format
  transformPool(backendPool: PoolFacility): any {
    return {
      id: backendPool._id,
      name: backendPool.name,
      type: backendPool.type,
      status: backendPool.status,
      capacity: backendPool.capacity,
      currentOccupancy: backendPool.currentOccupancy,
      temperature: backendPool.temperature,
      depth: backendPool.depth,
      operatingHours: backendPool.operatingHours,
      amenities: backendPool.amenities || [],
      location: backendPool.location,
      createdAt: backendPool.createdAt,
      updatedAt: backendPool.updatedAt
    };
  }

  // Transform backend activity to frontend format
  transformActivity(backendActivity: SwimmingActivity): any {
    return {
      id: backendActivity._id,
      name: backendActivity.name,
      description: backendActivity.description,
      type: backendActivity.type,
      poolId: backendActivity.poolId,
      instructor: backendActivity.instructor,
      price: backendActivity.price,
      duration: backendActivity.duration,
      capacity: backendActivity.capacity,
      currentParticipants: backendActivity.currentParticipants,
      skillLevel: backendActivity.skillLevel,
      ageRequirement: backendActivity.ageRequirement,
      isActive: backendActivity.isActive,
      nextSession: backendActivity.nextSession,
      createdAt: backendActivity.createdAt,
      updatedAt: backendActivity.updatedAt
    };
  }

  // Get transformed pools for frontend compatibility
  async getTransformedPools(): Promise<any[]> {
    const pools = await this.getPoolFacilities();
    return pools.map(pool => this.transformPool(pool));
  }

  // Get transformed activities for frontend compatibility
  async getTransformedActivities(): Promise<any[]> {
    const activities = await this.getSwimmingActivities();
    return activities.map(activity => this.transformActivity(activity));
  }
  // Equipment services
  async getEquipment(params?: any): Promise<any[]> {
    try {
      const response = await api.get('/facilities/equipment', { params });
      return response.data.data.equipment || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  }

  transformEquipment(e: any): any {
    return {
      id: e._id,
      name: e.name,
      type: e.type,
      totalQuantity: e.totalQuantity,
      availableQuantity: e.availableQuantity,
      dailyRate: e.dailyRate,
      condition: e.condition,
      isAvailable: e.isAvailable,
      lastMaintenance: e.lastMaintenance,
      nextMaintenance: e.nextMaintenance,
      description: e.description,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async getTransformedEquipment(): Promise<any[]> {
    const list = await this.getEquipment();
    return list.map(e => this.transformEquipment(e));
  }

  async createEquipment(payload: any): Promise<any> {
    const response = await api.post('/facilities/equipment', payload);
    return this.transformEquipment(response.data.data.equipment);
  }

  async updateEquipment(id: string, payload: any): Promise<any> {
    const response = await api.put(`/facilities/equipment/${id}`, payload);
    return this.transformEquipment(response.data.data.equipment);
  }

  async deleteEquipment(id: string): Promise<void> {
    await api.delete(`/facilities/equipment/${id}`);
  }
}

export default new PoolService();

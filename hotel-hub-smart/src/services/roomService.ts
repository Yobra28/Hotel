/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  category: string;
  floor: number;
  capacity: {
    adults: number;
    children: number;
  };
  size: number;
  bedType: string;
  numberOfBeds: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  features: Array<{
    name: string;
    description: string;
  }>;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order';
  housekeepingStatus: 'clean' | 'dirty' | 'out_of_order' | 'inspected';
  lastCleaned: Date;
  description: string;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  accessibility: {
    wheelchairAccessible: boolean;
    hearingImpaired: boolean;
    visuallyImpaired: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomSearchParams {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

class RoomService {
  // Get all available rooms
  async getAvailableRooms(params?: RoomSearchParams): Promise<Room[]> {
    try {
      const response = await api.get('/rooms/available', { params });
      console.log('Available rooms response:', response.data);
      // Based on the backend successResponse helper, data is directly in response.data.data
      return response.data.data?.rooms || response.data.data || [];
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      return [];
    }
  }

  // Get all rooms (admin/staff only)
  async getAllRooms(params?: any): Promise<Room[]> {
    console.log('Attempting to fetch all rooms...');
    
    // Try different endpoints to find working room endpoints
    const endpointsToTry = [
      '/rooms',
      '/room', 
      '/accommodation/rooms',
      '/hotel/rooms',
      '/properties/rooms',
      '/accommodation',
      '/properties'
    ];
    
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying to fetch rooms from ${endpoint}...`);
        const response = await api.get(endpoint, { params });
        console.log(`✅ Successfully fetched rooms from ${endpoint}:`, response.data);
        
        // Try different response structures
        return response.data.data?.rooms || 
               response.data.rooms || 
               response.data.data || 
               (Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.log(`❌ ${endpoint} failed:`, error.response?.status, error.response?.data?.message || error.message);
        continue;
      }
    }
    
    console.error('All room fetching endpoints failed');
    return [];
  }

  // Get room by ID
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response.data.data.room;
    } catch (error) {
      console.error('Error fetching room by ID:', error);
      return null;
    }
  }

  // Get rooms by type
  async getRoomsByType(type: string): Promise<Room[]> {
    try {
      const response = await api.get('/rooms/by-type', {
        params: { type }
      });
      return response.data.data.rooms || [];
    } catch (error) {
      console.error('Error fetching rooms by type:', error);
      return [];
    }
  }

  // Transform backend room data to frontend format for display (keep backend values as-is)
  transformRoom(backendRoom: Room): any {
    const totalCapacity = (backendRoom.capacity?.adults || 0) + (backendRoom.capacity?.children || 0);
    return {
      id: backendRoom._id,
      number: backendRoom.roomNumber,
      type: backendRoom.type, // keep exact DB value e.g., "Smart Economy"
      category: backendRoom.category,
      status: backendRoom.status,
      price: backendRoom.pricePerNight,
      floor: backendRoom.floor,
      capacity: totalCapacity,
      adults: backendRoom.capacity?.adults ?? 0,
      children: backendRoom.capacity?.children ?? 0,
      amenities: backendRoom.amenities,
      description: backendRoom.description,
      images: backendRoom.images,
      lastCleaned: backendRoom.lastCleaned,
      housekeepingStatus: backendRoom.housekeepingStatus,
      isActive: backendRoom.isActive,
      bedType: backendRoom.bedType,
      numberOfBeds: backendRoom.numberOfBeds,
      size: backendRoom.size,
      currency: backendRoom.currency,
      features: backendRoom.features,
      accessibility: backendRoom.accessibility
    };
  }

  // Get transformed rooms for frontend compatibility
  async getTransformedAvailableRooms(params?: RoomSearchParams): Promise<any[]> {
    const rooms = await this.getAvailableRooms(params);
    return rooms.map(room => this.transformRoom(room));
  }

  // Create mock data structure for backward compatibility
  async getMockCompatibleRooms(): Promise<any[]> {
    const rooms = await this.getAvailableRooms();
    return rooms.map(room => this.transformRoom(room));
  }

  // Get all transformed rooms (including occupied ones)
  async getTransformedRooms(): Promise<any[]> {
    const rooms = await this.getAllRooms();
    return rooms.map(room => this.transformRoom(room));
  }

  // Test what endpoints are available
  async testBackendEndpoints(): Promise<void> {
    console.log('=== Testing Backend Endpoints ===');
    
    const endpointsToTest = [
      '/rooms',
      '/rooms/available', 
      '/room',
      '/accommodation',
      '/accommodation/rooms',
      '/hotel/rooms',
      '/properties',
      '/properties/rooms'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        const response = await api.get(endpoint);
        console.log(`✅ ${endpoint}: Status ${response.status}`);
      } catch (error: any) {
        console.log(`❌ ${endpoint}: Status ${error.response?.status || 'Connection Failed'} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test if we can find any working endpoints by checking other services
    console.log('\n=== Testing Known Working Endpoints ===');
    try {
      const guestResponse = await api.get('/guests');
      console.log(`✅ /guests: Status ${guestResponse.status}`);
    } catch (error: any) {
      console.log(`❌ /guests: Status ${error.response?.status || 'Connection Failed'}`);
    }
    
    try {
      const bookingResponse = await api.get('/bookings');
      console.log(`✅ /bookings: Status ${bookingResponse.status}`);
    } catch (error: any) {
      console.log(`❌ /bookings: Status ${error.response?.status || 'Connection Failed'}`);
    }
  }

  // Create a new room - will first test endpoints to find the right one
  async createRoom(roomData: any): Promise<Room> {
    try {
      // First test endpoints to see what's available
      await this.testBackendEndpoints();
      
      // Start with minimal required data and build up
      const backendRoomData: any = {
        roomNumber: roomData.number.toString(),
        type: this.mapFrontendTypeToBackend(roomData.type),
        floor: parseInt(roomData.floor.toString()),
        pricePerNight: parseInt(roomData.price.toString()),
        status: roomData.status || 'available',
        isActive: true
      };

      // Add optional fields if they exist
      if (roomData.capacity) {
        backendRoomData.capacity = {
          adults: Math.max(1, Math.floor(parseInt(roomData.capacity) * 0.7)),
          children: Math.max(0, Math.floor(parseInt(roomData.capacity) * 0.3))
        };
      }

      // Add other fields with defaults
      backendRoomData.category = roomData.category || 'Standard';
      backendRoomData.size = roomData.size || 25;
      backendRoomData.bedType = roomData.bedType || 'Queen';
      backendRoomData.numberOfBeds = roomData.numberOfBeds || 1;
      backendRoomData.currency = 'KES';
      backendRoomData.amenities = roomData.amenities || ['WiFi', 'TV', 'Air Conditioning'];
      backendRoomData.features = roomData.features || [];
      backendRoomData.housekeepingStatus = 'clean';
      backendRoomData.description = roomData.description || `Comfortable ${roomData.type} room on floor ${roomData.floor}`;
      backendRoomData.images = roomData.images || [];
      backendRoomData.accessibility = {
        wheelchairAccessible: false,
        hearingImpaired: false,
        visuallyImpaired: false
      };
      
      console.log('Creating room with data:', JSON.stringify(backendRoomData, null, 2));
      
      // Try different endpoints until one works
      const endpointsToTry = ['/rooms', '/room', '/accommodation/rooms', '/hotel/rooms', '/properties/rooms'];
      let lastError: any;
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Trying to create room via ${endpoint}...`);
          const response = await api.post(endpoint, backendRoomData);
          console.log(`✅ Room created successfully via ${endpoint}:`, response.data);
          return response.data.data.room || response.data.room || response.data;
        } catch (error: any) {
          console.log(`❌ ${endpoint} failed:`, error.response?.status, error.response?.data?.message || error.message);
          lastError = error;
          continue;
        }
      }
      
      // If we get here, all endpoints failed
      throw lastError;
      
    } catch (error: any) {
      console.error('All room creation attempts failed. Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Handle different error response formats
      let errorMessage = 'Failed to create room - no working endpoints found';
      
      if (error.response?.status === 404) {
        errorMessage = 'Room management endpoints are not implemented on the backend server yet';
      } else if (error.response?.data) {
        const responseData = error.response.data;
        errorMessage = responseData.error?.message || 
                      responseData.message || 
                      responseData.error || 
                      (typeof responseData === 'string' ? responseData : errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Update a room
  async updateRoom(id: string, roomData: any): Promise<Room> {
    try {
      const response = await api.put(`/rooms/${id}`, roomData);
      return response.data.data.room;
    } catch (error: any) {
      console.error('Error updating room:', error);
      throw new Error(error.response?.data?.message || 'Failed to update room');
    }
  }

  // Delete a room
  async deleteRoom(id: string): Promise<void> {
    try {
      await api.delete(`/rooms/${id}`);
    } catch (error: any) {
      console.error('Error deleting room:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete room');
    }
  }

  // Map frontend room types to backend types
  private mapFrontendTypeToBackend(frontendType: string): string {
    const typeMapping: Record<string, string> = {
      'single': 'Smart Economy',
      'double': 'Business Suite',
      'suite': 'Premium Deluxe',
      'deluxe': 'Presidential'
    };
    return typeMapping[frontendType] || frontendType;
  }
}

export default new RoomService();

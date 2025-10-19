import api from './api';

export interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  role: 'guest';
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  specialRequests?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  specialRequests?: string;
}

class GuestService {
  // Get all guests (admin/receptionist only)
  async getAllGuests(): Promise<Guest[]> {
    try {
      const response = await api.get('/guests');
      return response.data.data.guests || [];
    } catch (error) {
      // Fallback: some environments expose guests via admin staff endpoint when role=guest
      try {
        const fallback = await api.get('/admin/staff', { params: { role: 'guest', limit: 200 } });
        const items = (fallback.data.data?.items || fallback.data.data?.staff || fallback.data.data?.guests || []) as any[];
        return items;
      } catch (e) {
        console.error('Error fetching guests:', error);
        return [];
      }
    }
  }

  // Get guest by ID
  async getGuestById(id: string): Promise<Guest | null> {
    try {
      const response = await api.get(`/guests/${id}`);
      return response.data.data.guest;
    } catch (error) {
      console.error('Error fetching guest by ID:', error);
      return null;
    }
  }

  // Create guest
  async createGuest(guestData: CreateGuestData): Promise<Guest> {
    try {
      const response = await api.post('/guests', {
        ...guestData,
        role: 'guest'
      });
      return response.data.data.guest;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create guest');
    }
  }

  // Update guest
  async updateGuest(id: string, guestData: Partial<CreateGuestData>): Promise<Guest> {
    try {
      const response = await api.put(`/guests/${id}`, guestData);
      return response.data.data.guest;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update guest');
    }
  }

  // Delete guest (soft delete)
  async deleteGuest(id: string): Promise<void> {
    try {
      await api.delete(`/guests/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to delete guest');
    }
  }

  // Search guests
  async searchGuests(query: string): Promise<Guest[]> {
    try {
      const response = await api.get(`/guests/search?q=${encodeURIComponent(query)}`);
      return response.data.data.guests || [];
    } catch (error) {
      console.error('Error searching guests:', error);
      return [];
    }
  }

  // Transform backend guest to frontend format
  transformGuest(backendGuest: Guest): any {
    return {
      id: backendGuest._id,
      firstName: backendGuest.firstName,
      lastName: backendGuest.lastName,
      name: `${backendGuest.firstName} ${backendGuest.lastName}`,
      email: backendGuest.email,
      phone: backendGuest.phone,
      idNumber: backendGuest.idNumber,
      nationality: backendGuest.nationality,
      address: backendGuest.address,
      emergencyContact: backendGuest.emergencyContact,
      specialRequests: backendGuest.specialRequests,
      isActive: backendGuest.isActive,
      createdAt: backendGuest.createdAt,
      updatedAt: backendGuest.updatedAt
    };
  }

  // Get transformed guests for frontend compatibility
  async getTransformedGuests(): Promise<any[]> {
    const guests = await this.getAllGuests();
    return guests.map(guest => this.transformGuest(guest));
  }
}

export default new GuestService();
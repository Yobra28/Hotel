import api from './api';

export interface Booking {
  _id: string;
  bookingNumber: string;
  guest: string; // User ID
  room: string; // Room ID
  checkInDate: Date;
  checkOutDate: Date;
  actualCheckInDate?: Date;
  actualCheckOutDate?: Date;
  numberOfNights: number;
  numberOfGuests: {
    adults: number;
    children: number;
  };
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  pricing: {
    roomRate: number;
    subtotal: number;
    taxes: number;
    serviceCharges: number;
    discount: {
      amount: number;
      type: 'fixed' | 'percentage';
      reason?: string;
    };
    totalAmount: number;
    currency: string;
  };
  payments: Array<{
    amount: number;
    method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'online';
    transactionId?: string;
    paymentDate: Date;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    processedBy?: string;
  }>;
  specialRequests: Array<{
    request: string;
    status: 'pending' | 'fulfilled' | 'not_possible';
    fulfilledBy?: string;
    fulfilledAt?: Date;
    notes?: string;
  }>;
  services: Array<{
    serviceName: string;
    description: string;
    amount: number;
    quantity: number;
    orderedAt: Date;
    status: 'ordered' | 'in_progress' | 'delivered' | 'cancelled';
  }>;
  guestDetails: {
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
  };
  source: 'website' | 'phone' | 'walk_in' | 'booking_com' | 'expedia' | 'agoda' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: {
    adults: number;
    children: number;
  };
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    nationality?: string;
  };
  bookingNumber?: string;
  specialRequests?: string[];
  source?: string;
}

class BookingService {
  // Get all bookings for current user (guest)
  async getMyBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data.data.bookings || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  // Get all bookings (admin/staff only)
  async getAllBookings(params?: any): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings', { params });
      return response.data.data.bookings || [];
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }

  // Create a new booking
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    // Try guest endpoint first, then fallback to staff endpoint if authorized
    const tryEndpoints = ['/bookings/guest', '/bookings'];
    let lastErr: any = null;
    for (const ep of tryEndpoints) {
      try {
        const response = await api.post(ep, bookingData);
        return response.data.data.booking;
      } catch (e: any) {
        lastErr = e;
        // If forbidden/unauthorized, try next endpoint
        if ([401, 403].includes(e?.response?.status)) continue;
        // For other errors (e.g., validation), stop and surface message
        break;
      }
    }
    const msg = lastErr?.response?.data?.error?.message || lastErr?.response?.data?.message || lastErr?.message || 'Failed to create booking';
    throw new Error(msg);
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data.data.booking;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      return null;
    }
  }

  // Update booking status
  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    try {
      const response = await api.patch(`/bookings/${id}/status`, { status });
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update booking status');
    }
  }

  // Add payment to booking (staff)
  async addPayment(bookingId: string, paymentData: { amount: number; method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'online'; transactionId?: string; status?: 'pending' | 'completed' | 'failed' | 'refunded'; }): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${bookingId}/payments`, paymentData);
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to add payment');
    }
  }

  // Guest self-payment (e.g., M-Pesa auto-complete or cash pending)
  async addGuestPayment(bookingId: string, paymentData: { amount: number; method: 'mpesa' | 'cash'; transactionId?: string; }): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${bookingId}/payments/guest`, paymentData);
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to add payment');
    }
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`, { reason });
      return response.data.data.booking;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to cancel booking');
    }
  }

  // Transform backend booking data to frontend format for compatibility
  transformBooking(backendBooking: Booking): any {
    return {
      id: backendBooking._id,
      bookingNumber: backendBooking.bookingNumber,
      guestId: backendBooking.guest,
      roomId: backendBooking.room,
      checkIn: backendBooking.checkInDate,
      checkOut: backendBooking.checkOutDate,
      actualCheckIn: backendBooking.actualCheckInDate,
      actualCheckOut: backendBooking.actualCheckOutDate,
      nights: backendBooking.numberOfNights,
      adults: backendBooking.numberOfGuests.adults,
      children: backendBooking.numberOfGuests.children,
      status: backendBooking.status,
      totalAmount: backendBooking.pricing.totalAmount,
      paidAmount: backendBooking.payments.reduce((total, payment) => {
        return payment.status === 'completed' ? total + payment.amount : total;
      }, 0),
      paymentStatus: backendBooking.paymentStatus,
      paymentMethod: backendBooking.payments.length > 0 ? backendBooking.payments[0].method : undefined,
      specialRequests: backendBooking.specialRequests.map(req => req.request).join(', '),
      createdAt: backendBooking.createdAt,
      updatedAt: backendBooking.updatedAt,
      guestDetails: backendBooking.guestDetails,
      pricing: backendBooking.pricing,
      payments: backendBooking.payments,
      services: backendBooking.services
    };
  }

  // Get transformed bookings for frontend compatibility
  async getTransformedMyBookings(): Promise<any[]> {
    const bookings = await this.getMyBookings();
    return bookings.map(booking => this.transformBooking(booking));
  }

  // Create mock data structure for backward compatibility
  async getMockCompatibleBookings(): Promise<any[]> {
    const bookings = await this.getMyBookings();
    return bookings.map(booking => this.transformBooking(booking));
  }
}

export default new BookingService();
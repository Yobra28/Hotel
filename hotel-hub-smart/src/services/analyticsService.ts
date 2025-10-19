import api from './api';

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

export interface OccupancyData {
  date: string;
  occupancy: number;
  availableRooms: number;
  occupiedRooms: number;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
  totalGuests: number;
  activeGuests: number;
  pendingTasks: number;
  completedTasks: number;
  roomStats: {
    available: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
    total: number;
  };
  bookingStats: {
    confirmed: number;
    checkedIn: number;
    checkedOut: number;
    cancelled: number;
    total: number;
  };
  financialStats: {
    totalRevenue: number;
    totalPending: number;
    collectionRate: number;
    averageBookingValue: number;
  };
}

export interface PaymentAnalytics {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  totalOutstanding: number;
  collectionRate: number;
  paymentMethods: {
    [key: string]: {
      count: number;
      amount: number;
      percentage: number;
    };
  };
}

class AnalyticsService {
  // Get comprehensive analytics data
  async getAnalytics(period?: string, startDate?: string, endDate?: string): Promise<AnalyticsMetrics> {
    try {
      const params: any = {};
      if (period) params.period = period;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/analytics/dashboard', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Return default metrics if API fails
      return {
        totalRevenue: 0,
        totalBookings: 0,
        averageOccupancy: 0,
        totalGuests: 0,
        activeGuests: 0,
        pendingTasks: 0,
        completedTasks: 0,
        roomStats: {
          available: 0,
          occupied: 0,
          cleaning: 0,
          maintenance: 0,
          total: 0,
        },
        bookingStats: {
          confirmed: 0,
          checkedIn: 0,
          checkedOut: 0,
          cancelled: 0,
          total: 0,
        },
        financialStats: {
          totalRevenue: 0,
          totalPending: 0,
          collectionRate: 0,
          averageBookingValue: 0,
        },
      };
    }
  }

  // Get revenue trends over time
  async getRevenueTrends(period?: string): Promise<RevenueData[]> {
    try {
      const response = await api.get('/analytics/revenue-trends', { 
        params: { period: period || '6months' }
      });
      return response.data.data.trends || [];
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      
      // Return mock data as fallback
      return [
        { month: 'Jan', revenue: 45000, bookings: 28, occupancy: 75 },
        { month: 'Feb', revenue: 52000, bookings: 32, occupancy: 82 },
        { month: 'Mar', revenue: 48000, bookings: 30, occupancy: 78 },
        { month: 'Apr', revenue: 61000, bookings: 38, occupancy: 85 },
        { month: 'May', revenue: 55000, bookings: 34, occupancy: 80 },
        { month: 'Jun', revenue: 67000, bookings: 42, occupancy: 89 },
      ];
    }
  }

  // Get occupancy data over time
  async getOccupancyTrends(period?: string): Promise<OccupancyData[]> {
    try {
      const response = await api.get('/analytics/occupancy-trends', { 
        params: { period: period || '30days' }
      });
      return response.data.data.occupancy || [];
    } catch (error) {
      console.error('Error fetching occupancy trends:', error);
      
      // Return mock data as fallback
      const mockData: OccupancyData[] = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          occupancy: Math.floor(Math.random() * 30) + 60, // 60-90%
          availableRooms: Math.floor(Math.random() * 20) + 10,
          occupiedRooms: Math.floor(Math.random() * 30) + 20,
        });
      }
      return mockData;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(period?: string): Promise<PaymentAnalytics> {
    try {
      const response = await api.get('/analytics/payments', { 
        params: { period: period || '6months' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      
      // Return default data
      return {
        totalRevenue: 0,
        completedPayments: 0,
        pendingPayments: 0,
        totalOutstanding: 0,
        collectionRate: 0,
        paymentMethods: {},
      };
    }
  }

  // Generate financial report
  async generateFinancialReport(period: string, format: 'pdf' | 'excel' = 'pdf'): Promise<string> {
    try {
      const response = await api.post('/reports/financial', {
        period,
        format,
      });
      return response.data.data.downloadUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to generate financial report');
    }
  }

  // Generate operational report
  async generateOperationalReport(period: string, format: 'pdf' | 'excel' = 'pdf'): Promise<string> {
    try {
      const response = await api.post('/reports/operational', {
        period,
        format,
      });
      return response.data.data.downloadUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to generate operational report');
    }
  }

  // Get guest analytics
  async getGuestAnalytics(period?: string): Promise<any> {
    try {
      const response = await api.get('/analytics/guests', { 
        params: { period: period || '6months' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching guest analytics:', error);
      return {
        totalGuests: 0,
        newGuests: 0,
        returningGuests: 0,
        averageStayDuration: 0,
        guestSatisfaction: 0,
        nationalityBreakdown: [],
      };
    }
  }

  // Export analytics data
  async exportAnalytics(type: string, period: string, format: 'pdf' | 'excel' = 'pdf'): Promise<string> {
    try {
      const response = await api.post('/analytics/export', {
        type,
        period,
        format,
      });
      return response.data.data.downloadUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to export analytics');
    }
  }
}

export default new AnalyticsService();
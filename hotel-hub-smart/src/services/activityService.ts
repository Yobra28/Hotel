import api from './api';

export interface Activity {
  _id: string;
  type: 'pool' | 'spa' | 'restaurant' | 'transport' | 'event' | 'tour' | 'fitness' | 'conference';
  title: string;
  description: string;
  guest: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  capacity?: number;
  attendees: number;
  price: number;
  currency: string;
  bookingReference?: string;
  specialRequests?: string;
  metadata?: {
    instructor?: string;
    equipment?: string[];
    dressCode?: string;
    ageRestriction?: {
      min?: number;
      max?: number;
    };
    requirements?: string[];
    cancellationPolicy?: string;
  };
  relatedBooking?: string;
  relatedPoolBooking?: string;
  relatedFoodOrder?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityData {
  type: Activity['type'];
  title: string;
  description?: string;
  guest?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: string;
  location: string;
  capacity?: number;
  attendees?: number;
  price?: number;
  specialRequests?: string;
  metadata?: Activity['metadata'];
}

class ActivityService {
  // Get all activities for the current user (guest)
  async getMyActivities(): Promise<Activity[]> {
    try {
      const response = await api.get('/guest-activities/my-activities');
      const activities = response.data?.data?.activities || [];
      return activities;
    } catch (error: any) {
      throw error;
    }
  }

  // Get today's activities for the current user
  async getTodayActivities(): Promise<Activity[]> {
    try {
      const response = await api.get('/guest-activities/today');
      return response.data.data.activities || [];
    } catch (error) {
      console.error('Error fetching today\'s activities:', error);
      return [];
    }
  }

  // Create a new activity (staff only)
  async createActivity(activityData: CreateActivityData): Promise<Activity> {
    try {
      const response = await api.post('/guest-activities', activityData);
      return response.data.data.activity;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to create activity');
    }
  }

  // Update an activity
  async updateActivity(id: string, activityData: Partial<CreateActivityData>): Promise<Activity> {
    try {
      const response = await api.put(`/guest-activities/${id}`, activityData);
      return response.data.data.activity;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update activity');
    }
  }

  // Cancel an activity
  async cancelActivity(id: string, reason?: string): Promise<Activity> {
    try {
      const response = await api.patch(`/guest-activities/${id}/cancel`, { reason });
      return response.data.data.activity;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to cancel activity');
    }
  }

  // Mark activity as completed (staff only)
  async completeActivity(id: string): Promise<Activity> {
    try {
      const response = await api.patch(`/guest-activities/${id}/complete`);
      return response.data.data.activity;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to complete activity');
    }
  }

  // Delete an activity (staff only)
  async deleteActivity(id: string): Promise<void> {
    try {
      await api.delete(`/guest-activities/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to delete activity');
    }
  }

  // Get activities for a specific guest (staff only)
  async getGuestActivities(guestId: string, params?: { limit?: number; status?: string; type?: string }): Promise<Activity[]> {
    try {
      const response = await api.get(`/guest-activities/guest/${guestId}`, { params });
      return response.data.data.activities || [];
    } catch (error) {
      console.error('Error fetching guest activities:', error);
      return [];
    }
  }

  // Sync activities from existing bookings (admin only)
  async syncActivitiesFromBookings(params?: { guestId?: string; syncType?: 'all' | 'pool' | 'restaurant' }): Promise<{ syncCount: number }> {
    try {
      const response = await api.post('/guest-activities/sync', params);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to sync activities');
    }
  }

  // Get activity statistics (staff only)
  async getActivityStats(params?: { guestId?: string; startDate?: string; endDate?: string }): Promise<any> {
    try {
      const response = await api.get('/guest-activities/stats', { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get activity stats');
    }
  }

  // Transform backend activity to frontend format
  transformActivity(backendActivity: any): any {
    return {
      id: backendActivity._id || backendActivity.id,
      type: backendActivity.type,
      title: backendActivity.title,
      description: backendActivity.description || '',
      date: backendActivity.scheduledDate || backendActivity.date,
      time: backendActivity.scheduledTime || backendActivity.time,
      duration: backendActivity.duration || '1 hour',
      location: backendActivity.location,
      status: backendActivity.status || 'confirmed',
      capacity: backendActivity.capacity,
      attendees: backendActivity.attendees || 1,
      price: backendActivity.price || 0,
      bookingReference: backendActivity.bookingReference,
      specialRequests: backendActivity.specialRequests,
      metadata: backendActivity.metadata || {},
      createdAt: backendActivity.createdAt,
      updatedAt: backendActivity.updatedAt
    };
  }

  // Get transformed activities for frontend compatibility
  async getTransformedMyActivities(): Promise<any[]> {
    const activities = await this.getMyActivities();
    return activities.map(activity => this.transformActivity(activity));
  }

  // Get transformed today's activities
  async getTransformedTodayActivities(): Promise<any[]> {
    const activities = await this.getTodayActivities();
    return activities.map(activity => this.transformActivity(activity));
  }

  // Check if activity is today
  isToday(date: Date): boolean {
    const today = new Date();
    const activityDate = new Date(date);
    return (
      today.getDate() === activityDate.getDate() &&
      today.getMonth() === activityDate.getMonth() &&
      today.getFullYear() === activityDate.getFullYear()
    );
  }

  // Check if activity is tomorrow
  isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activityDate = new Date(date);
    return (
      tomorrow.getDate() === activityDate.getDate() &&
      tomorrow.getMonth() === activityDate.getMonth() &&
      tomorrow.getFullYear() === activityDate.getFullYear()
    );
  }

  // Group activities by date
  groupActivitiesByDate(activities: any[]): { today: any[]; tomorrow: any[]; later: any[] } {
    const today: any[] = [];
    const tomorrow: any[] = [];
    const later: any[] = [];

    activities.forEach(activity => {
      if (this.isToday(activity.date)) {
        today.push(activity);
      } else if (this.isTomorrow(activity.date)) {
        tomorrow.push(activity);
      } else {
        later.push(activity);
      }
    });

    return { today, tomorrow, later };
  }

  // Format date for display
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

export default new ActivityService();
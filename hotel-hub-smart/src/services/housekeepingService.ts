import api from './api';

export interface HousekeepingTask {
  _id: string;
  roomId: string;
  assignedTo: string;
  taskType: 'cleaning' | 'maintenance' | 'inspection' | 'deep_clean';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  notes?: string;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

class HousekeepingService {
  async listTasks(params?: any): Promise<HousekeepingTask[]> {
    try {
      const res = await api.get('/housekeeping/tasks', { params });
      return res.data.data.tasks || [];
    } catch (e) {
      console.error('Error fetching housekeeping tasks', e);
      return [];
    }
  }

  async myTasks(): Promise<HousekeepingTask[]> {
    try {
      const res = await api.get('/housekeeping/tasks/my');
      return res.data.data.tasks || [];
    } catch (e) {
      console.error('Error fetching my tasks', e);
      return [];
    }
  }

  async createTask(payload: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const res = await api.post('/housekeeping/tasks', payload);
    return res.data.data.task;
  }

  async updateTask(id: string, payload: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const res = await api.put(`/housekeeping/tasks/${id}`, payload);
    return res.data.data.task;
  }

  async updateStatus(id: string, status: HousekeepingTask['status']): Promise<HousekeepingTask> {
    const res = await api.patch(`/housekeeping/tasks/${id}/status`, { status });
    return res.data.data.task;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/housekeeping/tasks/${id}`);
  }
}

export default new HousekeepingService();

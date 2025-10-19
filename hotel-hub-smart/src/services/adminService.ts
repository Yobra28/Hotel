import api from './api';
import { UserRole } from '@/contexts/AuthContext';

export interface StaffUserApi {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  items: StaffUserApi[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    next: number | null;
    prev: number | null;
  };
}

export interface StaffQuery {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

class AdminService {
  async getStaff(params: StaffQuery = {}): Promise<StaffListResponse> {
    const response = await api.get('/admin/staff', { params });
    const data = response.data.data || {};
    return {
      items: data.items || [],
      pagination: data.pagination,
    };
  }

  async createStaff(payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    phone?: string;
    idNumber?: string;
    department?: string;
    password?: string;
  }): Promise<StaffUserApi> {
    const response = await api.post('/admin/staff', payload);
    return response.data.data.user;
  }

  async updateStaff(id: string, payload: Partial<Omit<StaffUserApi, '_id' | 'createdAt' | 'updatedAt'>>): Promise<StaffUserApi> {
    const response = await api.put(`/admin/staff/${id}`, payload);
    return response.data.data.user;
  }

  async deleteStaff(id: string): Promise<void> {
    await api.delete(`/admin/staff/${id}`);
  }

  async toggleStaffStatus(id: string): Promise<StaffUserApi> {
    const response = await api.patch(`/admin/staff/${id}/toggle-status`);
    return response.data.data.user;
  }
}

export default new AdminService();

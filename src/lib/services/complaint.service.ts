import api from '../api-client';
import { ComplaintStatus, Priority } from '../constants';

export interface CreateComplaintDTO {
    title: string;
    description: string;
    category: string;
    subCategory: string;
    priority: Priority;
    location: {
        address: string;
        latitude: number;
        longitude: number;
        ward: string;
    };
    citizenName: string;
    citizenMobile: string;
    attachments?: File[];
}

export const complaintService = {
    // Citizen actions
    submitComplaint: async (data: CreateComplaintDTO) => {
        return api.post('/complaints', data);
    },

    getComplaintByNumber: async (complaintNumber: string) => {
        return api.get(`/complaints/track/${complaintNumber}`);
    },

    // Admin/Officer actions
    getComplaints: async (params?: any) => {
        return api.get('/complaints', { params });
    },

    getComplaintById: async (id: string) => {
        return api.get(`/complaints/${id}`);
    },

    updateStatus: async (id: string, status: ComplaintStatus, note?: string) => {
        return api.patch(`/complaints/${id}/status`, { status, note });
    },

    assignComplaint: async (id: string, assignedDept: string, assignedOfficer?: string) => {
        return api.patch(`/complaints/${id}/assign`, { assignedDept, assignedOfficer });
    },

    escalateComplaint: async (id: string, reason: string) => {
        return api.post(`/complaints/${id}/escalate`, { reason });
    },

    // Dashboard stats
    getStats: async () => {
        return api.get('/complaints/stats');
    },

    getTrends: async (range: string = '30d') => {
        return api.get('/complaints/trends', { params: { range } });
    },

    getPublicAnalytics: async () => {
        return api.get('/analytics/public');
    }
};

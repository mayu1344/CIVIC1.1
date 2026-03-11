import api from '../api-client';
import { ComplaintStatus, Priority } from '../constants';
import { notificationEvents, NOTIFICATION_EVENTS } from './notificationEvents';

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
        const formData = new FormData();
        
        // Add text fields
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('subCategory', data.subCategory);
        formData.append('priority', data.priority);
        formData.append('citizenName', data.citizenName);
        formData.append('citizenMobile', data.citizenMobile);
        
        // Add location as JSON string
        formData.append('location', JSON.stringify(data.location));
        
        // Add files if present
        if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach((file) => {
                formData.append('attachments', file);
            });
        }
        
        const response = await api.post('/complaints', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        // Emit event to update notifications
        if (response.data.success) {
            notificationEvents.emit(NOTIFICATION_EVENTS.NEW_COMPLAINT, response.data.data);
        }
        
        return response;
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
        const response = await api.patch(`/complaints/${id}/status`, { status, note });
        
        // Emit event to refresh notification counts when status changes
        if (response.data.success) {
            notificationEvents.emit(NOTIFICATION_EVENTS.REFRESH_COUNTS);
        }
        
        return response;
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

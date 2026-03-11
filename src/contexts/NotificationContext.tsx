"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationEvents, NOTIFICATION_EVENTS } from '@/lib/notificationEvents';

interface NotificationCounts {
    newComplaints: number;
    pendingComplaints: number;
    slaBreached: number;
    highPriorityPending: number;
    escalatedComplaints: number;
}

interface NotificationContextType {
    counts: NotificationCounts;
    loading: boolean;
    refresh: () => Promise<void>;
    incrementNewComplaints: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [counts, setCounts] = useState<NotificationCounts>({
        newComplaints: 0,
        pendingComplaints: 0,
        slaBreached: 0,
        highPriorityPending: 0,
        escalatedComplaints: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchNotificationCounts = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            
            const response = await fetch(`${apiUrl}/api/v1/admin/notifications`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCounts(data.data);
                }
            } else {
                // Fallback: fetch stats and calculate counts
                const statsResponse = await fetch(`${apiUrl}/api/v1/admin/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.success) {
                        const stats = statsData.data;
                        setCounts({
                            newComplaints: stats.pending || 0,
                            pendingComplaints: stats.pending || 0,
                            slaBreached: stats.sla_breached || 0,
                            highPriorityPending: 0,
                            escalatedComplaints: stats.escalated || 0
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching notification counts:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementNewComplaints = () => {
        setCounts(prev => ({
            ...prev,
            newComplaints: prev.newComplaints + 1,
            pendingComplaints: prev.pendingComplaints + 1
        }));
    };

    useEffect(() => {
        fetchNotificationCounts();
        
        // Set up polling to refresh counts every 30 seconds
        const interval = setInterval(fetchNotificationCounts, 30000);
        
        // Listen for notification events
        const handleNewComplaint = () => {
            incrementNewComplaints();
        };
        
        const handleRefreshCounts = () => {
            fetchNotificationCounts();
        };
        
        notificationEvents.on(NOTIFICATION_EVENTS.NEW_COMPLAINT, handleNewComplaint);
        notificationEvents.on(NOTIFICATION_EVENTS.REFRESH_COUNTS, handleRefreshCounts);
        
        return () => {
            clearInterval(interval);
            notificationEvents.off(NOTIFICATION_EVENTS.NEW_COMPLAINT, handleNewComplaint);
            notificationEvents.off(NOTIFICATION_EVENTS.REFRESH_COUNTS, handleRefreshCounts);
        };
    }, []);

    return (
        <NotificationContext.Provider value={{
            counts,
            loading,
            refresh: fetchNotificationCounts,
            incrementNewComplaints
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
// src/services/dashboard.service.ts - Dashboard data fetching

import api from './api';
import type { DashboardData, SmartScaleReading, UserGoals, WeeklyDashboardData } from '../types';

const dashboardService = {
    // Get all dashboard data
    getDashboardData: async (): Promise<DashboardData> => {
        const response = await api.get<DashboardData>('/dashboard/daily');
        return response.data;
    },

    // Get weekly dashboard data
    getWeeklyData: async (): Promise<WeeklyDashboardData> => {
        const response = await api.get<WeeklyDashboardData>('/dashboard/weekly');
        return response.data;
    },

    // Get latest smart scale reading
    getLatestWeight: async (): Promise<SmartScaleReading | null> => {
        const response = await api.get<SmartScaleReading>('/smart-scale/readings/latest');
        return response.data;
    },

    // Simulate smart scale (generate new reading)
    simulateSmartScale: async (): Promise<SmartScaleReading> => {
        const response = await api.post<SmartScaleReading>('/smart-scale/simulate');
        return response.data;
    },

    // Get user goals
    getUserGoals: async (): Promise<UserGoals> => {
        const response = await api.get<UserGoals>('/goals');
        return response.data;
    },
};

export default dashboardService;
// src/services/food.service.ts - Food logs API service

import api from './api';

export interface FoodItem {
    id: number;
    name: string;
    calories: number;  // calories per 100g
    protein: number;
    fats: number;
    carbs: number;
    source: 'PERSONAL' | 'EXTERNAL';
}

export interface FoodLog {
    id: number;
    foodName: string;
    source: 'PERSONAL' | 'EXTERNAL';
    grams: number;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    timestamp: string; // ISO datetime string
}

export interface FoodStats {
    todayCalories: number;
    todayProtein: number;
    todayCarbs: number;
    todayFats: number;
    weeklyCalories: number;
    weeklyMeals: number;
}

class FoodService {
    /**
     * Get all food logs for current user
     */
    async getAllLogs(): Promise<FoodLog[]> {
        const response = await api.get<FoodLog[]>('/food-logs');
        return response.data;
    }

    /**
     * Get today's food logs
     */
    async getTodayLogs(): Promise<FoodLog[]> {
        const response = await api.get<FoodLog[]>('/food-logs/today');
        return response.data;
    }

    /**
     * Get logs for specific date
     */
    async getLogsByDate(date: string): Promise<FoodLog[]> {
        const response = await api.get<FoodLog[]>(`/food-logs/date/${date}`);
        return response.data;
    }

    /**
     * Delete a food log
     */
    async deleteLog(logId: number): Promise<void> {
        await api.delete(`/food-logs/${logId}`);
    }


    async deleteFood(foodId: number): Promise<void> {
        await api.delete(`/foods/${foodId}`);
    }

    /**
     * Get last 7 days of logs (client-side filtering)
     */
    async getLast7DaysLogs(): Promise<FoodLog[]> {
        const allLogs = await this.getAllLogs();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return allLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= sevenDaysAgo;
        });
    }

    /**
     * Search USDA FoodData Central database
     * Returns foods from external API (not stored in our DB)
     */
    async searchUSDAFoods(query: string, limit: number = 10): Promise<FoodItem[]> {
        const response = await api.get<FoodItem[]>('/foods/search/usda', {
            params: { q: query, limit }
        });
        return response.data;
    }

    /**
     * Calculate statistics from logs
     */
    calculateStats(logs: FoodLog[]): FoodStats {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });

        const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
        const todayCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
        const todayFats = todayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);

        const weeklyCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const weeklyMeals = logs.length;

        return {
            todayCalories: Math.round(todayCalories),
            todayProtein: Math.round(todayProtein),
            todayCarbs: Math.round(todayCarbs),
            todayFats: Math.round(todayFats),
            weeklyCalories: Math.round(weeklyCalories),
            weeklyMeals,
        };
    }

    /**
     * Group logs by date (returns Map)
     */
    groupLogsByDate(logs: FoodLog[]): Map<string, FoodLog[]> {
        const grouped = new Map<string, FoodLog[]>();

        logs.forEach(log => {
            const date = log.timestamp.split('T')[0]; // Extract date part (YYYY-MM-DD)
            if (!grouped.has(date)) {
                grouped.set(date, []);
            }
            grouped.get(date)!.push(log);
        });

        return grouped;
    }
}

export default new FoodService();
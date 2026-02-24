// src/services/profile.service.ts - Profile & Goals API service

import api from './api';

export interface UserProfile {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
}

export interface Biometrics {
    id: number;
    heightCm: number;
    weightKg: number;
    gender: string;
    age: number;
    lastUpdated: string;
    bmi: number;
}

export interface Goals {
    targetWeightKg: number;
    dailyCalorieGoal: number;
    weeklyExerciseGoalMinutes: number;
    goalCreatedDate: string;
}

export interface ProfileStats {
    currentWeight: number | null;
    calorieGoal: number;
    exerciseGoalDaily: number;
    targetWeight: number | null;
}

class ProfileService {
    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<UserProfile> {
        const response = await api.get<UserProfile>('/users/me');
        return response.data;
    }

    /**
     * Get latest biometrics
     */
    async getLatestBiometrics(): Promise<Biometrics | null> {
        try {
            const response = await api.get<Biometrics>('/biometrics/latest');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No biometrics set yet
            }
            throw error;
        }
    }

    /**
     * Update biometrics
     */
    async updateBiometrics(data: {
        heightCm: number;
        weightKg: number;
        gender: string;
        age: number;
    }): Promise<Biometrics> {
        const response = await api.post<Biometrics>('/biometrics', data);
        return response.data;
    }

    /**
     * Get user goals
     */
    async getGoals(): Promise<Goals | null> {
        try {
            const response = await api.get<Goals>('/goals');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No goals set yet
            }
            throw error;
        }
    }

    /**
     * Update goals
     */
    async updateGoals(data: {
        targetWeightKg: number;
        dailyCalorieGoal: number;
        weeklyExerciseGoalMinutes: number;
    }): Promise<Goals> {
        const response = await api.post<Goals>('/goals', data);
        return response.data;
    }

    /**
     * Get profile stats (aggregated data)
     */
    async getProfileStats(): Promise<ProfileStats> {
        const [biometrics, goals] = await Promise.all([
            this.getLatestBiometrics(),
            this.getGoals(),
        ]);

        return {
            currentWeight: biometrics?.weightKg || null,
            calorieGoal: goals?.dailyCalorieGoal || 2000,
            exerciseGoalDaily: goals ? Math.round(goals.weeklyExerciseGoalMinutes / 7) : 30,
            targetWeight: goals?.targetWeightKg || null,
        };
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(user: UserProfile): string {
        const first = user.firstname?.charAt(0)?.toUpperCase() || '';
        const last = user.lastname?.charAt(0)?.toUpperCase() || '';
        return first + last || user.username?.charAt(0)?.toUpperCase() || 'U';
    }

    /**
     * Get full name
     */
    getFullName(user: UserProfile): string {
        return `${user.firstname} ${user.lastname}`.trim() || user.username;
    }
}

export default new ProfileService();
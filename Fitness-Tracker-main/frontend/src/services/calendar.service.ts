// src/services/calendar.service.ts
import api from './api';

export interface CalendarDayData {
    date: string;
    workout: boolean;
    calories: number;
    calorieGoal: number;
    exerciseMinutes: number;
    exerciseGoal: number;
    meals: string[];
    exercises: string[];
}

export interface MonthStats {
    workoutDays: number;
    calorieGoalMetDays: number;
    exerciseGoalMetDays: number;
    totalCalories: number;
    totalExerciseMinutes: number;
    daysWithData: number;
}

export interface CalendarMonthData {
    days: Record<string, CalendarDayData>;
    stats: MonthStats;
}

export interface StreakInfo {
    days: number;
    startDate?: string;
    endDate?: string;
    dates: string[];
}

export interface StreakData {
    currentStreak: StreakInfo;
    longestStreak: StreakInfo;
}

export interface UserGoals {
    targetWeightKg: number;
    dailyCalorieGoal: number;
    weeklyExerciseGoalMinutes: number;
}

export interface CurrentBiometrics {
    currentWeight: number;
}


class CalendarService {
    async getMonthData(year: number, month: number): Promise<CalendarMonthData> {
        const response = await api.get<CalendarMonthData>(`/calendar/month/${year}/${month}`);
        return response.data;
    }

    async getDayDetails(date: string): Promise<CalendarDayData> {
        const response = await api.get<CalendarDayData>(`/calendar/day/${date}`);
        return response.data;
    }

    async getStreaks(): Promise<StreakData> {
        const response = await api.get<StreakData>('/calendar/streaks');
        return response.data;
    }

    async getUserGoals(): Promise<UserGoals> {
        const response = await api.get<UserGoals>('/goals');
        return response.data;
    }

    async getCurrentBiometrics(): Promise<CurrentBiometrics> {
        const response = await api.get<CurrentBiometrics>('/biometrics/latest');
        return response.data;
    }
}

export default new CalendarService();
// src/services/exercise.service.ts
import api from './api';

export interface ExerciseLog {
    id: number;
    exerciseName: string;
    category: string;
    source: "PERSONAL" | "EXTERNAL";
    durationMinutes: number;
    caloriesBurnt: number;
    sets: number;
    reps: number;
    weightUsed: number;
    datePerformed: string;
}

export interface ExternalExerciseLogCreateRequest {
    exerciseName: string;
    category: string;
    exerciseType: "CARDIO" | "STRENGTH";
    caloriesBurntPerMinute: number;
    durationMinutes: number | null;
    sets: number;
    reps: number;
    weightUsed: number;
}

export interface ExerciseStats {
    todayMinutes: number;
    todayCalories: number;
    todayWorkouts: number;
    weeklyMinutes: number;
    weeklyCalories: number;
    weeklyWorkouts: number;
}

export interface Exercise {
    id: number;
    name: string;
    category: string;
    exerciseType: "CARDIO" | "STRENGTH";
    caloriesBurntPerMinute: number;
    source: "PERSONAL" | "EXTERNAL";
}

export interface ExerciseCreateRequest {
    name: string;
    category: string;
    exerciseType: "CARDIO" | "STRENGTH";
    caloriesBurned: number;
}

export interface ExerciseLogCreateRequest {
    exerciseId: number;
    durationMinutes: number | null;
    sets: number;
    reps: number;
    weightUsed: number;
}

class ExerciseService {

    /**
     * Get all external exercises (system-provided)
     * Used in LogWorkout page - External tab
     */
    async getExternalExercises(): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/external');
        return response.data;
    }

    /**
     * Get all personal exercises (user's custom exercises)
     * Used in LogWorkout page - Personal tab
     */
    async getPersonalExercises(): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/personal');
        return response.data;
    }

    /**
     * Create a new custom exercise
     * Used in LogWorkout page - Create Exercise dialog
     */
    async createExercise(data: ExerciseCreateRequest): Promise<Exercise> {
        const response = await api.post<Exercise>('/exercises', data);
        return response.data;
    }

    /**
     * Delete a custom exercise
     */
    async deleteExercise(exerciseId: number): Promise<void> {
        await api.delete(`/exercises/${exerciseId}`);
    }


    /**
     * Search exercises from Wger Workout Manager API
     * Returns exercises with null ID (indicating they're from Wger, not in our database)
     * Used in LogWorkout page - Wger tab for discovering new exercises
     */
    async searchWgerExercises(query: string, limit: number = 20): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/search/wger', {
            params: { q: query, limit }
        });
        return response.data;
    }

    /**
     * Get all exercises from Wger database (no search filter)
     * Useful for browsing/exploring exercises
     */
    async getAllWgerExercises(limit: number = 50): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/wger/all', {
            params: { limit }
        });
        return response.data;
    }

    /**
     * Search external exercises (from local database)
     */
    async searchExternalExercises(query: string): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/search/external', {
            params: { q: query }
        });
        return response.data;
    }

    /**
     * Search personal exercises (user's custom exercises)
     */
    async searchPersonalExercises(query: string): Promise<Exercise[]> {
        const response = await api.get<Exercise[]>('/exercises/search/personal', {
            params: { q: query }
        });
        return response.data;
    }

    /**
     * Create a new exercise log (log a workout)
     * Used in LogWorkout page - Log Workout dialog
     */
    async createExerciseLog(data: ExerciseLogCreateRequest): Promise<ExerciseLog> {
        const response = await api.post<ExerciseLog>('/exercise-logs', data);
        return response.data;
    }

    /**
     * Create an exercise log from an external exercise (Wger) WITHOUT saving it to personal exercises
     * POST /api/exercise-logs/external
     */
    async createExternalExerciseLog(data: ExternalExerciseLogCreateRequest): Promise<ExerciseLog> {
        const response = await api.post<ExerciseLog>('/exercise-logs/external', data);
        return response.data;
    }

    /**
     * Get all exercise logs for the current user
     */
    async getAllLogs(): Promise<ExerciseLog[]> {
        const response = await api.get<ExerciseLog[]>('/exercise-logs');
        return response.data;
    }

    /**
     * Get today's exercise logs
     */
    async getTodayLogs(): Promise<ExerciseLog[]> {
        const response = await api.get<ExerciseLog[]>('/exercise-logs/today');
        return response.data;
    }

    /**
     * Get this week's exercise logs
     */
    async getWeekLogs(): Promise<ExerciseLog[]> {
        const response = await api.get<ExerciseLog[]>('/exercise-logs/week');
        return response.data;
    }

    /**
     * Get exercise logs for a specific date
     */
    async getLogsByDate(date: string): Promise<ExerciseLog[]> {
        const response = await api.get<ExerciseLog[]>(`/exercise-logs/date/${date}`);
        return response.data;
    }

    /**
     * Delete an exercise log
     */
    async deleteLog(logId: number): Promise<void> {
        await api.delete(`/exercise-logs/${logId}`);
    }


    /**
     * Calculate statistics from exercise logs
     */
    calculateStats(logs: ExerciseLog[]): ExerciseStats {
        const today = new Date().toISOString().split('T')[0];

        const todayLogs = logs.filter(log => log.datePerformed === today);
        const todayMinutes = todayLogs.reduce((sum, log) => sum + Number(log.durationMinutes), 0);
        const todayCalories = todayLogs.reduce((sum, log) => sum + Number(log.caloriesBurnt), 0);
        const todayWorkouts = todayLogs.length;

        const weeklyMinutes = logs.reduce((sum, log) => sum + Number(log.durationMinutes), 0);
        const weeklyCalories = logs.reduce((sum, log) => sum + Number(log.caloriesBurnt), 0);
        const weeklyWorkouts = logs.length;

        return {
            todayMinutes,
            todayCalories,
            todayWorkouts,
            weeklyMinutes,
            weeklyCalories,
            weeklyWorkouts,
        };
    }

    /**
     * Group exercise logs by date
     * Returns a map of date -> logs for that date
     */
    groupLogsByDate(logs: ExerciseLog[]): Map<string, ExerciseLog[]> {
        const grouped = new Map<string, ExerciseLog[]>();

        logs.forEach(log => {
            const date = log.datePerformed;
            if (!grouped.has(date)) {
                grouped.set(date, []);
            }
            grouped.get(date)!.push(log);
        });

        return grouped;
    }

    /**
     * Get last 7 days of exercise logs
     */
    async getLast7DaysLogs(): Promise<ExerciseLog[]> {
        const allLogs = await this.getAllLogs();

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        return allLogs.filter(log => {
            const logDate = new Date(log.datePerformed);
            return logDate >= sevenDaysAgo && logDate <= today;
        });
    }
}

export default new ExerciseService();
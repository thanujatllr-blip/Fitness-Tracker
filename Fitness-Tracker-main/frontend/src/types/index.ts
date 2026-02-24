// src/types/index.ts - All TypeScript types for the app

// ============================================
// USER & AUTH
// ============================================

export interface User {
    id: number;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// ============================================
// FOOD
// ============================================

export interface Food {
    id: number;
    foodName: string;
    caloriesPer100g: number;
    protein: number;
    fats: number;
    carbohydrates: number;
    source: 'EXTERNAL' | 'PERSONAL';
}

export interface FoodLog {
    id: number;
    foodId: number;
    foodName: string;
    quantityGrams: number;
    caloriesConsumed: number;
    dateTime: string;
}

// ============================================
// EXERCISE
// ============================================

export interface Exercise {
    id: number;
    exerciseName: string;
    category: string;
    exerciseType: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'HYBRID';
    caloriesBurntPerMinute: number;
    source: 'EXTERNAL' | 'PERSONAL';
}

export interface ExerciseLog {
    id: number;
    exerciseId: number;
    exerciseName: string;
    durationMinutes: number;
    caloriesBurnt: number;
    sets: number;
    reps: number;
    weightUsed: number;
    datePerformed: string;
}

// ============================================
// DASHBOARD
// ============================================

// ============================================
// DASHBOARD - Matches DashboardResponse.java
// ============================================

export interface DashboardData {
    smartScale: SmartScaleData;
    calorieIntake: CalorieIntakeData;
    exerciseProgress: ExerciseProgressData;
}

// Weekly dashboard data
export interface WeeklyDashboardData {
    weeklyCalories: WeeklyCalorieData[];
    weeklyExercise: WeeklyExerciseData[];
}

export interface WeeklyCalorieData {
    day: string;
    date: string;
    calories: number;
}

export interface WeeklyExerciseData {
    day: string;        // "Mon", "Tue", "Wed", etc. (for current week)
    date: string;       // "2026-01-06" (actual date)
    minutes: number;    // Total minutes for that day
    // Legacy fields (optional for backward compatibility)
    weekStart?: string;
    weekEnd?: string;
    weekLabel?: string;
}

export interface SmartScaleData {
    currentWeight: number | null;
    weightChange?: number;
    bmi?: number;
    timestamp?: string;
    message?: string; // When no data exists
}

export interface CalorieIntakeData {
    consumed: number;
    goal: number;
    percentage: number;
    remaining: number;
}

export interface ExerciseProgressData {
    completed: number;
    goal: number;
    percentage: number;
    remaining: number;
}

export interface SmartScaleReading {
    id: number;
    weightKg: number;
    bodyFatPercentage?: number;
    muscleMassKg?: number;
    waterPercentage?: number;
    boneMassKg?: number;
    bmi?: number;  // Already optional ✅
    readingTimestamp: string;
    source?: string;  // Made optional
    weightTrend?: 'UP' | 'DOWN' | 'STABLE';
    // Alias fields for compatibility
    weight?: number;  // Same as weightKg
    timestamp?: string;  // Same as readingTimestamp
}

// ============================================
// GOALS
// ============================================

export interface UserGoals {
    userId: number;
    targetWeightKg: number;
    dailyCalorieGoal: number;
    weeklyExerciseGoalMinutes: number;
}
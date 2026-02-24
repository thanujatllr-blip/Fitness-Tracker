// src/pages/DashboardPage.tsx - Improved with better update handling

import { useState, useEffect, useCallback } from "react";
import { Navbar }from "../components/layout/Navbar";
import { ViewToggle } from "../components/dashboard/ViewToggle";
import { WeightCard } from "../components/dashboard/WeightCard";
import CalorieCard from "../components/dashboard/CalorieCard";
import ExerciseCard from "../components/dashboard/ExerciseCard";
import { WeeklyCalorieChart } from "../components/dashboard/WeeklyCalorieChart";
import { WeeklyExerciseChart } from "../components/dashboard/WeeklyExerciseChart";
import dashboardService from "../services/dashboard.service";
import type { DashboardData, WeeklyDashboardData } from "../types";

export default function DashboardPage() {
    const [view, setView] = useState<"daily" | "weekly">("daily");
    const [dailyData, setDailyData] = useState<DashboardData | null>(null);
    const [weeklyData, setWeeklyData] = useState<WeeklyDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [daily, weekly] = await Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getWeeklyData(),
            ]);
            setDailyData(daily);
            setWeeklyData(weekly);
            setError(null);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Lighter refresh that only updates non-weight data (calories, exercise)
    const refreshDashboardData = useCallback(async () => {
        try {
            const [daily, weekly] = await Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getWeeklyData(),
            ]);
            setDailyData(daily);
            setWeeklyData(weekly);
        } catch (err) {
            console.error('Dashboard refresh error:', err);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar/>
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar/>
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <p className="text-destructive">{error}</p>
                        <button
                            onClick={loadDashboard}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Format last updated timestamp
    const formatLastUpdated = (timestamp?: string) => {
        if (!timestamp) return "Today";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return "Today";
    };

    // Transform weekly exercise data for chart (show Mon-Sun for current week)
    const weeklyExerciseChartData = weeklyData?.weeklyExercise.map((item) => ({
        day: item.day || item.weekLabel || "N/A",
        minutes: item.minutes,
    })) || [];

    return (
        <div className="min-h-screen bg-background">
            <Navbar/>

            <main className="container mx-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="animate-fade-in" style={{animationDelay: "0ms"}}>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Track your fitness journey</p>
                    </div>
                    <div className="animate-fade-in" style={{animationDelay: "100ms"}}>
                        <ViewToggle view={view} onToggle={setView}/>
                    </div>
                </div>

                {/* Daily View */}
                {view === "daily" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="animate-fade-in" style={{animationDelay: "150ms"}}>
                            <WeightCard
                                weight={dailyData?.smartScale?.currentWeight || null}
                                weightChange={dailyData?.smartScale?.weightChange}
                                lastUpdated={formatLastUpdated(dailyData?.smartScale?.timestamp)}
                                onUpdate={refreshDashboardData}
                            />
                        </div>
                        <div className="animate-fade-in" style={{animationDelay: "200ms"}}>
                            <CalorieCard
                                consumed={dailyData?.calorieIntake?.consumed || 0}
                                goal={dailyData?.calorieIntake?.goal || 2000}
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1 animate-fade-in" style={{animationDelay: "250ms"}}>
                            <ExerciseCard
                                minutes={dailyData?.exerciseProgress?.completed || 0}
                                goal={dailyData?.exerciseProgress?.goal || 60}
                            />
                        </div>
                    </div>
                )}

                {/* Weekly View */}
                {view === "weekly" && (
                    <div className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <div className="animate-fade-in" style={{animationDelay: "150ms"}}>
                                <WeightCard
                                    weight={dailyData?.smartScale?.currentWeight || null}
                                    weightChange={dailyData?.smartScale?.weightChange}
                                    lastUpdated={formatLastUpdated(dailyData?.smartScale?.timestamp)}
                                    compact
                                    onUpdate={refreshDashboardData}
                                />
                            </div>
                            <div className="sm:col-span-1 lg:col-span-3 animate-fade-in"
                                 style={{animationDelay: "200ms"}}>
                                <WeeklyCalorieChart
                                    data={weeklyData?.weeklyCalories || []}
                                />
                            </div>
                        </div>
                        <div className="animate-fade-in" style={{animationDelay: "250ms"}}>
                            <WeeklyExerciseChart data={weeklyExerciseChartData}/>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
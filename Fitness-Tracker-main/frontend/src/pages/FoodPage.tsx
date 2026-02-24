// src/pages/FoodPage.tsx
import { Navbar } from "../components/layout/Navbar";
import { Utensils, Plus, Calendar, Trash2 } from "lucide-react";
import { ProgressRing } from "../components/dashboard/ProgressRing";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import foodService, { type FoodLog, type FoodStats } from "../services/food.service";
import api from "../services/api";
import axios from "axios";

interface GroupedMeals {
    date: string;
    displayDate: string;
    logs: FoodLog[];
}

interface GoalsResponse {
    targetWeightKg: number;
    dailyCalorieGoal: number;
    weeklyExerciseGoalMinutes: number;
    goalCreatedDate: string;
}

const Food = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState<FoodStats>({
        todayCalories: 0,
        todayProtein: 0,
        todayCarbs: 0,
        todayFats: 0,
        weeklyCalories: 0,
        weeklyMeals: 0,
    });
    const [goalCalories, setGoalCalories] = useState(2000); // Default goal
    const [isLoading, setIsLoading] = useState(true);
    const [groupedMeals, setGroupedMeals] = useState<GroupedMeals[]>([]);

    useEffect(() => {
        loadFoodData();
    }, []);

    const loadFoodData = async () => {
        try {
            setIsLoading(true);

            // Fetch last 7 days of logs
            const logs = await foodService.getLast7DaysLogs();

            // Calculate stats
            const calculatedStats = foodService.calculateStats(logs);
            setStats(calculatedStats);

            // Group logs by date
            const grouped = groupMealsByDay(logs);
            setGroupedMeals(grouped);

            // Fetch user's daily calorie goal from /api/goals
            try {
                const goalsResponse = await api.get<GoalsResponse>('/goals');
                if (goalsResponse.data.dailyCalorieGoal) {
                    setGoalCalories(Math.round(goalsResponse.data.dailyCalorieGoal));
                }
            } catch (goalError) {
                // Silent: Only log if it's NOT a 404 (goals not set)
                if (axios.isAxiosError(goalError) && goalError.response?.status !== 404) {
                    console.error('Error fetching goals:', goalError);
                }
                // Use default 2000 kcal
            }

        } catch (error) {
            console.error('Failed to load food data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupMealsByDay = (logs: FoodLog[]): GroupedMeals[] => {
        const grouped = foodService.groupLogsByDate(logs);
        const result: GroupedMeals[] = [];

        // Sort dates descending (most recent first)
        const sortedDates = Array.from(grouped.keys()).sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );

        sortedDates.forEach(date => {
            const displayDate = formatDateLabel(date);
            result.push({
                date,
                displayDate,
                logs: grouped.get(date)!,
            });
        });

        return result;
    };

    const formatDateLabel = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Remove time component for comparison
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (dateOnly.getTime() === todayOnly.getTime()) {
            return 'Today';
        } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
            return 'Yesterday';
        } else {
            // Format as "Thursday, Jan 8"
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDeleteLog = async (logId: number) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        try {
            await foodService.deleteLog(logId);
            await loadFoodData(); // Refresh data
        } catch (error) {
            console.error('Failed to delete meal:', error);
            alert('Failed to delete meal');
        }
    };

    const progress = goalCalories > 0 ? (stats.todayCalories / goalCalories) * 100 : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container px-4 md:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calorie"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container px-4 md:px-8 py-8 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="animate-fade-in">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Food</h1>
                        <p className="text-muted-foreground mt-1">Log your meals and monitor nutrition</p>
                    </div>
                    <button
                        className="gap-2 animate-fade-in px-4 py-2 bg-calorie text-white rounded-lg hover:bg-calorie/90 transition-colors font-medium flex items-center justify-center"
                        style={{ animationDelay: "100ms" }}
                        onClick={() => navigate("/food/add")}
                    >
                        <Plus className="w-4 h-4" />
                        Log Meal
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calorie Summary Card */}
                    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in h-fit" style={{ animationDelay: "150ms" }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-calorie-light text-calorie">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">Today's Summary</h3>
                        </div>

                        <div className="flex justify-center">
                            <ProgressRing
                                progress={progress}
                                size={180}
                                strokeWidth={14}
                                colorClass="stroke-calorie"
                                bgColorClass="stroke-calorie-light"
                                gradientId="food-calorie-gradient"
                                gradientColors={{ from: "#ef4444", to: "#fbbf24" }}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-foreground">
                                        {stats.todayCalories}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        of {goalCalories} kcal
                                    </span>
                                </div>
                            </ProgressRing>
                        </div>

                        {/* Macros Breakdown */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.todayCarbs}g</p>
                                <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.todayProtein}g</p>
                                <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.todayFats}g</p>
                                <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Meals - Scrollable, Grouped by Day */}
                    <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
                        <h3 className="font-semibold text-foreground mb-4">Recent Meals</h3>

                        {groupedMeals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Utensils className="w-12 h-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No meals logged yet</p>
                                <button
                                    onClick={() => navigate("/food/add")}
                                    className="mt-4 px-4 py-2 bg-calorie text-white rounded-lg hover:bg-calorie/90 transition-colors text-sm"
                                >
                                    Log Your First Meal
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {groupedMeals.map((group, groupIndex) => (
                                    <div key={group.date} className="animate-fade-in" style={{ animationDelay: `${250 + groupIndex * 50}ms` }}>
                                        {/* Date Divider */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                {group.displayDate}
                                            </span>
                                            <div className="flex-1 h-px bg-border"></div>
                                        </div>

                                        {/* Meals for this day */}
                                        <div className="space-y-2 ml-7">
                                            {group.logs.map((meal) => (
                                                <div
                                                    key={meal.id}
                                                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="p-2.5 rounded-xl bg-calorie-light text-calorie">
                                                            <Utensils className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-foreground">
                                                                {meal.foodName}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatTime(meal.timestamp)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {meal.grams}g
                                                                </span>
                                                                {meal.source === 'PERSONAL' && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                        Custom
                                                                    </span>
                                                                )}
                                                                {meal.source === 'EXTERNAL' && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                        USDA
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="font-semibold text-foreground">{Math.round(meal.calories)}</p>
                                                            <p className="text-xs text-muted-foreground">kcal</p>
                                                        </div>

                                                        <button
                                                            onClick={() => handleDeleteLog(meal.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                                                            title="Delete meal"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: hsl(var(--muted));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--calorie));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--calorie) / 0.8);
                }
            `}</style>
        </div>
    );
};

export default Food;
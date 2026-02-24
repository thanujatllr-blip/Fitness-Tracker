// src/pages/ExercisePage.tsx
import { Navbar } from "../components/layout/Navbar";
import { Dumbbell, Plus, Flame, Timer, Calendar, Trash2 } from "lucide-react";
import { ProgressRing } from "../components/dashboard/ProgressRing";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import exerciseService, { type ExerciseLog, type ExerciseStats } from "../services/exercise.service";
import api from "../services/api";

interface GroupedWorkouts {
    date: string;
    displayDate: string;
    logs: ExerciseLog[];
}

interface GoalsResponse {
    targetWeightKg: number;
    dailyCalorieGoal: number;
    weeklyExerciseGoalMinutes: number;
    goalCreatedDate: string;
}

const Exercise = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState<ExerciseStats>({
        todayMinutes: 0,
        todayCalories: 0,
        todayWorkouts: 0,
        weeklyMinutes: 0,
        weeklyCalories: 0,
        weeklyWorkouts: 0,
    });
    const [goalMinutes, setGoalMinutes] = useState(60); // Default goal
    const [isLoading, setIsLoading] = useState(true);
    const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts[]>([]);

    //const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    //const [logToDelete, setLogToDelete] = useState<ExerciseLog | null>(null);

    useEffect(() => {
        loadExerciseData();
    }, []);

    const loadExerciseData = async () => {
        try {
            setIsLoading(true);

            // Fetch last 7 days of logs
            const logs = await exerciseService.getLast7DaysLogs();

            // Calculate stats
            const calculatedStats = exerciseService.calculateStats(logs);
            setStats(calculatedStats);

            // Group logs by date
            const grouped = groupWorkoutsByDay(logs);
            setGroupedWorkouts(grouped);

            // Fetch user's weekly exercise goal from /api/goals
            try {
                const goalsResponse = await api.get<GoalsResponse>('/goals');
                if (goalsResponse.data.weeklyExerciseGoalMinutes) {
                    // Convert weekly goal to daily goal (divide by 7)
                    setGoalMinutes(Math.round(goalsResponse.data.weeklyExerciseGoalMinutes / 7));
                }
            } catch (goalError) {
                // If no goals set yet, use default 60 minutes
                console.log('No goals set yet, using default');
            }

        } catch (error) {
            console.error('Failed to load exercise data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupWorkoutsByDay = (logs: ExerciseLog[]): GroupedWorkouts[] => {
        const grouped = exerciseService.groupLogsByDate(logs);
        const result: GroupedWorkouts[] = [];

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

    const handleDeleteLog = async (logId: number) => {
        if (!confirm('Are you sure you want to delete this workout?')) return;

        try {
            await exerciseService.deleteLog(logId);
            await loadExerciseData(); // Refresh data
        } catch (error) {
            console.error('Failed to delete workout:', error);
            alert('Failed to delete workout');
        }
    };

    const progress = goalMinutes > 0 ? (stats.todayMinutes / goalMinutes) * 100 : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container px-4 md:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-exercise"></div>
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
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Exercise</h1>
                        <p className="text-muted-foreground mt-1">Track your workouts and stay active</p>
                    </div>
                    <button
                        className="gap-2 animate-fade-in px-4 py-2 bg-exercise text-white rounded-lg hover:bg-exercise/90 transition-colors font-medium flex items-center justify-center"
                        style={{ animationDelay: "100ms" }}
                        onClick={() => navigate("/exercise/log")}
                    >
                        <Plus className="w-4 h-4" />
                        Log Workout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Progress Card */}
                    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in h-fit" style={{ animationDelay: "150ms" }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-exercise-light text-exercise">
                                <Dumbbell className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground">Today's Progress</h3>
                        </div>

                        <div className="flex justify-center">
                            <ProgressRing
                                progress={progress}
                                size={180}
                                strokeWidth={14}
                                colorClass="stroke-exercise"
                                bgColorClass="stroke-exercise-light"
                                gradientId="exercise-page-gradient"
                                gradientColors={{ from: "#AD2BEEFF", to: "#EC13ECFF" }}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-foreground">
                                        {Math.round(stats.todayMinutes)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        of {goalMinutes} min
                                    </span>
                                </div>
                            </ProgressRing>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                <Flame className="w-5 h-5 text-calorie" />
                                <div>
                                    <p className="text-lg font-bold text-foreground">
                                        {Math.round(stats.todayCalories)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Calories</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                <Dumbbell className="w-5 h-5 text-exercise" />
                                <div>
                                    <p className="text-lg font-bold text-foreground">
                                        {stats.todayWorkouts}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Workouts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Workouts - Scrollable, Grouped by Day */}
                    <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
                        <h3 className="font-semibold text-foreground mb-4">Recent Workouts</h3>

                        {groupedWorkouts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Dumbbell className="w-12 h-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No workouts logged yet</p>
                                <button
                                    onClick={() => navigate("/exercise/log")}
                                    className="mt-4 px-4 py-2 bg-exercise text-white rounded-lg hover:bg-exercise/90 transition-colors text-sm"
                                >
                                    Log Your First Workout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {groupedWorkouts.map((group, groupIndex) => (
                                    <div key={group.date} className="animate-fade-in" style={{ animationDelay: `${250 + groupIndex * 50}ms` }}>
                                        {/* Date Divider */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                {group.displayDate}
                                            </span>
                                            <div className="flex-1 h-px bg-border"></div>
                                        </div>

                                        {/* Workouts for this day */}
                                        <div className="space-y-2 ml-7">
                                            {group.logs.map((workout) => (
                                                <div
                                                    key={workout.id}
                                                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="p-2.5 rounded-xl bg-exercise-light text-exercise">
                                                            <Dumbbell className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-foreground">
                                                                {workout.exerciseName}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                    <Timer className="w-3.5 h-3.5" />
                                                                    <span className="text-xs">
                                                                        {Math.round(workout.durationMinutes)} min
                                                                    </span>
                                                                </div>

                                                                {workout.sets > 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {workout.sets} × {workout.reps}
                                                                        {workout.weightUsed > 0 && ` @ ${workout.weightUsed}kg`}
                                                                    </span>
                                                                )}
                                                                {workout.source === 'PERSONAL' && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                        Custom
                                                                    </span>
                                                                )}
                                                                {workout.source === 'EXTERNAL' && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                        Wger
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right side actions and info */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="w-4 h-4 text-calorie" />
                                                            <div className="flex flex-col items-end justify-center">
                                                                <span className="text-lg font-bold text-foreground leading-none">
                                                                    {Math.round(workout.caloriesBurnt)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    kcal
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleDeleteLog(workout.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                                                            title="Delete workout"
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
                    background: hsl(var(--exercise));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--exercise) / 0.8);
                }
            `}</style>
        </div>
    );
};

export default Exercise;
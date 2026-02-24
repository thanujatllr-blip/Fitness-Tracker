import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    Utensils,
    Target,
    Trophy,
    TrendingUp,
    Zap,
    Drumstick,
    Timer,
    Loader2 // Added a small loader icon for the transition
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import calendarService, { type CalendarDayData, type CalendarMonthData, type StreakData } from "@/services/calendar.service";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthData, setMonthData] = useState<CalendarMonthData | null>(null);
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCalendarData();
    }, [currentMonth]);

    const loadCalendarData = async () => {
        setIsLoading(true);
        try {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;

            const [monthResponse, streaksResponse] = await Promise.all([
                calendarService.getMonthData(year, month),
                calendarService.getStreaks()
            ]);

            setMonthData(monthResponse);
            setStreakData(streaksResponse);
        } catch (error) {
            console.error('Failed to load calendar data:', error);
            toast.error("Failed to load calendar data");
        } finally {
            setIsLoading(false);
        }
    };

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    const monthStats = useMemo(() => {
        if (!monthData) {
            return {
                workoutDays: 0,
                calorieGoalMetDays: 0,
                exerciseGoalMetDays: 0,
                totalCalories: 0,
                totalExerciseMinutes: 0,
                daysWithData: 0,
                daysInMonth: 0,
            };
        }

        const daysInMonth = eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
        }).length;

        return {
            ...monthData.stats,
            daysInMonth
        };
    }, [monthData, currentMonth]);

    const getActivityForDate = (date: Date): CalendarDayData | undefined => {
        if (!monthData) return undefined;
        const dateKey = format(date, "yyyy-MM-dd");
        return monthData.days[dateKey];
    };

    const isInCurrentStreak = (date: Date): boolean => {
        if (!streakData) return false;
        const dateKey = format(date, "yyyy-MM-dd");
        return streakData.currentStreak.dates.includes(dateKey);
    };

    const isInLongestStreak = (date: Date): boolean => {
        if (!streakData) return false;
        const dateKey = format(date, "yyyy-MM-dd");
        return streakData.longestStreak.dates.includes(dateKey);
    };

    const selectedDateData = selectedDate ? getActivityForDate(selectedDate) : null;

    //Only show full page spinner on INITIAL load (when no data exists yet)
    if (isLoading && !monthData) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <main className="container px-4 md:px-8 py-8">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </main>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container px-4 md:px-8 py-8 pb-24 md:pb-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8 animate-fade-in">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Activity Calendar</h1>
                            <p className="text-muted-foreground mt-1">Track your monthly fitness journey</p>
                        </div>
                    </div>

                    {/* Streak Cards */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                        <div
                            className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg animate-fade-in"
                            style={{ animationDelay: "50ms" }}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-white" />
                                    <span className="text-sm font-medium text-white/90">Current Streak</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-bold text-white">{streakData?.currentStreak.days || 0}</span>
                                    <span className="text-lg text-white/80">days</span>
                                </div>
                                {streakData && streakData.currentStreak.days > 0 && (
                                    <p className="text-xs text-white/70 mt-2">🔥 Keep it going!</p>
                                )}
                            </div>
                        </div>
                        <div
                            className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg animate-fade-in"
                            style={{ animationDelay: "100ms" }}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5 text-white" />
                                    <span className="text-sm font-medium text-white/90">Longest Streak</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-bold text-white">{streakData?.longestStreak.days || 0}</span>
                                    <span className="text-lg text-white/80">days</span>
                                </div>
                                {streakData && streakData.currentStreak.days === streakData.longestStreak.days && streakData.currentStreak.days > 0 && (
                                    <p className="text-xs text-white/70 mt-2">🏆 Personal best!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                        <StatCard
                            icon={Dumbbell}
                            label="Workout Days"
                            value={monthStats.workoutDays}
                            total={monthStats.daysInMonth}
                            color="exercise"
                            delay={150}
                        />
                        <StatCard
                            icon={Target}
                            label="Calorie Goals Met"
                            value={monthStats.calorieGoalMetDays}
                            total={monthStats.daysWithData}
                            color="calorie"
                            delay={200}
                            tooltip="Goals evaluated based on current weight target"
                        />
                        <StatCard
                            icon={Trophy}
                            label="Exercise Goals Met"
                            value={monthStats.exerciseGoalMetDays}
                            total={monthStats.daysWithData}
                            color="primary"
                            delay={250}
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Total Exercise"
                            value={monthStats.totalExerciseMinutes}
                            suffix="min"
                            color="weight"
                            delay={300}
                        />
                    </div>

                    {/* Calendar */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: "300ms" }}>
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                disabled={isLoading} // Disable while loading
                                className="rounded-full hover:bg-secondary"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                    {format(currentMonth, "MMMM yyyy")}
                                </h2>
                                {/* Small Loading Indicator next to title */}
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                disabled={isLoading} // Disable while loading
                                className="rounded-full hover:bg-secondary"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 border-b border-border/50">
                            {WEEKDAYS.map((day) => (
                                <div
                                    key={day}
                                    className="py-3 text-center text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid - Added transition wrapper */}
                        <div className={cn(
                            "grid grid-cols-7 transition-opacity duration-200",
                            isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
                        )}>
                            {calendarDays.map((day, index) => {
                                const activity = getActivityForDate(day);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isCurrentDay = isToday(day);
                                const inCurrentStreak = isInCurrentStreak(day);
                                const inLongestStreak = isInLongestStreak(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "relative min-h-[80px] md:min-h-[100px] p-2 border-r border-b border-border/30 transition-all duration-200",
                                            "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset",
                                            !isCurrentMonth && "bg-muted/30",
                                            isCurrentDay && "bg-primary/5",
                                            inCurrentStreak && isCurrentMonth && "bg-gradient-to-br from-orange-500/10 to-amber-500/10",
                                            inLongestStreak && !inCurrentStreak && isCurrentMonth && "bg-gradient-to-br from-violet-500/10 to-purple-500/10"
                                        )}
                                        // Removed animation delay for updates to prevent staggering effect on every month switch
                                        style={{ animationDelay: isLoading ? '0ms' : `${index * 10}ms` }}
                                    >
                                        {/* Streak indicator bar */}
                                        {isCurrentMonth && (inCurrentStreak || inLongestStreak) && (
                                            <div className={cn(
                                                "absolute top-0 left-0 right-0 h-1",
                                                inCurrentStreak ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-violet-500 to-purple-500"
                                            )} />
                                        )}

                                        <span
                                            className={cn(
                                                "flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-sm font-medium transition-colors",
                                                !isCurrentMonth && "text-muted-foreground/50",
                                                isCurrentMonth && "text-foreground",
                                                isCurrentDay && "bg-weight text-primary-foreground font-bold",
                                                inCurrentStreak && isCurrentMonth && !isCurrentDay && "ring-2 ring-orange-500/50",
                                                inLongestStreak && !inCurrentStreak && isCurrentMonth && !isCurrentDay && "ring-2 ring-violet-500/50"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </span>

                                        {/* Streak fire icon */}
                                        {inCurrentStreak && isCurrentMonth && (
                                            <div className="absolute top-1 right-1">
                                                <Zap className="w-3 h-3 text-orange-500" />
                                            </div>
                                        )}

                                        {/* Activity Indicators */}
                                        {activity && isCurrentMonth && (
                                            <div className="mt-1 flex flex-wrap gap-1 justify-center">
                                                {activity.workout && (
                                                    <span title="Workout completed"><Dumbbell className="w-3 h-3 md:w-4 md:h-4 text-exercise animate-pulse-glow" /></span>
                                                )}
                                                {activity.calories > 0 && activity.calories <= activity.calorieGoal && (
                                                    <span title="Calorie goal met"><Drumstick className="w-3 h-3 md:w-4 md:h-4 text-calorie animate-pulse-glow"/></span>
                                                )}
                                                {activity.exerciseMinutes >= activity.exerciseGoal && (
                                                    <span title="Exercise goal met"><Timer className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse-glow"/></span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 p-4 border-t border-border/50 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="w-4 h-4 text-exercise" />
                                <span className="text-xs md:text-sm text-muted-foreground">Workout</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Drumstick className="w-4 h-4 text-calorie" />
                                <span className="text-xs md:text-sm text-muted-foreground">Calorie Goal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-primary" />
                                <span className="text-xs md:text-sm text-muted-foreground">Exercise Goal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                                <span className="text-xs md:text-sm text-muted-foreground">Current Streak</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                                <span className="text-xs md:text-sm text-muted-foreground">Longest Streak</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Day Detail Modal */}
                <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedDateData ? (
                            <div className="space-y-6">
                                {/* Nutrition Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-calorie-light">
                                            <Utensils className="w-4 h-4 text-calorie" />
                                        </div>
                                        <span className="font-semibold text-foreground">Nutrition</span>
                                    </div>
                                    <div className="bg-secondary/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Calories</span>
                                            <span className="
                                                font-bold
                                                text-foreground"
                                            >
                                                {selectedDateData.calories} / {selectedDateData.calorieGoal} kcal
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="
                                                    h-full rounded-full transition-all duration-500
                                                    bg-calorie"

                                                style={{ width: `${Math.min((selectedDateData.calories / selectedDateData.calorieGoal) * 100, 100)}%` }}
                                            />
                                        </div>
                                        {selectedDateData.meals.length > 0 ? (
                                            <div className="mt-3 space-y-1">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Meals</span>
                                                <ul className="space-y-1">
                                                    {selectedDateData.meals.map((meal, i) => (
                                                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                                                            <Utensils className="w-3 h-3 text-calorie" />
                                                            {meal}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-muted-foreground italic">No meals logged</p>
                                        )}
                                    </div>
                                </div>

                                {/* Exercise Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-exercise-light">
                                            <Dumbbell className="w-4 h-4 text-exercise" />
                                        </div>
                                        <span className="font-semibold text-foreground">Exercise</span>
                                    </div>
                                    <div className="bg-secondary/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Duration</span>
                                            <span className={cn(
                                                "font-bold",
                                                selectedDateData.exerciseMinutes >= selectedDateData.exerciseGoal ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {selectedDateData.exerciseMinutes} / {selectedDateData.exerciseGoal} min
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-exercise rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((selectedDateData.exerciseMinutes / selectedDateData.exerciseGoal) * 100, 100)}%` }}
                                            />
                                        </div>
                                        {selectedDateData.exercises.length > 0 ? (
                                            <div className="mt-3 space-y-1">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Workouts</span>
                                                <ul className="space-y-1">
                                                    {selectedDateData.exercises.map((exercise, i) => (
                                                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                                                            <Dumbbell className="w-3 h-3 text-exercise" />
                                                            {exercise}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-muted-foreground italic">No workouts logged</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">No activity recorded for this day</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PageTransition>
    );
};

// Stats Card Component (Unchanged)
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    total?: number;
    suffix?: string;
    color: "primary" | "calorie" | "exercise" | "weight";
    delay: number;
    tooltip?: string;
}

function StatCard({ icon: Icon, label, value, total, suffix, color, delay, tooltip }: StatCardProps) {
    const colorClasses = {
        primary: "text-primary bg-primary/10",
        calorie: "text-calorie bg-calorie-light",
        exercise: "text-exercise bg-exercise-light",
        weight: "text-weight bg-weight-light",
    };

    return (
        <div
            className="bg-card rounded-xl md:rounded-2xl border border-border/50 p-3 md:p-4 shadow-sm animate-fade-in relative group"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={cn("p-2 rounded-lg w-fit", colorClasses[color])}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="mt-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-bold text-foreground">{value}</span>
                    {total !== undefined && (
                        <span className="text-sm text-muted-foreground">/ {total}</span>
                    )}
                    {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover"></div>
                </div>
            )}
        </div>
    );
}

export default Calendar;
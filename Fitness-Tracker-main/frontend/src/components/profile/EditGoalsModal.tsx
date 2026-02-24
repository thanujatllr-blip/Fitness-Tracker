// src/components/profile/EditGoalsModal.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import profileService, { type Goals } from "../../services/profile.service";

interface EditGoalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentGoals: Goals | null;
}

export const EditGoalsModal = ({
                                   isOpen,
                                   onClose,
                                   onSuccess,
                                   currentGoals,
                               }: EditGoalsModalProps) => {
    const [targetWeight, setTargetWeight] = useState("");
    const [dailyCalories, setDailyCalories] = useState("");
    const [weeklyExercise, setWeeklyExercise] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (currentGoals) {
            setTargetWeight(currentGoals.targetWeightKg?.toString() || "");
            setDailyCalories(currentGoals.dailyCalorieGoal?.toString() || "");
            setWeeklyExercise(currentGoals.weeklyExerciseGoalMinutes?.toString() || "");
        }
    }, [currentGoals]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await profileService.updateGoals({
                targetWeightKg: parseFloat(targetWeight),
                dailyCalorieGoal: parseFloat(dailyCalories),
                weeklyExerciseGoalMinutes: parseInt(weeklyExercise),
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update goals");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border border-border animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Edit Goals</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Target Weight */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="75.0"
                            required
                        />
                    </div>

                    {/* Daily Calorie Goal */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Daily Calorie Goal (kcal)
                        </label>
                        <input
                            type="number"
                            step="50"
                            value={dailyCalories}
                            onChange={(e) => setDailyCalories(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="2000"
                            required
                        />
                    </div>

                    {/* Weekly Exercise Goal */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Weekly Exercise Goal (minutes)
                        </label>
                        <input
                            type="number"
                            step="5"
                            value={weeklyExercise}
                            onChange={(e) => setWeeklyExercise(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="210"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Daily average: {weeklyExercise ? Math.round(parseInt(weeklyExercise) / 7) : 0} min
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Goals"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
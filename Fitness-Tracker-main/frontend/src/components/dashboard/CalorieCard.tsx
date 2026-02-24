// src/components/dashboard/CalorieCard.tsx
import { Utensils } from "lucide-react";
import { StatCard } from "./StatCard";
import { ProgressRing } from "./ProgressRing";

interface CalorieCardProps {
    consumed: number;
    goal: number;
}

export default function CalorieCard({ consumed, goal }: CalorieCardProps) {
    const progress = Math.min((consumed / goal) * 100, 100);

    return (
        <StatCard
            title="Daily Calorie Intake"
            icon={Utensils}
            iconColorClass="text-calorie bg-calorie-light"
            className="h-full"
        >
            <div className="flex flex-col items-center justify-center py-4 md:py-6">
                <ProgressRing
                    progress={progress}
                    size={200}
                    strokeWidth={14}
                    colorClass="stroke-calorie"
                    bgColorClass="stroke-calorie-light"
                    gradientId="gradient-calorie"
                    gradientColors={{ from: "#ef4444", to: "#fbbf24" }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-bold text-foreground">
                            {Math.round(progress)}%
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground mt-1">of daily goal</span>
                    </div>
                </ProgressRing>
                <span className="text-xs md:text-sm font-medium text-calorie mt-4">
          {consumed.toLocaleString()} / {goal.toLocaleString()} kcal
        </span>
            </div>
        </StatCard>
    );
}
// src/components/dashboard/ExerciseCard.tsx
import { Dumbbell } from "lucide-react";
import { StatCard } from "./StatCard";
import { ProgressRing } from "./ProgressRing";

interface ExerciseCardProps {
    minutes: number;
    goal: number;
}

export default function ExerciseCard({ minutes, goal }: ExerciseCardProps) {
    const progress = Math.min((minutes / goal) * 100, 100);

    return (
        <StatCard
            title="Daily Exercise Progress"
            icon={Dumbbell}
            iconColorClass="text-exercise bg-exercise-light"
            className="h-full"
        >
            <div className="flex flex-col items-center justify-center py-4 md:py-6">
                <ProgressRing
                    progress={progress}
                    size={200}
                    strokeWidth={14}
                    colorClass="stroke-exercise"
                    bgColorClass="stroke-exercise-light"
                    gradientId="exercise-gradient"
                    //gradientColors={{ from: "#AD2BEEFF", to: "#EC13ECFF" }}
                    gradientColors={{ from: "#8b5cf6", to: "#d946ef" }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-bold text-foreground">
                            {Math.round(progress)}%
            </span>
                        <span className="text-xs md:text-sm text-muted-foreground mt-1">of daily goal</span>
                    </div>
                </ProgressRing>
                <span className="text-xs md:text-sm font-medium text-exercise mt-3">
          {minutes} / {goal} min
        </span>
            </div>
        </StatCard>
    );
}
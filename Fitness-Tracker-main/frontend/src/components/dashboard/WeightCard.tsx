// src/components/dashboard/WeightCard.tsx
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { useState, useEffect, useRef } from "react";
import dashboardService from "../../services/dashboard.service";
import { cn } from "../../lib/utils";

interface WeightCardProps {
    weight: number | null;
    weightChange?: number | null;
    lastUpdated?: string;
    compact?: boolean;
    onUpdate?: () => void;
}

export function WeightCard({
                               weight,
                               weightChange,
                               lastUpdated,
                               compact = false,
                               onUpdate,
                           }: WeightCardProps) {
    const [isSimulating, setIsSimulating] = useState(false);
    const [displayWeight, setDisplayWeight] = useState<number>(weight || 0);
    const [targetWeight, setTargetWeight] = useState<number | null>(null);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);

    const fluctuationRef = useRef<number | null>(null);
    const convergenceRef = useRef<number | null>(null);

    // Fetch user's weight goal to determine direction
    useEffect(() => {
        loadWeightGoal();
    }, []);

    // Sync local state when prop updates (only if not currently animating)
    useEffect(() => {
        if (!isSimulating && weight !== null) {
            setDisplayWeight(weight);
            setCurrentWeight(weight);
        }
    }, [weight, isSimulating]);

    const loadWeightGoal = async () => {
        try {
            // Fetch user goals to get target weight
            const response = await dashboardService.getUserGoals();
            if (response && response.targetWeightKg) {
                setTargetWeight(response.targetWeightKg);
            }
        } catch (error) {
            console.error('Failed to load weight goal:', error);
        }
    };

    const hasWeightChange = weightChange !== undefined && weightChange !== null && Math.abs(weightChange) >= 0.1;
    const isWeightGain = (weightChange || 0) > 0;

    // Determine if weight change is positive based on user's goal
    const isWeightGoalDefined = targetWeight !== null && currentWeight !== null;
    const wantsToGainWeight = isWeightGoalDefined && targetWeight > currentWeight;
    const wantsToLoseWeight = isWeightGoalDefined && targetWeight < currentWeight;

    // Weight change is "good" if:
    // - User wants to gain weight AND weight increased, OR
    // - User wants to lose weight AND weight decreased
    const isGoodWeightChange =
        (wantsToGainWeight && isWeightGain) ||
        (wantsToLoseWeight && !isWeightGain);

    // If no goal is set, default to weight loss (weight decrease is good)
    //const isBadWeightChange = isWeightGoalDefined
    //    ? !isGoodWeightChange
    //    : isWeightGain; // Default: weight gain is bad

    const handleSimulate = async () => {
        if (isSimulating) return;
        setIsSimulating(true);

        // 1. Start Fluctuation Phase
        fluctuationRef.current = window.setInterval(() => {
            setDisplayWeight((prev) => {
                const change = (Math.random() - 0.5) * 0.8;
                return Math.max(0, Math.round((prev + change) * 10) / 10);
            });
        }, 100);

        try {
            // 2. Fetch new data from API
            const newReading = await dashboardService.simulateSmartScale();

            // 3. Minimum Wait Phase (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 4. Convergence Phase
            if (fluctuationRef.current !== null) {
                window.clearInterval(fluctuationRef.current);
                fluctuationRef.current = null;
            }

            const targetWeight = typeof newReading.weightKg === 'number'
                ? newReading.weightKg
                : parseFloat(String(newReading.weightKg)) || displayWeight;

            const startConvergenceWeight = displayWeight;
            let steps = 10;
            let currentStep = 0;

            convergenceRef.current = window.setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                const currentValue = startConvergenceWeight + (targetWeight - startConvergenceWeight) * progress;
                setDisplayWeight(Math.round(currentValue * 10) / 10);

                if (currentStep >= steps) {
                    if (convergenceRef.current !== null) {
                        window.clearInterval(convergenceRef.current);
                        convergenceRef.current = null;
                    }

                    setDisplayWeight(targetWeight);
                    setCurrentWeight(targetWeight);
                    setIsSimulating(false);

                    if (onUpdate) onUpdate();
                }
            }, 50);

        } catch (error) {
            console.error('Failed to simulate scale:', error);
            if (fluctuationRef.current !== null) {
                window.clearInterval(fluctuationRef.current);
                fluctuationRef.current = null;
            }
            setIsSimulating(false);
            if (weight) setDisplayWeight(weight);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (fluctuationRef.current !== null) window.clearInterval(fluctuationRef.current);
            if (convergenceRef.current !== null) window.clearInterval(convergenceRef.current);
        };
    }, []);

    return (
        <StatCard
            title="Smart Scale"
            icon={Scale}
            iconColorClass="text-weight bg-weight-light"
            className="h-full"
        >
            <div className={cn("flex flex-col items-center justify-center", compact ? "py-3" : "py-4 md:py-6")}>
                <div className="relative">
                    <span className={cn("font-bold text-foreground", compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl")}>
                        {weight === null && !isSimulating && displayWeight === 0
                            ? '--'
                            : displayWeight.toFixed(1)}
                    </span>
                    {isSimulating && (
                        <span className="absolute -right-4 top-0 w-2 h-2 bg-primary rounded-full animate-ping" />
                    )}
                </div>
                <span className="text-base text-muted-foreground mt-1">kg</span>

                {/* Weight Trend Indicator - Goal Aware */}
                {hasWeightChange && (
                    <div className="flex items-center gap-2 mt-3">
                        {isWeightGain ? (
                            <TrendingUp className={cn("w-4 h-4", isGoodWeightChange ? "text-primary" : "text-destructive")} />
                        ) : (
                            <TrendingDown className={cn("w-4 h-4", isGoodWeightChange ? "text-primary" : "text-destructive")} />
                        )}
                        <span className={cn("text-sm font-medium", isGoodWeightChange ? "text-primary" : "text-destructive")}>
                            {isWeightGain ? "+" : ""}{weightChange!.toFixed(1)} kg
                        </span>
                    </div>
                )}

                {lastUpdated && (
                    <span className="text-xs md:text-sm text-muted-foreground mt-2">
                        Last updated: {lastUpdated}
                    </span>
                )}
            </div>

            <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full mt-4 px-4 py-2 bg-weight text-white rounded-lg hover:bg-weight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
            >
                {isSimulating ? "Measuring..." : "Start Simulation"}
            </button>
        </StatCard>
    );
}
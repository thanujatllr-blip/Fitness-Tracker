// src/components/dashboard/ProgressRing.tsx
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    colorClass?: string;
    bgColorClass?: string;
    gradientId?: string;
    gradientColors?: { from: string; to: string };
    children?: React.ReactNode;
    className?: string;
}

export function ProgressRing({
                                 progress,
                                 size = 200,
                                 strokeWidth = 14,
                                 colorClass = "stroke-primary",
                                 bgColorClass = "stroke-muted",
                                 gradientId,
                                 gradientColors,
                                 children,
                                 className,
                             }: ProgressRingProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const gap = 12; // Gap between inner bg circle and outer progress circle
    const innerRadius = (size - strokeWidth * 2 - gap * 2) / 2;
    const outerRadius = (size - strokeWidth) / 2;
    const circumference = outerRadius * 2 * Math.PI;
    //const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
    const offset = circumference - (Math.min(animatedProgress, 100) / 100) * circumference;

    useEffect(() => {
        // Small delay to ensure the initial render happens with 0, then animate to target
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 50);
        return () => clearTimeout(timer);
    }, [progress]);

    const useGradient = gradientId && gradientColors;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                className="progress-ring"
                width={size}
                height={size}
            >
                {/* Gradient definitions */}
                {useGradient && (
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientColors.from} />
                            <stop offset="100%" stopColor={gradientColors.to} />
                        </linearGradient>
                    </defs>
                )}

                {/* Inner background circle */}
                <circle
                    className={bgColorClass}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={innerRadius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Outer progress circle */}
                <circle
                    className={cn(!useGradient && colorClass, "animate-progress")}
                    stroke={useGradient ? `url(#${gradientId})` : undefined}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={outerRadius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        //filter: animatedProgress >= 100 ? "drop-shadow(0 0 8px currentColor)" : undefined,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
// src/components/dashboard/WeeklyExerciseChart.tsx
import { Dumbbell } from "lucide-react";
import { StatCard } from "./StatCard";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WeeklyExerciseChartProps {
    data: { day: string; minutes: number }[];
}

export function WeeklyExerciseChart({ data }: WeeklyExerciseChartProps) {
    return (
        <StatCard
            title="Weekly Exercise Progress"
            icon={Dumbbell}
            iconColorClass="text-exercise bg-exercise-light"
            className="w-full"
        >
            <div className="h-[260px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            className="text-xs fill-muted-foreground"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            className="text-xs fill-muted-foreground"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "0.75rem",
                                boxShadow: "var(--shadow-md)",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="minutes"
                            stroke="hsl(var(--exercise))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--exercise))", strokeWidth: 0, r: 5 }}
                            activeDot={{ r: 7, fill: "hsl(var(--exercise))" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </StatCard>
    );
}
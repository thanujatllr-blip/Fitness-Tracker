// src/components/dashboard/WeeklyCalorieChart.tsx
import { Utensils } from "lucide-react";
import { StatCard } from "./StatCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WeeklyCalorieChartProps {
    data: { day: string; calories: number }[];
}

export function WeeklyCalorieChart({ data }: WeeklyCalorieChartProps) {
    return (
        <StatCard
            title="Weekly Calorie Intake"
            icon={Utensils}
            iconColorClass="text-calorie bg-calorie-light"
            className="flex-1"
        >
            <div className="h-[220px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                            cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                        />
                        <Bar
                            dataKey="calories"
                            fill="hsl(var(--calorie))"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </StatCard>
    );
}
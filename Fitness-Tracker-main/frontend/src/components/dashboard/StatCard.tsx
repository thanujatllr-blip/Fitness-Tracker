// src/components/dashboard/StatCard.tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    icon: LucideIcon;
    iconColorClass?: string;
    children: React.ReactNode;
    className?: string;
}

export function StatCard({
                             title,
                             icon: Icon,
                             iconColorClass = "text-primary",
                             children,
                             className = "",
                         }: StatCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-card p-4 md:p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:border-border",
                className
            )}
        >
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl bg-secondary", iconColorClass)}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5"/>
                </div>
                <h3 className="font-semibold text-sm md:text-base text-foreground">{title}</h3>
            </div>
            {children}
        </div>
    );
}
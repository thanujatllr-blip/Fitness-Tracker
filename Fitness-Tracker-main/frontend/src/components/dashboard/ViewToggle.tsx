// src/components/dashboard/ViewToggle.tsx
import { motion } from "framer-motion";

interface ViewToggleProps {
    view: "daily" | "weekly";
    onToggle: (view: "daily" | "weekly") => void;
}

export function ViewToggle({ view, onToggle }: ViewToggleProps) {
    return (
        <div className="relative flex items-center p-1 bg-secondary rounded-full w-fit">
            {/* Sliding background indicator */}
            <motion.div
                className="absolute top-1 bottom-1 bg-primary rounded-full shadow-sm"
                initial={false}
                animate={{
                    x: view === "daily" ? 0 : "100%",
                    width: "50%",
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                }}
                style={{left: 4, right: 4}}
            />

            <button
                onClick={() => onToggle("daily")}
                className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    view === "daily"
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Daily
            </button>
            <button
                onClick={() => onToggle("weekly")}
                className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    view === "weekly"
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Weekly
            </button>
        </div>
    );
}
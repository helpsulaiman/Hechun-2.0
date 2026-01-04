
"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

interface ScrollingBannerProps {
    text: string;
    className?: string;
    speed?: number;
}

export function ScrollingBanner({
    text = "WORK IN PROGRESS",
    className,
    speed = 150
}: ScrollingBannerProps) {
    return (
        <div className={cn("w-full overflow-hidden whitespace-nowrap bg-yellow-400 text-black py-2 absolute top-0 left-0 z-0", className)}>
            <motion.div
                className="inline-block"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
            >
                {/* Repeat text multiple times to ensure continuous flow */}
                {[...Array(20)].map((_, i) => (
                    <span key={i} className="mr-6 font-bold uppercase tracking-wider inline-flex items-center gap-6">
                        {text} <AlertTriangle className="w-4 h-4 fill-black" />
                    </span>
                ))}
            </motion.div>
            {/* Duplicate for seamless loop (optional if repeat logic above covers screen, but standard practice) */}
            <motion.div
                className="inline-block"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
            >
                {[...Array(20)].map((_, i) => (
                    <span key={i} className="mr-6 font-bold uppercase tracking-wider inline-flex items-center gap-6">
                        {text} <AlertTriangle className="w-4 h-4 fill-black" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

export default ScrollingBanner;

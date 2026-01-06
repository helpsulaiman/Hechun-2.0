"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "../../lib/utils"

interface MiniChartProps {
    data: { label: string, value: number }[];
    title?: string;
    description?: string;
    unit?: string;
    colorClass?: string;
}

export function MiniChart({
    data,
    title = "Activity",
    description = "Last 7 Days",
    unit = "lessons",
    colorClass = "bg-primary"
}: MiniChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [displayValue, setDisplayValue] = useState<number | null>(null)
    const [isHovering, setIsHovering] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Guard against empty data
    const safeData = data.length > 0 ? data : [{ label: '-', value: 0 }];
    const maxValue = Math.max(...safeData.map((d) => d.value)) || 10;

    useEffect(() => {
        if (hoveredIndex !== null) {
            setDisplayValue(safeData[hoveredIndex].value)
        }
    }, [hoveredIndex, safeData])

    const handleContainerEnter = () => setIsHovering(true)
    const handleContainerLeave = () => {
        setIsHovering(false)
        setHoveredIndex(null)
        setTimeout(() => {
            setDisplayValue(null)
        }, 150)
    }

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            className="group relative w-full h-full p-6 rounded-3xl bg-card border border-border transition-all duration-500 hover:shadow-lg hover:border-foreground/20 flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", colorClass)} />
                    <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{title}</span>
                </div>
                <div className="relative h-7 flex items-center">
                    <span
                        className={cn(
                            "text-lg font-semibold tabular-nums transition-all duration-300 ease-out",
                            isHovering && displayValue !== null ? "text-foreground" : "text-muted-foreground",
                        )}
                    >
                        {displayValue !== null ? displayValue : ""}
                        <span
                            className={cn(
                                "text-xs font-normal text-muted-foreground ml-0.5 transition-opacity duration-300",
                                displayValue !== null ? "opacity-100" : "opacity-0",
                            )}
                        >
                            &nbsp;{unit}
                        </span>
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-2 h-32 md:h-40">
                {safeData.map((item, index) => {
                    const heightPx = (item.value / maxValue) * 100 // Use percentage for height
                    const isHovered = hoveredIndex === index
                    const isAnyHovered = hoveredIndex !== null
                    const isNeighbor = hoveredIndex !== null && (index === hoveredIndex - 1 || index === hoveredIndex + 1)

                    return (
                        <div
                            key={index}
                            className="relative flex-1 flex flex-col items-center justify-end h-full group/bar"
                            onMouseEnter={() => setHoveredIndex(index)}
                        >
                            {/* Bar */}
                            <div
                                className={cn(
                                    "w-full rounded-t-lg md:rounded-full cursor-pointer transition-all duration-300 ease-out origin-bottom",
                                    isHovered
                                        ? "bg-foreground"
                                        : isNeighbor
                                            ? "bg-foreground/50"
                                            : isAnyHovered
                                                ? "bg-foreground/20"
                                                : "bg-foreground/30 group-hover:bg-foreground/40",
                                )}
                                style={{
                                    height: `${item.value === 0 ? 4 : (item.value / maxValue) * 100}%`,
                                    transform: isHovered ? "scaleX(1.15) scaleY(1.02)" : isNeighbor ? "scaleX(1.05)" : "scaleX(1)",
                                    minHeight: "4px"
                                }}
                            />

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[10px] font-medium mt-2 transition-all duration-300 truncate w-full text-center",
                                    isHovered ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Tooltip */}
                            <div
                                className={cn(
                                    "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-popover text-popover-foreground border border-border text-xs font-medium transition-all duration-200 whitespace-nowrap z-10 shadow-md",
                                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none",
                                )}
                            >
                                {item.value} {unit}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    )
}

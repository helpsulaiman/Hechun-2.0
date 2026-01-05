import React from 'react';
import { motion } from 'framer-motion';

interface SkillRadarProps {
    skills: {
        reading: number;
        grammar: number;
        speaking: number;
        listening?: number;
        writing?: number;
    };
    max?: number;
    size?: number;
}

export default function SkillRadar({ skills, size = 300, max = 100 }: SkillRadarProps) {
    // Config
    const center = size / 2;
    // Increased radius to fill more space (was 0.35)
    const radius = size * 0.42;

    // Axes Config (3 axes)
    const axisConfig = [
        { key: 'reading', label: 'Reading', angle: -90 },       // Top
        { key: 'grammar', label: 'Grammar', angle: -90 + 120 }, // Right Bottom
        { key: 'speaking', label: 'Speaking', angle: -90 + 240 } // Left Bottom
    ];

    const angles = axisConfig.map(a => a.angle * (Math.PI / 180));

    // Calculate dynamic points based on skill values (0-max)
    const getPoint = (angle: number, value: number) => {
        const dist = (Math.max(0, Math.min(max, value)) / max) * radius;
        return {
            x: center + Math.cos(angle) * dist,
            y: center + Math.sin(angle) * dist
        };
    };

    const points = axisConfig.map((axis, i) => {
        const val = skills[axis.key as keyof typeof skills] || 0;
        return getPoint(angles[i], val);
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    // Background Guides
    const guides = [100, 75, 50, 25].map(pct => {
        return axisConfig.map((_, i) => {
            const p = getPoint(angles[i], pct);
            return `${p.x},${p.y}`;
        }).join(' ');
    });

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Gradient Defs */}
                <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Guide Lines (Grid) */}
                {guides.map((pointsStr, i) => (
                    <polygon
                        key={i}
                        points={pointsStr}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700/50"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes Lines */}
                {angles.map((angle, i) => {
                    const end = getPoint(angle, 100);
                    return (
                        <line
                            key={`axis-${i}`}
                            x1={center} y1={center}
                            x2={end.x} y2={end.y}
                            stroke="currentColor"
                            className="text-gray-200 dark:text-gray-700"
                        />
                    );
                })}

                {/* The Skill Shape */}
                <motion.polygon
                    points={polygonPoints}
                    fill="url(#radarGradient)"
                    stroke="#6366f1"
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Data Points (Dots) */}
                {points.map((pt, i) => (
                    <motion.circle
                        key={`dot-${i}`}
                        cx={pt.x} cy={pt.y}
                        r="4"
                        fill="#4f46e5"
                        className="drop-shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                    />
                ))}

                {/* Label Text */}
                {axisConfig.map((axis, i) => {
                    const angle = angles[i];
                    // Push labels out a bit further than radius
                    const labelDist = radius + 20;
                    const lx = center + Math.cos(angle) * labelDist;
                    const ly = center + Math.sin(angle) * labelDist;

                    return (
                        <text
                            key={`label-${i}`}
                            x={lx} y={ly}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-gray-600 dark:fill-gray-300 text-xs font-bold uppercase tracking-wider"
                        >
                            {axis.label}
                        </text>
                    );
                })}
            </svg>

            {/* Central Glow (Optional decoration) */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        </div>
    );
}

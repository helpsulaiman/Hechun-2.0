import React from 'react';
import { motion } from 'framer-motion';

interface SkillRadarProps {
    skills: {
        reading: number;
        writing: number;
        speaking: number;
    };
    size?: number;
}

export default function SkillRadar({ skills, size = 300 }: SkillRadarProps) {
    // Normalize skills (assuming 0-1000 range usually, but let's normalize to 0-10 scale for the chart)
    // Actually our enum levels (none, beginner, inter, adv) usually map to roughly 0-100.
    // Let's assume input is 0-100 for percentage visualization.

    // Config
    const center = size / 2;
    const radius = size * 0.35; // Leave room for labels

    // Axes angles (top, right-bottom, left-bottom)
    const angles = [
        -90,       // Top (Reading?)
        -90 + 120, // Right Bottom (Writing?)
        -90 + 240  // Left Bottom (Speaking?)
    ].map(deg => deg * (Math.PI / 180));

    // Axis Labels
    const labels = ["Reading", "Writing", "Speaking"];

    // Calculate dynamic points based on skill values (0-100)
    // Scale: value / 100 * radius
    const getPoint = (angle: number, value: number) => {
        const dist = (Math.max(10, Math.min(100, value)) / 100) * radius;
        return {
            x: center + Math.cos(angle) * dist,
            y: center + Math.sin(angle) * dist
        };
    };

    const readingPt = getPoint(angles[0], skills.reading);
    const writingPt = getPoint(angles[1], skills.writing);
    const speakingPt = getPoint(angles[2], skills.speaking);

    const polygonPoints = `${readingPt.x},${readingPt.y} ${writingPt.x},${writingPt.y} ${speakingPt.x},${speakingPt.y}`;

    // Background Triangles (Guides)
    const guides = [100, 75, 50, 25].map(pct => {
        const p1 = getPoint(angles[0], pct);
        const p2 = getPoint(angles[1], pct);
        const p3 = getPoint(angles[2], pct);
        return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
    });

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Gradient Defs */}
                <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Guide Lines (Grid) */}
                {guides.map((points, i) => (
                    <polygon
                        key={i}
                        points={points}
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
                {[readingPt, writingPt, speakingPt].map((pt, i) => (
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
                {angles.map((angle, i) => {
                    // Push labels out a bit further than radius
                    const labelDist = radius + 30;
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
                            {labels[i]}
                        </text>
                    );
                })}
            </svg>

            {/* Central Glow (Optional decoration) */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        </div>
    );
}

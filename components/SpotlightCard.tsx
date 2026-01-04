import React, { useRef, ReactNode, MouseEvent } from 'react';
import styles from '../styles/SpotlightCard.module.css';

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
    [key: string]: any; // Allow other props like onClick, style, etc.
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    spotlightColor,
    ...props
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        if (spotlightColor) {
            divRef.current.style.setProperty('--spotlight-color', spotlightColor);
        }
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`${styles.cardSpotlight} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default SpotlightCard;

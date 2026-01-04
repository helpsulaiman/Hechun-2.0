import React from 'react';
import Image, { ImageProps } from 'next/image';
import styles from '../styles/ThemeImage.module.css';

interface ThemeImageProps extends Omit<ImageProps, 'src'> {
    srcLight: string;
    srcDark: string;
}

const ThemeImage: React.FC<ThemeImageProps> = ({ srcLight, srcDark, className, ...props }) => {
    return (
        <>
            <Image
                {...props}
                src={srcLight}
                className={`${className || ''} ${styles.lightImage}`}
            />
            <Image
                {...props}
                src={srcDark}
                className={`${className || ''} ${styles.darkImage}`}
            />
        </>
    );
};

export default ThemeImage;

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Github,
    Twitter,
    Youtube,
    Linkedin,
    Instagram,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils"; // Adjusted import path to match project structure (or use @/lib/utils if alias configured)

export interface Testimonial {
    name: string;
    title: string;
    description: string;
    imageUrl: string;
    githubUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
}

export interface TestimonialCarouselProps {
    className?: string;
    items: Testimonial[];
}

export function TestimonialCarousel({ className, items }: TestimonialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isPaused, items.length]);

    const handleNext = () =>
        setCurrentIndex((index) => (index + 1) % items.length);
    const handlePrevious = () =>
        setCurrentIndex(
            (index) => (index - 1 + items.length) % items.length
        );

    const currentTestimonial = items[currentIndex];

    // Safety check if no items provided
    if (!currentTestimonial) return null;

    const socialIcons = [
        { icon: Github, url: currentTestimonial.githubUrl, label: "GitHub" },
        { icon: Twitter, url: currentTestimonial.twitterUrl, label: "Twitter" },
        { icon: Youtube, url: currentTestimonial.youtubeUrl, label: "YouTube" },
        { icon: Linkedin, url: currentTestimonial.linkedinUrl, label: "LinkedIn" },
        { icon: Instagram, url: currentTestimonial.instagramUrl, label: "Instagram" },
    ].filter(item => item.url && item.url !== "#");

    return (
        <div
            className={cn("w-full max-w-5xl mx-auto px-4", className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Desktop layout */}
            <div className='hidden md:flex relative items-center'>
                {/* Avatar */}
                <div className='w-[470px] h-[470px] rounded-3xl overflow-hidden bg-neutral-400 dark:bg-neutral-900 flex-shrink-0'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentTestimonial.imageUrl}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className='w-full h-full'
                        >
                            <Image
                                src={currentTestimonial.imageUrl}
                                alt={currentTestimonial.name}
                                width={470}
                                height={470}
                                className='w-full h-full object-cover'
                                draggable={false}
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Card */}
                <div className='bg-white dark:bg-card rounded-3xl shadow-2xl p-8 ml-[-80px] z-10 max-w-xl flex-1'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentTestimonial.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className='mb-6'>
                                <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                                    {currentTestimonial.name}
                                </h2>

                                <p className='text-sm font-medium text-gray-700 dark:text-gray-500'>
                                    {currentTestimonial.title}
                                </p>
                            </div>

                            <p className='text-black dark:text-white text-base leading-relaxed mb-8'>
                                {currentTestimonial.description}
                            </p>

                            <div className='flex space-x-4'>
                                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                                    <Link
                                        key={label}
                                        href={url || "#"}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 cursor-pointer'
                                        aria-label={label}
                                    >
                                        <IconComponent className='w-5 h-5 text-white dark:text-gray-900' />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile layout */}
            <div className='md:hidden max-w-sm mx-auto text-center bg-transparent'>
                {/* Avatar */}
                <div className='w-full aspect-square bg-neutral-400 dark:bg-neutral-900 rounded-3xl overflow-hidden mb-6'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentTestimonial.imageUrl}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className='w-full h-full'
                        >
                            <Image
                                src={currentTestimonial.imageUrl}
                                alt={currentTestimonial.name}
                                width={400}
                                height={400}
                                className='w-full h-full object-cover'
                                draggable={false}
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Card content */}
                <div className='px-6 py-8 bg-white dark:bg-card rounded-3xl shadow-xl mx-4 mt-[-40px] relative z-10 h-[300px]'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentTestimonial.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-hidden">
                                <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                                    {currentTestimonial.name}
                                </h2>

                                <p className='text-sm font-medium text-gray-600 dark:text-gray-300 mb-4'>
                                    {currentTestimonial.title}
                                </p>

                                <p className='text-black dark:text-white text-sm leading-relaxed mb-6 line-clamp-4'>
                                    {currentTestimonial.description}
                                </p>
                            </div>

                            <div className='flex justify-center space-x-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50'>
                                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                                    <Link
                                        key={label}
                                        href={url || "#"}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer'
                                        aria-label={label}
                                    >
                                        <IconComponent className='w-5 h-5 text-white dark:text-gray-900' />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom navigation */}
            <div className='flex justify-center items-center gap-6 mt-8'>
                {/* Previous */}
                <button
                    onClick={handlePrevious}
                    aria-label='Previous testimonial'
                    className='w-12 h-12 rounded-full bg-gray-100 dark:bg-card border border-gray-300 dark:border-card/40 shadow-md flex items-center justify-center hover:bg-gray-200 dark:hover:bg-card/80 transition-colors cursor-pointer'
                >
                    <ChevronLeft className='w-6 h-6 text-gray-700 dark:text-gray-50' />
                </button>

                {/* Dots */}
                <div className='flex gap-2'>
                    {items.map((_, testimonialIndex) => (
                        <button
                            key={testimonialIndex}
                            onClick={() => setCurrentIndex(testimonialIndex)}
                            className={cn(
                                "w-3 h-3 rounded-full transition-colors cursor-pointer",
                                testimonialIndex === currentIndex
                                    ? "bg-gray-900 dark:bg-white"
                                    : "bg-gray-400 dark:bg-gray-600"
                            )}
                            aria-label={`Go to testimonial ${testimonialIndex + 1}`}
                        />
                    ))}
                </div>

                {/* Next */}
                <button
                    onClick={handleNext}
                    aria-label='Next testimonial'
                    className='w-12 h-12 rounded-full bg-gray-100 dark:bg-card border border-gray-300 dark:border-card/40 shadow-md flex items-center justify-center hover:bg-gray-200 dark:hover:bg-card/80 transition-colors cursor-pointer'
                >
                    <ChevronRight className='w-6 h-6 text-gray-700 dark:text-gray-50' />
                </button>
            </div>
        </div>
    );
}

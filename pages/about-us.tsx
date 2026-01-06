import React from 'react';
import Layout from '../components/Layout';
// Removed ChromaGrid
import ThemeImage from '@/components/ThemeImage';
import SpotlightCard from '@/components/SpotlightCard';
import styles from '../styles/learn.module.css';
import { TestimonialCarousel, Testimonial } from '@/components/ui/profile-card-testimonial-carousel';

// Transform team data to match Testimonial interface
const teamMembers: Testimonial[] = [
    {
        name: "Sulaiman Shabir",
        title: "Co-Leader & Main Developer",
        description: "Architecting the adaptive learning engine and integrating Wav2Vec2 AI for real-time pronunciation feedback.",
        imageUrl: "https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/helpsulaiman.jpeg",
        githubUrl: "https://github.com/helpsulaiman",
        instagramUrl: "https://instagram.com/helpsulaiman.clicks",
        linkedinUrl: "https://linkedin.com/in/helpsulaiman"
    },
    {
        name: "Tehniyah Rayaz",
        title: "Co-Leader & Creative Lead",
        description: "Crafting the visual identity and intuitive UI that makes learning Kashmiri accessible and engaging.",
        imageUrl: "https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/tehniyah2.jpg",
        githubUrl: "#",
        twitterUrl: "#",
        youtubeUrl: "#",
        linkedinUrl: "#"
    },
    {
        name: "Furqan Malik",
        title: "Content & Research",
        description: "Structuring the comprehensive curriculum and verifying cultural nuances for the adaptive learning path.",
        imageUrl: "https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/furqan.jpg",
        instagramUrl: "https://instagram.com/ffurqann18",
        githubUrl: "#",
        twitterUrl: "#",
        youtubeUrl: "#",
        linkedinUrl: "#"
    },
    {
        name: "Farees Ahmed",
        title: "UX & Content Curation",
        description: "Optimizing the user journey and curating content to ensure a seamless progression from basics to fluency.",
        imageUrl: "https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Farees2.jpg",
        instagramUrl: "https://instagram.com/ahangerfarees",
        githubUrl: "#",
        twitterUrl: "#",
        youtubeUrl: "#",
        linkedinUrl: "#"
    },
    {
        name: "Anha Nabi",
        title: "Content Verification",
        description: "Ensuring linguistic precision and phonetic accuracy for the AI training dataset and lesson content.",
        imageUrl: "https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/DYDsSpiritDark.png",
        githubUrl: "#",
        twitterUrl: "#",
        youtubeUrl: "#",
        linkedinUrl: "#"
    }
];

const AboutPage: React.FC = () => {
    return (
        <Layout title="About Us - Hečhun" fullWidth={true}>
            <div className={styles.learnContainer}>
                <div className="text-center pt-10 pb-4 px-4 max-w-4xl mx-auto">
                    <div className={styles.teamLogoContainer}>
                        <ThemeImage
                            srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/DYDsSpiritLight.png"
                            srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/DYDsSpiritDark.png"
                            alt="Team Logo"
                            width={320}
                            height={320}
                            className={styles.teamLogo}
                        />
                    </div>
                    <h1 className={styles['page-title-styled']}>
                        About <span className={styles['gradient-text']}>Us</span>
                    </h1>
                    <p className={styles.pagesubtitle} style={{ maxWidth: '800px', margin: '0 auto' }}>
                        We are a group of passionate students from the <strong>University of Kashmir</strong>, part of the innovative <strong>Design Your Degree (DYD)</strong> program.
                        Beyond digitally preserving Kashmiri idioms, we have built <strong>Hečhun</strong>—an interactive learning platform designed to teach the language to a new generation.
                        <br /><br />
                        Visit our main portal: <a href="https://dydsspirit.vercel.app" target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-80 transition-opacity ml-1 inline-block"><span className={styles['gradient-text']}>DYD&apos;s SPIRIT</span></a>
                    </p>
                </div>

                {/* Team Carousel Section */}
                <div className="w-full py-16 my-8">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-bold mb-4">Our Team</h2>
                        <p className="text-xl text-muted-foreground">The minds behind Hečhun.</p>
                    </div>
                    <TestimonialCarousel items={teamMembers} />
                </div>

                {/* Contact Section */}
                <div className="w-full max-w-4xl mx-auto px-4 pb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
                    </div>
                    <SpotlightCard className="w-full" style={{ height: 'auto', background: 'var(--card)' }}>
                        <div className="flex flex-col items-center justify-center p-8 gap-6">
                            <p className="text-secondary-foreground text-center text-lg max-w-2xl">
                                Have questions, suggestions, or just want to say hello? We&apos;d love to hear from you.
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <a href="mailto:dydspirit@gmail.com" className="btn btn-secondary flex items-center gap-2 px-6 py-3 rounded-full hover:scale-105 transition-transform">
                                    <i className="fas fa-envelope"></i> Email Us
                                </a>
                                <a href="https://instagram.com/helpsulaiman.clicks" target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex items-center gap-2 px-6 py-3 rounded-full hover:scale-105 transition-transform">
                                    <i className="fab fa-instagram"></i> Instagram
                                </a>
                                <a href="https://buymeacoffee.com/helpsulaiman" target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex items-center gap-2 px-6 py-3 rounded-full hover:scale-105 transition-transform">
                                    <i className="fas fa-coffee"></i> Support Us
                                </a>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;

import React from 'react';
import Layout from '../components/Layout';
import ThemeImage from '@/components/ThemeImage';
import SpotlightCard from '@/components/SpotlightCard';
import { TestimonialCarousel, Testimonial } from '@/components/ui/profile-card-testimonial-carousel';
import { Mail, Instagram, Coffee, ExternalLink } from 'lucide-react';

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
            <div className="min-h-screen bg-transparent relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                {/* --- HERO SECTION --- */}
                <div className="relative pt-20 pb-12 px-4 max-w-5xl mx-auto text-center">
                    <div className="relative w-64 h-64 mx-auto mb-10 group">
                        {/* Simple Gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

                        <ThemeImage
                            srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/DYDsSpiritLight.png"
                            srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/DYDsSpiritDark.png"
                            alt="Team Logo"
                            width={256}
                            height={256}
                            className="relative z-10 w-full h-full object-contain drop-shadow-2xl transform transition-transform duration-500 text-center"
                        />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
                        About <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Us</span>
                    </h1>

                    <div className="max-w-4xl mx-auto space-y-8 text-left md:text-center">
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                            We are a group of passionate students from the <span className="text-foreground font-medium">University of Kashmir</span>,
                            pioneering the <span className="text-purple-500 dark:text-purple-400 font-bold">Design Your Degree (DYD)</span> program.
                        </p>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg text-muted-foreground/90 leading-relaxed">
                                <strong>Hečhun</strong> is our flagship interactive platform designed to bridge tradition with technology, making the Kashmiri language accessible to the next generation. Alongside Hečhun, we are also digitally preserving Kashmiri idioms through our <strong>Kashwords</strong> initiative.
                            </p>
                        </div>

                        {/* Research Highlight */}
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all text-left group hover:border-blue-500/30">
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-cyan-400 transition-all">
                                Our Research
                            </h3>
                            <h4 className="text-lg font-semibold mb-3">
                                Analysing Pedestrian Dynamics around Hazratbal Shrine
                            </h4>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                We conducted a comprehensive study focusing on patterns, influencing factors, and the impact of external conditions on crowd movement.
                                Through data collection, we identified peak times, common routes, and congestion areas to aid in effective flow management.
                                Key factors like physical structures and environmental conditions were examined to understand their impact on human behavior.
                            </p>
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 group-hover:bg-primary/10 transition-colors">
                                <span className="font-bold text-primary mr-2">Innovation:</span>
                                <span className="text-foreground/80">
                                    We are using these insights to develop a <span className="font-semibold">smart sensor system</span> that will allow organizers and security personnel to monitor real-time capacity of venues and buildings.
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <a
                                href="https://dydsspirit.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-black font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                Visit DYD&apos;s SPIRIT <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- TEAM SECTION (UNCHANGED LOGIC) --- */}
                <div className="w-full py-20 relative">
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                            Our Team
                        </h2>
                        <p className="text-xl text-muted-foreground">The minds behind Hečhun.</p>
                    </div>

                    {/* Render the preserved component */}
                    <TestimonialCarousel items={teamMembers} />
                </div>

                {/* --- CONTACT SECTION --- */}
                <div className="w-full max-w-4xl mx-auto px-4 pb-24">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-3">Get in Touch</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
                    </div>

                    <SpotlightCard className="w-full overflow-hidden border-0 bg-transparent shadow-none" spotlightColor="rgba(124, 58, 237, 0.1)">
                        <div className="relative bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-10 md:p-14 shadow-2xl">
                            <div className="flex flex-col items-center gap-8 text-center">
                                <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-2xl leading-relaxed">
                                    Have questions, suggestions, or just want to discuss the future of Kashmiri language tech?
                                    <br /><span className="text-foreground font-normal">We&apos;d love to hear from you.</span>
                                </p>

                                <div className="flex flex-wrap justify-center gap-4 w-full">
                                    <a
                                        href="mailto:dydspirit@gmail.com"
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 text-red-600 dark:text-red-400 font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span>Email Us</span>
                                    </a>

                                    <a
                                        href="https://instagram.com/helpsulaiman.clicks"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 hover:from-pink-500/20 hover:to-purple-600/20 border border-pink-500/20 text-pink-600 dark:text-pink-400 font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Instagram className="w-5 h-5" />
                                        <span>Instagram</span>
                                    </a>

                                    <a
                                        href="https://buymeacoffee.com/helpsulaiman"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-600/10 hover:from-yellow-500/20 hover:to-orange-600/20 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Coffee className="w-5 h-5" />
                                        <span>Support Us</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;

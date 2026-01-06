
import React from 'react';
import Layout from '../components/Layout';
import ThemeImage from '@/components/ThemeImage';
import SpotlightCard from '@/components/SpotlightCard';
import styles from '@/styles/learn.module.css';
import { BookOpen, TrendingUp, Mic, Feather, AlertTriangle } from 'lucide-react';

const AboutProjectPage: React.FC = () => {
  return (
    <Layout title="About Project - Hečhun" fullWidth={true}>
      <div className={`${styles.learnContainer} bg-gradient-to-b from-primary/5 via-background to-background`}>

        {/* --- Hero Section --- */}
        <div className="text-center pt-16 pb-12 px-4 max-w-4xl mx-auto relative overflow-visible">
          {/* Decorative Blur behind logo */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className={styles.logoContainer}>
            <ThemeImage
              srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
              srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
              alt="Project Logo"
              width={320}
              height={320}
              className="relative z-10 w-60 h-60 md:w-80 md:h-80 mx-auto drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 mt-8 tracking-tight">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500">The Project</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Safeguarding Our Voice: A Digital Initiative for the Kashmiri Language
          </p>
        </div>

        {/* --- The Decline / Mission --- */}
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <SpotlightCard className="h-full flex flex-col" style={{ background: 'var(--card)' }}>
              <div className="p-8 h-full flex flex-col">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">The Silent Decline</h3>
                <p className="text-lg text-muted-foreground leading-relaxed flex-grow">
                  The Kashmiri language (Koshur) is currently classified as "vulnerable" by UNESCO. In a digital-first world, languages that lack a strong online presence risk fading into obscurity. The intricate idioms, proverbs, and unique phonetics of our mother tongue are slowly being replaced in daily conversation.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="h-full flex flex-col" style={{ background: 'var(--card)' }}>
              <div className="p-8 h-full flex flex-col">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                  <Feather className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Our Solution: Hečhun</h3>
                <p className="text-lg text-muted-foreground leading-relaxed flex-grow">
                  We believe preservation requires adaptation. <strong>Hečhun</strong> (To Learn) is not just a dictionary—it is a living, breathing learning platform. We are building the modern digital infrastructure Kashmiri needs to thrive, ensuring it remains relevant for future generations.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* --- Key Features --- */}
        <div className="w-full max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Core Innovation</h2>
            <p className="text-xl text-muted-foreground">Bridging tradition with cutting-edge technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Adaptive Structure */}
            <SpotlightCard className="h-full" style={{ background: 'var(--card)' }}>
              <div className="p-8 h-full">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Personalized Learning Path</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every learner is unique. Unlike static textbooks, Hečhun offers an <strong>adaptive structure</strong> that evolves with you. Whether you are a beginner starting with the alphabet or a fluent speaker brushing up on complex poetry, the platform tailors the journey to your pace and proficiency.
                </p>
              </div>
            </SpotlightCard>

            {/* Structured Curriculum */}
            <SpotlightCard className="h-full" style={{ background: 'var(--card)' }}>
              <div className="p-8 h-full">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Structured Curriculum</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From basic phonetics to advanced grammar, we moved beyond scattered resources to create a formalized, step-by-step curriculum designed for clarity and retention.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* --- AI Section (Speech Recognition) --- */}
        <div className="w-full max-w-6xl mx-auto px-4 pb-24">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 z-0"></div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  <Mic className="w-3 h-3" /> Coming Soon
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">AI-Powered Pronunciation</h3>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  Language lives in speech. We are developing a custom AI model to provide real-time feedback on your pronunciation.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1 bg-primary h-auto rounded-full"></div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Wav2Vec2-XLSR-53</h4>
                      <p className="text-gray-400">State-of-the-art model developed by Meta AI for cross-lingual speech representation.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1 bg-amber-500 h-auto rounded-full"></div>
                    <div>
                      <h4 className="text-white font-bold text-lg">OpenSLR/SLR122</h4>
                      <p className="text-gray-400">Fine-tuned on a massive, publicly available corpus of Kashmiri speech.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="flex justify-center gap-1 items-end h-24 mb-6">
                    <div className="w-3 bg-primary animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
                    <div className="w-3 bg-primary animate-[pulse_1.5s_ease-in-out_infinite] delay-75" style={{ height: '70%' }}></div>
                    <div className="w-3 bg-primary animate-[pulse_1.2s_ease-in-out_infinite] delay-150" style={{ height: '100%' }}></div>
                    <div className="w-3 bg-primary animate-[pulse_0.8s_ease-in-out_infinite] delay-100" style={{ height: '60%' }}></div>
                    <div className="w-3 bg-primary animate-[pulse_1.3s_ease-in-out_infinite] delay-200" style={{ height: '80%' }}></div>
                  </div>
                  <p className="font-mono text-primary/70 text-sm tracking-widest uppercase">Analyzing Audio Input...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AboutProjectPage;
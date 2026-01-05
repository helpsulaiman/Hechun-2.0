import React from 'react';
import Layout from '../components/Layout';
import Image from "next/image";
import Link from "next/link";
import ThemeImage from '@/components/ThemeImage';
import SpotlightCard from '@/components/SpotlightCard';
import styles from "@/styles/Alphabet.module.css";

const AboutProjectPage: React.FC = () => {
  return (
    <Layout>
      <div className="logo-container">
        <ThemeImage
          srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
          srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
          alt="Project Logo"
          width={200}
          height={200}
          style={{ objectFit: "cover", filter: "drop-shadow(0 0 15px rgba(251, 191, 36, 0.4))" }}
          className="team-logo"
        />
      </div>

      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>About the Project</h1>
          <p className={styles.pageSubtitle}>
            Safeguarding Our Voice: A Digital Initiative for the Kashmiri Language
          </p>
        </div>
      </div>


      {/* --- The Core Mission: Preservation --- */}
      <div className="idioms-grid" style={{ maxWidth: '1000px' }}>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Why Preservation Matters</h2>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              The Kashmiri language (Koshur) is currently classified as "vulnerable" by UNESCO.
              In an increasingly digital world, languages that lack a strong online presence risk fading away.
              Our primary mission is to build a modern, digital infrastructure for Kashmiri, ensuring it thrives not just in our homes, but in the future of technology.
            </p>
          </div>
        </SpotlightCard>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hečhun (To Learn)</h2>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              At the heart of this initiative is <strong>Hečhun</strong>, our comprehensive learning platform.
              We believe preservation starts with education. By making learning accessible, interactive, and structured,
              we empower a new generation to connect with their linguistic roots.
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* --- What We Are Building --- */}
      <div className="about-section" style={{ marginBlock: '2rem' }}>
        <h2 className={styles.pageTitle}>Our Preservation Strategy</h2>
      </div>
      <div className="idioms-grid">
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎓 Structured Curriculum</h3>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              Moved beyond scattered resources to a formalized learning path. From the basic alphabet to complex sentence structures,
              Hechun offers a guided journey for learners of all levels.
            </p>
          </div>
        </SpotlightCard>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🗣️ AI-Powered Pronunciation</h3>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              Language lives in speech. We've developed a custom AI model specifically fine-tuned for Kashmiri accents,
              allowing learners to practice speaking and receive real-time feedback—a crucial tool for a language with unique phonetics.
            </p>
          </div>
        </SpotlightCard>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>📚 Digital Archive</h3>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              We are digitizing folklore, proverbs, and sayings. Our <strong>Kashmiri Idioms</strong> collection serves as a repository
              of cultural wisdom, preserving expressions that capture the essence of our worldview.
            </p>
          </div>
        </SpotlightCard>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🤝 Community Driven</h3>
            <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
              Preservation is a collective effort. We provide tools for the community to contribute words, translations, and audio,
              making this a living, breathing platform owned by the people.
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* --- Technical Details --- */}
      <div className="about-section" style={{ marginBlock: '2rem' }}>
        <h2 className={styles.pageTitle}>Powered by Technology</h2>
      </div>
      <div className="idioms-grid" style={{ maxWidth: '1000px', gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content flex flex-col md:flex-row gap-8 items-center p-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>AI Model Architecture</h3>
              <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
                Our speech recognition system is built upon the robust{' '}
                <a
                  href="https://huggingface.co/facebook/wav2vec2-large-xlsr-53"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-inherit visited:text-inherit no-underline hover:text-[var(--color-primary)] hover:drop-shadow-[0_0_8px_var(--color-primary)] transition-all duration-300"
                >
                  Wav2Vec2-XLSR-53
                </a>{' '}
                architecture, a state-of-the-art model developed by Meta AI for cross-lingual speech representation.
              </p>
            </div>
            <div className="hidden md:block w-px bg-[var(--border-color)] self-stretch"></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Training Dataset</h3>
              <p className="text-meaning" style={{ fontSize: '1.1rem' }}>
                The model was fine-tuned using the{' '}
                <a
                  href="https://www.openslr.org/122/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-inherit visited:text-inherit no-underline hover:text-[var(--color-primary)] hover:drop-shadow-[0_0_8px_var(--color-primary)] transition-all duration-300"
                >
                  OpenSLR/SLR122
                </a>{' '}
                dataset, a publicly available corpus specifically designed for Kashmiri speech recognition tasks.
              </p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* --- Join Our Mission (Restored) --- */}
      <div className="about-section" style={{ marginBlock: '2rem' }}>
        <h2 className={styles.pageTitle}>Support the Movement</h2>
      </div>
      <div className="idioms-grid" style={{ maxWidth: '700px', gridTemplateColumns: '1fr' }}>
        <SpotlightCard className="idiom-card" style={{ height: 'auto' }}>
          <div className="card-content">
            <p className="text-primary">
              This is an open-source initiative built by passion. There are many ways you can help us keep the Kashmiri language alive online:
            </p>
            <ul className="list-disc list-inside text-left text-primary my-4 space-y-2">
              <li>Start learning on Hečhun and provide feedback</li>
              <li>Contribute new idioms or verify existing ones</li>
              <li>Share the platform with friends and family</li>
              <li>Support the development costs</li>
            </ul>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link href="/hechun" className="btn btn-primary">
                Start Learning
              </Link>
              <a href="https://buymeacoffee.com/helpsulaiman" target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex items-center justify-center gap-2 px-6 py-3 rounded-full hover:scale-105 transition-transform">
                <i className="fas fa-coffee"></i> Buy us a coffee
              </a>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </Layout>
  );
};

export default AboutProjectPage;
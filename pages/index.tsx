import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { ArrowRight, Sparkles, Map, RotateCcw } from 'lucide-react';
import ThemeImage from '../components/ThemeImage';
import SkillRadar from '../components/SkillRadar';
import GuestLoginNudge from '../components/GuestLoginNudge';

export default function HomePage() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [guestSkills, setGuestSkills] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<any>(null);

  useEffect(() => {
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    setLoading(true);

    if (user) {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setHasProfile(data.hasProfile);

        if (data.profile && data.profile.skill_vector) {
          setUserSkills(data.profile.skill_vector);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      return;
    }

    // Guest check
    const local = localStorage.getItem('hechun_guest_skills');
    if (local) {
      setGuestSkills(JSON.parse(local));
      setHasProfile(true);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  if (!hasProfile) {
    return <WelcomeView />;
  }

  return <PathView guestSkills={guestSkills} userSkills={userSkills} />;
}

function WelcomeView() {
  return (
    <Layout title="Hečhun" fullWidth>
      <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden bg-background">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="z-10 container mx-auto px-4 text-center max-w-4xl relative">
          <div className="mb-8 flex justify-center">
            <div className="w-60 h-60 md:w-80 md:h-80 relative animate-float">
              <ThemeImage
                srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                alt="Hechun Logo"
                width={400}
                height={400}
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          <motion.h1
            className="text-4xl md:text-7xl font-bold mb-6 flex flex-wrap justify-center gap-x-4 md:gap-x-6 leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {/* Word 1: Learn */}
            <span className="flex whitespace-nowrap">
              {"Learn".split("").map((char, i) => (
                <motion.span
                  key={`learn-${i}`}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
                >
                  {char}
                </motion.span>
              ))}
            </span>

            {/* Word 2: Kashmiri */}
            <span className="flex whitespace-nowrap">
              {"Kashmiri".split("").map((char, i) => (
                <motion.span
                  key={`kash-${i}`}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
                >
                  {char}
                </motion.span>
              ))}
            </span>

            {/* Word 3: YOUR (Glowing) */}
            <span className="flex whitespace-nowrap">
              {"YOUR".split("").map((char, i) => (
                <motion.span
                  key={`your-${i}`}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]"
                  style={{ textShadow: "0 0 20px currentColor" }}
                >
                  {char}
                </motion.span>
              ))}
            </span>

            {/* Word 4: Way. */}
            <span className="flex whitespace-nowrap">
              {"Way.".split("").map((char, i) => (
                <motion.span
                  key={`way-${i}`}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Hečhun creates a personalized learning path just for you.
            Whether you want to speak, read, or write, we adapt to your level instantly.
          </p>

          <Link
            href="/onboarding/start"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2"></div>
              Dynamic Path
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-1"></div>
              Skill Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3"></div>
              Cultural Immersion
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


interface PathViewProps {
  guestSkills?: any;
  userSkills?: any;
}

function PathView({ guestSkills, userSkills }: PathViewProps) {
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    async function fetchNext() {
      // Get completed IDs for guest
      let completedIds: number[] = [];
      const localProgress = localStorage.getItem('hechun_guest_progress_counts');
      if (localProgress) {
        try {
          const counts = JSON.parse(localProgress);
          completedIds = Object.keys(counts).map(Number);
        } catch (e) { }
      }

      try {
        const res = await fetch('/api/next-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestSkills: guestSkills || {},
            completedIds: completedIds
          })
        });
        const data = await res.json();
        if (data.lesson) {
          setNextLesson(data.lesson);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchNext();
  }, [guestSkills]);

  const handleResetProgress = async () => {
    setResetting(true);
    try {
      if (user) {
        // Server-side reset
        const res = await fetch('/api/reset-progress', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to reset');
      }

      // Always clear local (for mix scenarios or guest)
      localStorage.removeItem('hechun_guest_skills');
      localStorage.removeItem('hechun_guest_progress_counts');

      window.location.href = '/onboarding/start'; // Redirect to onboarding
    } catch (error) {
      console.error("Reset failed", error);
      alert("Failed to reset progress. Please try again.");
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <Layout title="Hečhun">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Map className="w-8 h-8 text-primary" />
            Your Learning Path
          </h1>
          <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">
            Beta v2.0
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Col: Recommendation */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-muted-foreground uppercase text-sm tracking-widest pl-2">Current Objective</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : nextLesson ? (
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <div className="bg-card rounded-3xl p-8 text-card-foreground shadow-2xl relative overflow-hidden group md:hover:scale-[1.02] transition-transform cursor-pointer border border-border">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-32 h-32" />
                  </div>

                  <div className="relative z-10">
                    <span className="bg-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block text-primary">
                      Next Up
                    </span>
                    <h2 className="text-3xl font-bold mb-2">{nextLesson.title}</h2>
                    <p className="text-muted-foreground mb-6">{nextLesson.description}</p>

                    <div className="flex items-center gap-4">
                      <Link href={`/lesson/${nextLesson.id}`}>
                        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg">
                          Start Lesson <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>

                    </div>
                  </div>
                </div>

                {!user && (
                  <GuestLoginNudge />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">No Lessons Available</h2>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find a path for you yet.
                  (Did you run the seed script?)
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs font-mono text-left text-muted-foreground">
                  npm run dev<br />
                  curl http://localhost:3000/api/dev/seed
                </div>
              </div>
            )}
          </div>


          {/* Right Col: Stats & History */}
          <div className="flex flex-col gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center text-card-foreground">Your Skill Profile</h2>
              {(() => {
                const skills = userSkills || guestSkills || {};
                return (
                  <SkillRadar
                    skills={{
                      reading: typeof skills.reading === 'number' ? skills.reading : 0,
                      writing: typeof skills.writing === 'number' ? skills.writing : 0,
                      grammar: typeof skills.grammar === 'number' ? skills.grammar : 0,
                      vocabulary: typeof skills.vocabulary === 'number' ? skills.vocabulary : 0,
                      speaking: typeof skills.speaking === 'number' ? skills.speaking : 0,
                    }}
                  />
                );
              })()}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Your adaptive profile updates after every lesson.
              </div>
            </div>

            <Link href="/history">
              <div className="bg-card hover:bg-accent/5 border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between group transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Review & Redo</h3>
                    <p className="text-sm text-muted-foreground">Practice previous lessons</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>


      </div>
    </Layout>
  );
}


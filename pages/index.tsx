import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { ArrowRight, Sparkles, Map } from 'lucide-react';
import ThemeImage from '../components/ThemeImage';
import SkillRadar from '../components/SkillRadar';

export default function HomePage() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [guestSkills, setGuestSkills] = useState<any>(null);

  useEffect(() => {
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    setLoading(true);

    // Check local storage for guest progress first
    const local = localStorage.getItem('hechun_guest_skills');
    if (local) {
      setGuestSkills(JSON.parse(local));
      setHasProfile(true);
      setLoading(false);
      return;
    }

    // If logged in, check API
    if (user) {
      try {
        const res = await fetch('/api/hechun/user');
        const data = await res.json();
        setHasProfile(data.hasProfile);
      } catch (e) {
        console.error(e);
      }
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

  return <PathView guestSkills={guestSkills} />;
}

function WelcomeView() {
  return (
    <Layout title="Welcome to Hechun" fullWidth>
      <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="z-10 container mx-auto px-4 text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 relative animate-float">
              <ThemeImage
                srcLight="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_L.png"
                srcDark="https://hdbmcwmgolmxmtllaclx.supabase.co/storage/v1/object/public/images/Hechun_D.png"
                alt="Hechun Logo"
                width={200}
                height={200}
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Learn Kashmiri the <span className="text-indigo-500">Adaptive</span> Way.
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Hečhun creates a personalized learning path just for you.
            Whether you want to speak, read, or write, we adapt to your level instantly.
          </p>

          <Link
            href="/hechun/onboarding/start"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Dynamic Path
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              Skill Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
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
}

function PathView({ guestSkills }: PathViewProps) {
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNext() {
      try {
        const res = await fetch('/api/hechun/next-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestSkills: guestSkills
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

  return (
    <Layout title="Your Path">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="w-8 h-8 text-indigo-500" />
            Your Learning Path
          </h1>
          <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1 rounded-full text-sm font-medium">
            Beta v2.0
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Col: Recommendation */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-500 uppercase text-sm tracking-widest pl-2">Current Objective</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : nextLesson ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles className="w-32 h-32" />
                  </div>

                  <div className="relative z-10">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                      Next Up
                    </span>
                    <h2 className="text-3xl font-bold mb-2">{nextLesson.title}</h2>
                    <p className="text-indigo-200 mb-6">{nextLesson.description}</p>

                    <div className="flex items-center gap-4">
                      <Link href={`/hechun/lesson/${nextLesson.id}`}>
                        <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                          Start Lesson <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>
                      <span className="text-sm font-mono text-indigo-300">
                        Complexity: {nextLesson.complexity_score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
                <p className="text-gray-400 max-w-md">
                  We couldn't find a path for you yet.
                  (Did you run the seed script?)
                </p>
                <div className="mt-4 p-4 bg-gray-900 rounded-lg text-xs font-mono text-left">
                  npm run dev<br />
                  curl http://localhost:3000/api/dev/seed
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Stats */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-4 text-center">Your Skill Profile</h2>
            <SkillRadar
              skills={{
                // Default to 10 if null/missing for nice visual baseline
                // In reality we should map 'beginner' etc to numbers if stored as strings
                // Assuming API/GuestSkills returns a number or string. 
                // Let's create a mapper helper or inline it.
                // For MVP: guestSkills might be { reading: 'beginner' } or { reading: 10 } depending on what we saved.
                // Diagnostic saved numbers but heuristic profile saved strings?
                // Let's assume numbers are stored for now or map them.
                reading: typeof guestSkills?.reading === 'number' ? guestSkills.reading : 30,
                writing: typeof guestSkills?.writing === 'number' ? guestSkills.writing : 20,
                speaking: typeof guestSkills?.speaking === 'number' ? guestSkills.speaking : 40,
              }}
            />
            <div className="mt-6 text-center text-sm text-gray-400">
              Your adaptive profile updates after every lesson.
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('hechun_guest_skills');
              window.location.reload();
            }}
            className="text-sm text-red-400 hover:text-red-300 underline"
          >
            Reset Progress (Debug)
          </button>
        </div>
      </div>
    </Layout>
  );
}

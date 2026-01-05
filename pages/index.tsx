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
  const [userSkills, setUserSkills] = useState<any>(null);

  useEffect(() => {
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    setLoading(true);

    // Check local storage for guest progress first (only if not logged in? or always?)
    // If logged in, we prefer server data usually. 
    // But existing logic prioritized local. Let's keep it but also fetch user if logged in to overwrite/merge?
    // Actually, if user is logged in, we should check API. 

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
            href="/onboarding/start"
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
      try {
        const res = await fetch('/api/next-lesson', {
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
                      <Link href={`/lesson/${nextLesson.id}`}>
                        <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                          Start Lesson <ArrowRight className="w-5 h-5" />
                        </button>
                      </Link>

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
            {(() => {
              const skills = userSkills || guestSkills || {};
              return (
                <SkillRadar
                  skills={{
                    reading: typeof skills.reading === 'number' ? skills.reading : 0,
                    grammar: typeof skills.grammar === 'number' ? skills.grammar : (typeof skills.writing === 'number' ? skills.writing : 0),
                    speaking: typeof skills.speaking === 'number' ? skills.speaking : 0,
                  }}
                />
              );
            })()}
            <div className="mt-6 text-center text-sm text-gray-400">
              Your adaptive profile updates after every lesson.
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-sm text-red-500 hover:text-red-400 underline opacity-60 hover:opacity-100 transition-all font-medium py-2 px-4 rounded hover:bg-red-900/10"
            >
              Reset Progress
            </button>
          ) : (
            <div className="inline-flex flex-col items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-sm mx-auto animate-in zoom-in-50 duration-200">
              <p className="text-red-700 dark:text-red-200 font-bold mb-2">Are you absolutely sure?</p>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                This will permanently delete all your progress, XP, and lesson history. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={resetting}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white font-bold rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {resetting ? 'Deleting...' : 'Yes, Reset Everything'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


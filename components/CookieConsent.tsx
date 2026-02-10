import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

interface Consent {
    necessary: boolean; // Always true
    analytics: boolean;
    functional: boolean;
}

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [consent, setConsent] = useState<Consent>({
        necessary: true,
        analytics: false,
        functional: false,
    });

    useEffect(() => {
        // Check if user has already consented
        const savedConsent = localStorage.getItem('hechun_cookie_consent');
        if (!savedConsent) {
            setShowBanner(true);
        } else {
            setConsent(JSON.parse(savedConsent));
        }
    }, []);

    const saveConsent = (consentData: Consent) => {
        localStorage.setItem('hechun_cookie_consent', JSON.stringify(consentData));
        setShowBanner(false);
        setShowSettings(false);
    };

    const acceptAll = () => {
        const fullConsent = { necessary: true, analytics: true, functional: true };
        setConsent(fullConsent);
        saveConsent(fullConsent);
    };

    const acceptNecessary = () => {
        const minimalConsent = { necessary: true, analytics: false, functional: false };
        setConsent(minimalConsent);
        saveConsent(minimalConsent);
    };

    const saveCustom = () => {
        saveConsent(consent);
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`fixed bottom-4 z-50 ${showSettings ? 'left-4 right-4 md:left-auto md:right-4 md:max-w-2xl' : 'right-4 max-w-md'}`}
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {!showSettings ? (
                        // Compact banner
                        <div className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <Cookie className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        Cookie Settings
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        We use cookies to improve your experience. Choose your preferences or accept all.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={acceptAll}
                                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    Accept All
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={acceptNecessary}
                                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Necessary Only
                                    </button>
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Customize
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Expanded settings panel
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Cookie Preferences
                                </h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-5">
                                {/* Necessary Cookies */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="mt-1 w-4 h-4 rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                            Necessary (Required)
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            Authentication, progress tracking, and basic functionality.
                                        </p>
                                    </div>
                                </div>

                                {/* Analytics */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={consent.analytics}
                                        onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                                        className="mt-1 w-4 h-4 rounded accent-indigo-600"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                            Analytics (Optional)
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            Help us improve lessons. No personal data collected.
                                        </p>
                                    </div>
                                </div>

                                {/* Functional */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={consent.functional}
                                        onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                                        className="mt-1 w-4 h-4 rounded accent-indigo-600"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                            Functional (Optional)
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            Remember theme, settings, and preferences.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={saveCustom}
                                    className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    Save Preferences
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

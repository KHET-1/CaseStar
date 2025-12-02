'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { useSettings } from '@/context/SettingsContext';

export function AdminPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateTimelineSettings, resetSettings } = useSettings();

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:text-white transition-all group"
                aria-label="Open Settings"
            >
                <span className="text-xl group-hover:rotate-90 transition-transform duration-500 block">⚙️</span>
            </button>

            {/* Settings Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 z-50 p-4"
                        >
                            <GlassCard className="h-full overflow-y-auto border-l border-white/10 shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-white">Settings</h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-white/50 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Timeline Settings */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4">
                                            Timeline Cards
                                        </h3>

                                        {/* Card Width */}
                                        <div className="mb-4">
                                            <label className="block text-sm text-white/80 mb-2">
                                                Max Width: {settings.timeline.cardWidth}
                                            </label>
                                            <input
                                                type="range"
                                                min="200"
                                                max="600"
                                                step="10"
                                                value={parseInt(settings.timeline.cardWidth)}
                                                onChange={(e) => updateTimelineSettings({ cardWidth: `${e.target.value}px` })}
                                                className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Animation Speed */}
                                        <div className="mb-4">
                                            <label className="block text-sm text-white/80 mb-2">
                                                Animation Speed: {settings.timeline.animationSpeed}x
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={settings.timeline.animationSpeed}
                                                onChange={(e) => updateTimelineSettings({ animationSpeed: parseFloat(e.target.value) })}
                                                className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Show Confidence */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/80">Show Confidence</span>
                                            <button
                                                onClick={() => updateTimelineSettings({ showConfidence: !settings.timeline.showConfidence })}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.timeline.showConfidence ? 'bg-purple-500' : 'bg-white/20'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.timeline.showConfidence ? 'translate-x-6' : 'translate-x-0'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <button
                                            onClick={resetSettings}
                                            className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg transition-colors text-sm"
                                        >
                                            Reset to Defaults
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

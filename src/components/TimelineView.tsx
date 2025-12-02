'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import type { AnalysisResult } from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';

interface TimelineViewProps {
    result: AnalysisResult;
    onComplete: () => void;
}

interface Suggestion {
    date: string;
    reason: string;
    confidence: number;
}

export function TimelineView({ result, onComplete }: TimelineViewProps) {
    const [step, setStep] = useState<'collect' | 'suggest' | 'confirmed'>('collect');
    const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);
    const { settings } = useSettings();

    // Mock suggestions based on the result (in real app, AI would generate these)
    const suggestions: Suggestion[] = [
        {
            date: 'Oct 12, 2023',
            reason: 'Based on the contract effective date mentioned in the summary.',
            confidence: 0.85
        },
        {
            date: 'Nov 01, 2023',
            reason: 'Alternative: First payment due date.',
            confidence: 0.45
        },
        {
            date: 'Sep 15, 2023',
            reason: 'Alternative: Document creation metadata.',
            confidence: 0.30
        }
    ];

    // Auto-advance from 'collect' to 'suggest' after animation
    useEffect(() => {
        if (step === 'collect') {
            const timer = setTimeout(() => {
                setStep('suggest');
            }, 2000); // Duration of the "Mario 64" star collect animation
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="w-full max-w-5xl mx-auto relative min-h-[600px] flex flex-col items-center justify-center">

            {/* Step 1: Mario 64 Style Star Collect Animation */}
            <AnimatePresence>
                {step === 'collect' && (
                    <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: [0, 1.5, 1], rotate: 720 }}
                        exit={{ scale: 0, opacity: 0, y: -100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="z-50 flex flex-col items-center"
                    >
                        {/* The Star */}
                        <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
                            ⭐
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="mt-8 text-4xl font-black text-yellow-300 tracking-wider uppercase drop-shadow-lg"
                        >
                            Analysis Complete!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 2: Timeline Suggestion */}
            <AnimatePresence>
                {step === 'suggest' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent -translate-x-1/2 -z-10" />

                        <h2 className="text-2xl font-bold text-purple-100 mb-12">
                            Where does this belong?
                        </h2>

                        <div className="flex flex-col gap-8 w-full max-w-2xl items-center">
                            {suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.2 * (1 / settings.timeline.animationSpeed) }}
                                    className={`relative flex items-center w-full ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    {/* Timeline Node */}
                                    <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 
                    ${selectedSuggestion === index ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.6)] scale-125' : 'bg-purple-900 border-purple-500'}`}
                                    />

                                    {/* Content Card */}
                                    <div
                                        className={`w-[45%] ${selectedSuggestion === index ? 'scale-105' : 'opacity-60 hover:opacity-100'} transition-all duration-300 cursor-pointer flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                                        onClick={() => setSelectedSuggestion(index)}
                                    >
                                        <div style={{ maxWidth: settings.timeline.cardWidth, width: '100%' }}>
                                            <GlassCard className={`p-4 ${selectedSuggestion === index ? 'border-yellow-400/30 bg-yellow-900/10' : ''}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-lg text-purple-100">{suggestion.date}</span>
                                                    {settings.timeline.showConfidence && (
                                                        <span className={`text-xs px-2 py-1 rounded-full ${suggestion.confidence > 0.8 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                            {Math.round(suggestion.confidence * 100)}% Sure
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-purple-200/80">{suggestion.reason}</p>
                                            </GlassCard>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            onClick={() => setStep('confirmed')}
                            className="mt-12 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-bold text-lg shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:scale-105 transition-transform"
                        >
                            Accept Placement
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 3: Confirmed - Universe Bubble Pop */}
            <AnimatePresence>
                {step === 'confirmed' && (
                    <div className="relative w-full flex flex-col items-center">
                        {/* Timeline Line (Persistent) */}
                        <div className="absolute left-1/2 -top-40 bottom-0 w-1 bg-gradient-to-b from-purple-500/20 via-purple-500/50 to-transparent -translate-x-1/2 -z-20" />

                        {/* The Anchor Star on Timeline */}
                        <motion.div
                            layoutId="anchor-star"
                            className="absolute left-1/2 top-0 -translate-x-1/2 text-4xl z-10"
                        >
                            ⭐
                        </motion.div>

                        {/* Wiggling Line Connector */}
                        <svg className="absolute left-1/2 top-4 w-1 h-32 -translate-x-1/2 overflow-visible z-0">
                            <motion.path
                                d="M 0 0 Q 5 15, 0 30 T 0 60 T 0 90 T 0 120"
                                fill="none"
                                stroke="url(#glowGradient)"
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                            <defs>
                                <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* The Universe Bubble */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                delay: 0.5
                            }}
                            className="mt-32 relative"
                        >
                            {/* Bubble Glow Effect */}
                            <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full -z-10" />

                            <GlassCard className="w-full max-w-3xl p-8 border-t-4 border-t-yellow-400/50">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-5xl">🪐</div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{suggestions[selectedSuggestion].date}</h2>
                                        <p className="text-purple-300">New Event Created</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-purple-200 mb-2">Summary</h3>
                                        <p className="text-purple-100/90 leading-relaxed">{result.summary}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-black/20 p-4 rounded-xl">
                                            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">Key Points</h4>
                                            <ul className="space-y-2">
                                                {result.key_points.map((point, i) => (
                                                    <li key={i} className="text-sm text-purple-100/80 flex items-start gap-2">
                                                        <span className="text-yellow-400 mt-1">•</span>
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-black/20 p-4 rounded-xl">
                                            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">Entities</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.entities.map((entity, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 bg-purple-500/30 rounded text-purple-200">
                                                        {typeof entity === 'string' ? entity : entity.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onComplete}
                                    className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors"
                                >
                                    ✕ Close
                                </button>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

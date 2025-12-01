'use client';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import type { AnalysisResult } from '@/lib/api';

interface ResultsPanelProps {
    result: AnalysisResult;
    onClose: () => void;
}

export function ResultsPanel({ result, onClose }: ResultsPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full max-w-4xl mt-8"
        >
            <GlassCard className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ✨ Analysis Complete
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-purple-300 hover:text-purple-100 transition-colors text-2xl"
                        aria-label="Close results"
                    >
                        ×
                    </button>
                </div>

                {/* Summary Section */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <span>📄</span> Summary
                    </h3>
                    <p className="text-purple-100/90 leading-relaxed">
                        {result.summary}
                    </p>
                </div>

                {/* Key Points Section */}
                {result.key_points && result.key_points.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-purple-200 mb-3 flex items-center gap-2">
                            <span>🔑</span> Key Points
                        </h3>
                        <ul className="space-y-2 list-none">
                            {result.key_points.map((point, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-purple-100/80 pl-0"
                                >
                                    <span className="text-cyan-400 mr-3">•</span>
                                    {point}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Entities Section */}
                {result.entities && result.entities.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-purple-200 mb-3 flex items-center gap-2">
                            <span>🏷️</span> Entities Found
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {result.entities.map((entity, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm text-purple-200"
                                >
                                    {typeof entity === 'string' ? entity : entity.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Case ID if provided */}
                {result.case_id && (
                    <div className="mt-6 pt-6 border-t border-purple-400/20">
                        <p className="text-sm text-purple-300/60">
                            Case ID: <span className="text-purple-200">{result.case_id}</span>
                        </p>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
}

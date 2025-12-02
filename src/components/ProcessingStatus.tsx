'use client';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';

interface ProcessingStatusProps {
    stage: 'uploading' | 'reading' | 'analyzing' | 'complete' | 'error';
    message?: string;
    progress?: number;
    onRetry?: () => void;
}

const stageInfo = {
    uploading: {
        icon: '📤',
        title: 'Uploading...',
        description: 'Sending your document securely',
    },
    reading: {
        icon: '📖',
        title: 'Reading...',
        description: 'Extracting text from your document',
    },
    analyzing: {
        icon: '🤖',
        title: 'Analyzing...',
        description: 'AI is reviewing your document',
    },
    complete: {
        icon: '✅',
        title: 'Complete!',
        description: 'Analysis finished successfully',
    },
    error: {
        icon: '❌',
        title: 'Oops!',
        description: 'Something went wrong',
    },
};

export function ProcessingStatus({ stage, message, progress, onRetry }: ProcessingStatusProps) {
    const info = stageInfo[stage];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
        >
            <GlassCard className="p-8 text-center">
                {/* Animated Icon */}
                <motion.div
                    animate={stage !== 'complete' && stage !== 'error' ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: stage !== 'complete' && stage !== 'error' ? Infinity : 0,
                        ease: 'easeInOut',
                    }}
                    className="text-6xl mb-4"
                >
                    {info.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-purple-100 mb-2">
                    {info.title}
                </h3>

                {/* Description */}
                <p className="text-purple-300/80 mb-4">
                    {message || info.description}
                </p>

                {/* Progress Bar */}
                {progress !== undefined && stage !== 'complete' && stage !== 'error' && (
                    <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                        />
                    </div>
                )}

                {/* Retry Button */}
                {stage === 'error' && onRetry && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="mt-4 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 rounded-full text-purple-100 transition-colors"
                    >
                        Try Again
                    </motion.button>
                )}

                {/* Loading Dots */}
                {stage !== 'complete' && stage !== 'error' && (
                    <div className="flex justify-center gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                className="w-2 h-2 bg-purple-400 rounded-full"
                            />
                        ))}
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
}

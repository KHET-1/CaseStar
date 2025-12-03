'use client';
import { useState } from 'react';
import StarfieldGlow from '@/components/StarfieldGlow';
import { FloatingOrb } from '@/components/ui/FloatingOrb';
import DropZone from '@/components/DropZone';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { TimelineView } from '@/components/TimelineView';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument, analyzeDocument, type AnalysisResult } from '@/lib/api';
import { toast } from 'sonner';

type ProcessingStage = 'idle' | 'uploading' | 'reading' | 'analyzing' | 'complete' | 'error';

export default function Home() {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDrop = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0]; // Process first file
    setError(null);
    setResult(null);

    try {
      // Stage 1: Uploading
      setStage('uploading');
      setProgress(0);

      const uploadResult = await uploadDocument(file);
      toast.success('Document uploaded successfully');
      setProgress(33);

      // Stage 2: Reading
      setStage('reading');
      setProgress(50);

      const textToAnalyze = uploadResult.extracted_text || `Document: ${uploadResult.filename}\n(No text extracted)`;

      if (!uploadResult.extracted_text) {
        console.warn('No text extracted from document');
        toast.warning('Could not extract text from document');
      }

      // Short delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(66);

      // Stage 3: Analyzing with AI
      setStage('analyzing');
      const caseId = `case-${Date.now()}`;

      const analysisResult = await analyzeDocument(textToAnalyze, caseId);
      toast.success('AI Analysis Complete!');
      setProgress(100);

      // Stage 4: Complete
      setStage('complete');
      setResult(analysisResult);

      // Auto-transition to showing results
      setTimeout(() => {
        setStage('idle');
      }, 1500);

    } catch (err) {
      setStage('error');
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCloseResults = () => {
    setResult(null);
    setStage('idle');
  };

  const isProcessing = stage !== 'idle' && !result;

  return (
    <>
      <StarfieldGlow />
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <FloatingOrb size="lg" />

        {/* Header - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: isProcessing || result ? 0.8 : 1,
          }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
            CaseStar
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-purple-100/90 font-light">
            AI-powered legal document analysis
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="mt-16 z-10 flex flex-col items-center w-full">
          <AnimatePresence mode="wait">
            {/* Show DropZone when idle */}
            {stage === 'idle' && !result && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col items-center"
              >
                <DropZone onDrop={handleDrop} />

                {/* Helpful hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-purple-300/60 text-sm text-center max-w-md"
                >
                  💡 Drop a legal document (PDF, TXT, or DOCX) and I&apos;ll analyze it for you
                </motion.p>
              </motion.div>
            )}

            {/* Show Processing Status */}
            {isProcessing && (
              <ProcessingStatus
                key="processing"
                stage={stage === 'error' ? 'error' : stage === 'complete' ? 'complete' : stage === 'analyzing' ? 'analyzing' : stage === 'reading' ? 'reading' : 'uploading'}
                message={error || undefined}
                progress={progress}
                onRetry={() => {
                  setStage('idle');
                  setError(null);
                }}
              />
            )}

            {/* Show Results / Timeline Flow */}
            {result && (
              <TimelineView
                key="results"
                result={result}
                onComplete={handleCloseResults}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'idle' ? 0.3 : 0 }}
          className="absolute bottom-12 text-purple-500/30 text-sm"
        >
          Powered by Ollama AI • 100% local processing
        </motion.div>
      </div>
    </>
  );
}

'use client';
import { Stars } from '@/components/ui/Stars';
import { FloatingOrb } from '@/components/ui/FloatingOrb';
import DropZone from '@/components/DropZone';
import { motion } from 'framer-motion';

export default function Home() {
  const handleDrop = (files: File[]) => {
    // TODO: Implement file processing pipeline
    alert(`Received ${files.length} file(s) — processing locally...`);
  };

  return (
    <>
      <Stars />
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <FloatingOrb size="lg" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 2 }}
          className="text-center z-10 mt-20"
        >
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
            CaseStar
          </h1>
          <p className="mt-12 text-3xl text-purple-100/90 font-light">
            Your documents. Your truth. Protected.
          </p>
        </motion.div>

        <div className="mt-32 z-10">
          <DropZone onDrop={handleDrop} />
        </div>

        <div className="absolute bottom-12 text-purple-500/30 text-sm animate-pulse">
          ↑ ↑ ↓ ↓ ← → ← → B A for the void
        </div>
      </div>
    </>
  );
}

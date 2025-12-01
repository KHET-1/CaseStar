'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';

export default function DropZone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const onDropHandler = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropHandler,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
      'text/*': ['.txt', '.doc', '.docx']
    }
  });

  // Separate React event handlers from Motion-compatible props
  // getRootProps() returns React HTML props, but motion.div expects Framer Motion props
  // These event handlers have conflicting type signatures between React and Framer Motion
  const { 
    onAnimationStart: _onAnimationStart, 
    onAnimationEnd: _onAnimationEnd, 
    onDrag: _onDrag, 
    onDragStart: _onDragStart, 
    onDragEnd: _onDragEnd,
    ...rootPropsForMotion 
  } = getRootProps();

  return (
    <motion.div {...rootPropsForMotion}>
      <input {...getInputProps()} />
      <GlassCard className={`
        w-full max-w-4xl p-24 text-center cursor-pointer
        transition-all duration-500
        ${isDragActive 
          ? 'scale-105 border-purple-400/80 shadow-2xl shadow-purple-500/50' 
          : 'border-purple-400/30 hover:border-purple-400/60'
        }
      `}>
        <motion.div
          animate={isDragActive ? { scale: 1.2 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-9xl mb-10"
        >
          {isDragActive ? '✨' : '🌟'}
        </motion.div>
        
        <p className="text-5xl font-extralight text-purple-50 mb-4">
          {isDragActive ? 'Drop your truth here...' : 'Drop files here'}
        </p>
        
        <p className="text-2xl text-purple-300/80">
          {isDragActive 
            ? 'Releasing... we\'ve got you' 
            : 'or click to browse · 100% private · nothing leaves your machine'
          }
        </p>
      </GlassCard>
    </motion.div>
  );
}

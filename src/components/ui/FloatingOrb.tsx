// src/components/ui/FloatingOrb.tsx
'use client';
import { motion } from 'framer-motion';

export function FloatingOrb({ size = "lg" }: { size?: "sm" | "lg" }) {
  const sizes = size === "lg" ? "w-96 h-96" : "w-64 h-64";
  
  return (
    <motion.div
      animate={{ 
        y: [0, -30, 0],
        rotate: [0, 5, 0]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <div className={`${sizes} rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 p-1`}>
        <div className="w-full h-full rounded-full bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-6xl">✦</div>
        </div>
      </div>
      
      {/* Glow rings */}
      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl animate-pulse delay-700" />
    </motion.div>
  )
}

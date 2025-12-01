// src/components/ui/ShootingStar.tsx
'use client';
import { motion } from 'framer-motion';

export function ShootingStar({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: -400, y: -200, opacity: 0, scale: 0 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 1.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 80
      }}
      className="relative"
    >
      {/* Tail */}
      <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 to-purple-600 opacity-60 scale-x-150 -translate-x-full" />
      {children}
    </motion.div>
  )
}

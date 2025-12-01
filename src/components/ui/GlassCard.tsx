// src/components/ui/GlassCard.tsx
import { cn } from '@/lib/utils';

export function GlassCard({ 
  children, 
  className,
  hover = true
}: { 
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl",
      "shadow-2xl shadow-purple-900/20",
      hover && "transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/20 hover:border-purple-500/30",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-cyan-600/10" />
      <div className="relative z-10 p-8">
        {children}
      </div>
    </div>
  )
}

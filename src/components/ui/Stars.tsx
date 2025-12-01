// src/components/ui/Stars.tsx
'use client';

export function Stars() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/20" />
      <div 
        className="absolute inset-0 opacity-60 animate-drift"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                           radial-gradient(2px 2px at 40px 70px, #fff, transparent),
                           radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                           radial-gradient(1px 1px at 130px 80px, #fff, transparent)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  )
}

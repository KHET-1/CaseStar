'use client';

export function Stars() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black to-cyan-950/30" />
      
      {/* Stars layer 1 */}
      <div 
        className="stars absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(1px 1px at 180px 120px, white, transparent),
            radial-gradient(2px 2px at 240px 50px, white, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          animation: 'twinkle 8s ease-in-out infinite'
        }}
      />
      
      {/* Stars layer 2 - different positions */}
      <div 
        className="stars absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 50px 50px, #a78bfa, transparent),
            radial-gradient(1px 1px at 100px 100px, #c4b5fd, transparent),
            radial-gradient(2px 2px at 150px 30px, #e0d4ff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px 250px',
          animation: 'twinkle 6s ease-in-out infinite reverse'
        }}
      />
    </div>
  );
}


import React from 'react';

const FnbText3D: React.FC = () => {
  const text = "FNB69P";
  const depth = 10; // Number of layers for 3D effect

  return (
    <div 
      className="relative flex items-center justify-center neon-crash" 
      style={{ 
        perspective: '1000px', 
        width: '400px', 
        height: '200px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Container for the 3D text */}
      <div 
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Layered text to create 3D depth */}
        {Array.from({ length: depth }).map((_, i) => (
          <span
            key={i}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black italic select-none
              ${i === depth - 1 ? 'text-white' : 'text-mine-orange opacity-80'}
            `}
            style={{
              transform: `translate3d(-50%, -50%, ${i * 4}px)`,
              WebkitTextStroke: i === depth - 1 ? '2px #000' : '1px #FFF',
              textShadow: i === depth - 1 ? '0 0 20px #FF4500' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {text}
          </span>
        ))}
        
        {/* Additional Neon Glow Elements */}
        <div 
          className="absolute -inset-10 border-8 border-mine-blue opacity-30 animate-pulse"
          style={{ transform: 'translateZ(-20px) rotateX(20deg)' }}
        ></div>
        <div 
          className="absolute -inset-4 border-4 border-mine-green opacity-50"
          style={{ transform: 'translateZ(50px) rotateY(-10deg)' }}
        ></div>
      </div>
    </div>
  );
};

export default FnbText3D;

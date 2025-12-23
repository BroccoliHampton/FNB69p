import React from 'react';

const NeonCrash: React.FC = () => {
  return (
    <div 
      className="relative neon-crash" 
      style={{ 
        perspective: '1000px', 
        width: '200px', 
        height: '300px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Crude Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-mine-orange border-4 border-white" 
           style={{ transform: 'translateZ(40px) rotateX(-10deg)' }}>
        {/* Mouth/Muzzle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-[#FFC0CB] border-2 border-black" style={{ transform: 'translateZ(10px)' }}>
          <div className="w-full h-4 bg-white border-b-2 border-black mt-1"></div>
        </div>
        {/* Eyes */}
        <div className="absolute top-4 left-2 w-8 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        <div className="absolute top-4 right-2 w-8 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        {/* Ears */}
        <div className="absolute -top-10 -left-6 w-10 h-16 bg-mine-orange border-4 border-black" style={{ clipPath: 'polygon(100% 100%, 0 100%, 50% 0)' }}></div>
        <div className="absolute -top-10 -right-6 w-10 h-16 bg-mine-orange border-4 border-black" style={{ clipPath: 'polygon(100% 100%, 0 100%, 50% 0)' }}></div>
        {/* Hair spikes */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-600 border-2 border-black rotate-12"></div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-600 border-2 border-black -rotate-12"></div>
      </div>

      {/* Crude Body */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-16 h-32 bg-mine-orange border-4 border-white" style={{ transform: 'translateZ(10px) rotateX(10deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-20 bg-mine-orange brightness-125"></div>
      </div>

      {/* Arms */}
      <div className="absolute top-28 -left-8 w-10 h-24 bg-mine-orange border-2 border-white rotate-[30deg]" style={{ transform: 'translateZ(-10px)' }}></div>
      <div className="absolute top-28 -right-8 w-10 h-24 bg-mine-orange border-2 border-white rotate-[-30deg]" style={{ transform: 'translateZ(-10px)' }}></div>

      {/* Gloves */}
      <div className="absolute top-44 -left-12 w-12 h-12 bg-red-800 border-2 border-black" style={{ transform: 'translateZ(20px)' }}></div>
      <div className="absolute top-44 -right-12 w-12 h-12 bg-red-800 border-2 border-black" style={{ transform: 'translateZ(20px)' }}></div>

      {/* Pants (Blue) */}
      <div className="absolute top-52 left-1/2 -translate-x-1/2 w-20 h-16 bg-mine-blue border-4 border-white" style={{ transform: 'translateZ(30px)' }}></div>

      {/* Legs/Feet */}
      <div className="absolute top-64 left-4 w-12 h-20 bg-mine-orange border-2 border-black"></div>
      <div className="absolute top-64 right-4 w-12 h-20 bg-mine-orange border-2 border-black"></div>
      
      {/* Shoes */}
      <div className="absolute top-80 left-0 w-16 h-8 bg-red-600 border-4 border-black rounded-full" style={{ transform: 'translateZ(40px)' }}></div>
      <div className="absolute top-80 right-0 w-16 h-8 bg-red-600 border-4 border-black rounded-full" style={{ transform: 'translateZ(40px)' }}></div>
    </div>
  );
};

export default NeonCrash;

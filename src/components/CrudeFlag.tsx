
import React from 'react';

const CrudeFlag: React.FC = () => {
  const segments = 15;
  const flagWidth = 300;
  const flagHeight = 160;
  const segmentWidth = flagWidth / segments;

  return (
    <div 
      className="relative flex" 
      style={{ 
        perspective: '1000px', 
        width: `${flagWidth}px`, 
        height: `${flagHeight}px`,
        transformStyle: 'preserve-3d',
        transform: 'rotateX(10deg) rotateY(-10deg)'
      }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="flag-segment relative h-full flex flex-col overflow-hidden"
          style={{
            width: `${segmentWidth}px`,
            animationDelay: `${i * 0.15}s`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Stripes */}
          {Array.from({ length: 13 }).map((_, s) => (
            <div
              key={s}
              style={{
                height: `${100 / 13}%`,
                backgroundColor: s % 2 === 0 ? '#B22234' : '#FFFFFF',
                width: '100%'
              }}
            />
          ))}
          
          {/* Blue Canton (Union) - only on the first 6 segments and top 7 stripes */}
          {i < 6 && (
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${(7 / 13) * 100}%`,
                backgroundColor: '#3C3B6E',
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'start',
                padding: '1px'
              }}
            >
              {/* Crude Stars as dots */}
              {Array.from({ length: 8 }).map((_, star) => (
                <div 
                  key={star} 
                  className="bg-white rounded-full m-0.5" 
                  style={{ width: '3px', height: '3px' }} 
                />
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Flag Pole (Crude) */}
      <div 
        className="absolute top-0 -left-4 w-4 bg-mine-blue border-2 border-black" 
        style={{ height: '300px', zIndex: -1 }}
      />
    </div>
  );
};

export default CrudeFlag;

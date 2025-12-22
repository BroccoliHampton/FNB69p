
import React from 'react';

interface DataBlockProps {
  label: string;
  value: string | number;
  subValue?: string;
  bgColor: 'blue' | 'orange' | 'green';
  textColor: 'blue' | 'orange' | 'green';
}

const DataBlock: React.FC<DataBlockProps> = ({ label, value, subValue, bgColor, textColor }) => {
  const bgClass = `bg-mine-${bgColor}`;
  const textClass = `text-mine-${textColor}`;
  
  return (
    <div className={`${bgClass} border-4 border-black p-4 flex flex-col justify-between h-full`}>
      <span className="text-xs font-bold uppercase tracking-tighter mix-blend-difference invert opacity-70">
        {label}
      </span>
      <div className="mt-2">
        <h2 className={`text-3xl font-black ${textClass} bg-black inline-block px-1`}>
          {value}
        </h2>
        {subValue && (
          <p className="text-sm font-mono mt-1 mix-blend-difference invert">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default DataBlock;

import React from 'react';

interface SenaiLogoProps {
  className?: string;
  variant?: 'full' | 'badge' | 'white';
}

export const SenaiLogo: React.FC<SenaiLogoProps> = ({
  className = 'h-7',
  variant = 'full',
}) => {
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-[#004A99] text-white px-2.5 py-0.5 rounded font-black tracking-widest text-xs select-none shadow-xs ${className}`}>
        <span className="font-sans font-black italic tracking-tighter text-sm">SENAI</span>
      </div>
    );
  }

  // Official high-fidelity vector SENAI Logomark
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 160 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Background container / Pill */}
        <rect width="160" height="44" rx="4" fill="#004A99" />
        {/* S */}
        <text
          x="12"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="26"
          fontWeight="900"
          fontStyle="italic"
          fill="#FFFFFF"
          letterSpacing="2px"
        >
          SENAI
        </text>
        {/* Decorative Brazilian industry accents */}
        <rect x="138" y="10" width="8" height="24" rx="2" fill="#E31837" />
        <rect x="148" y="10" width="4" height="24" rx="1" fill="#FFCC00" />
      </svg>
    </div>
  );
};


import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

const SecandoLogo: React.FC<LogoProps> = ({ className = "h-16", showText = true, variant = 'dark' }) => {
  const primaryColor = variant === 'dark' ? '#0066ff' : '#ffffff';
  const textColor = variant === 'dark' ? '#000b1a' : '#ffffff';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="dropGradient" x1="200" y1="80" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3399ff" />
            <stop offset="100%" stopColor="#0066ff" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Steam Lines */}
        <path d="M190 60 Q195 50 190 40" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.6">
          <animate attributeName="d" values="M190 60 Q195 50 190 40; M190 60 Q185 50 190 40; M190 60 Q195 50 190 40" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M200 55 Q205 45 200 35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.8">
          <animate attributeName="d" values="M200 55 Q205 45 200 35; M200 55 Q195 45 200 35; M200 55 Q205 45 200 35" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M210 60 Q215 50 210 40" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" opacity="0.6">
          <animate attributeName="d" values="M210 60 Q215 50 210 40; M210 60 Q205 50 210 40; M210 60 Q215 50 210 40" dur="3.2s" repeatCount="indefinite" />
        </path>

        {/* Open Book */}
        <path
          d="M200 200 L70 180 V100 C70 100 130 120 200 120 C270 120 330 100 330 100 V180 L200 200Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path d="M200 120 V200" stroke={primaryColor} strokeWidth="8" strokeLinecap="round" />
        
        {/* Page Lines */}
        <path d="M100 130 H160" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M100 145 H160" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M100 160 H160" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        
        <path d="M240 130 H300" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M240 145 H300" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M240 160 H300" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" opacity="0.5" />

        {/* The Drop */}
        <path
          d="M200 80 C180 120 165 150 165 170 C165 190 180 205 200 205 C220 205 235 190 235 170 C235 150 220 120 200 80Z"
          fill="url(#dropGradient)"
          stroke={primaryColor}
          strokeWidth="4"
        />
        
        {/* Inner Sphere */}
        <circle cx="200" cy="170" r="22" fill="#0044aa" />
        <circle cx="192" cy="162" r="6" fill="white" opacity="0.4" />

        {/* Text */}
        {showText && (
          <text
            x="200"
            y="270"
            textAnchor="middle"
            fill={textColor}
            style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}
          >
            Secando a Lei
          </text>
        )}
      </svg>
    </div>
  );
};

export default SecandoLogo;

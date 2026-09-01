import React from 'react';

interface CertificationBadgeProps {
  courseName?: string;
  badgeSubtitle?: string;
  organizationName?: string;
  organizationSubtitle?: string;
  issueYear?: string | number;
  credentialText?: string;
  size?: number;
  className?: string;
}

export const CertificationBadge: React.FC<CertificationBadgeProps> = ({
  courseName = "DATA ANALYSIS",
  badgeSubtitle = "CERTIFICATION BADGE",
  organizationName = "Piston & Fusion",
  organizationSubtitle = "Business Academy",
  issueYear = "2026",
  credentialText = "Professional Training Credential",
  size = 400,
  className = "",
}) => {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <svg viewBox="0 0 800 800" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="inner-disc-clip">
            <circle cx="400" cy="400" r="320" />
          </clipPath>
        </defs>
        
        {/* Outer Rosette & Disc */}
        <circle cx="400" cy="400" r="370" fill="#004899" />
        <circle cx="400" cy="400" r="320" fill="#ffffff" stroke="#004899" strokeWidth="3" />
        <circle cx="400" cy="400" r="312" fill="none" stroke="#004899" strokeWidth="1" opacity="0.4" />
        
        <g clipPath="url(#inner-disc-clip)">
          {/* Academy Brand Header */}
          <g transform="translate(262, 230)">
            <rect width="110" height="110" fill="#004899" rx="2" />
            <polygon points="0,110 0,86 24,110" fill="#dc2626" />
            <circle cx="68" cy="44" r="16" fill="none" stroke="#fff" strokeWidth="2.5" />
            <path d="M 61,56 L 56,74 L 64,70 L 72,74 L 67,58" fill="#fff" />
            
            <text x="126" y="52" fill="#004899" fontSize="26" fontWeight="700" fontFamily="sans-serif">{organizationName}</text>
            <text x="126" y="94" fill="#004899" fontSize="21" fontWeight="500" fontFamily="sans-serif">{organizationSubtitle}</text>
            <line x1="126" y1="104" x2="310" y2="104" stroke="#004899" strokeWidth="1.2" opacity="0.3" />
          </g>
          
          {/* Course Banner */}
          <g transform="translate(0, 375)">
            <rect x="78" y="0" width="644" height="92" fill="#004899" />
            <text x="400" y="40" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.8">{courseName.toUpperCase()}</text>
            <text x="400" y="74" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="700" fontStyle="italic" fontFamily="sans-serif" letterSpacing="3.5">{badgeSubtitle.toUpperCase()}</text>
          </g>
          
          {/* Gold Stars */}
          <text x="400" y="540" textAnchor="middle" fill="#f59e0b" fontSize="24">★ ★ ★</text>
          
          {/* Credential Script */}
          <text x="400" y="592" textAnchor="middle" fill="#004899" fontFamily="cursive" fontSize="33">{credentialText}</text>
          
          {/* Issue Year Pill */}
          <g transform="translate(400, 640)">
            <rect x="-82" y="-18" width="164" height="30" fill="#ffffff" stroke="#004899" strokeWidth="1.8" rx="2" />
            <text x="0" y="3" textAnchor="middle" fill="#004899" fontSize="14" fontWeight="600" fontFamily="sans-serif">Issued Year : {issueYear}</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

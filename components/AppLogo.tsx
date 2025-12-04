import React from 'react';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none"
    >
      {/* Fond Circulaire */}
      <circle cx="50" cy="50" r="48" fill="#4F46E5" fillOpacity="0.1" stroke="#4F46E5" strokeWidth="2" />
      
      {/* Document / Formulaire */}
      <rect x="28" y="24" width="44" height="52" rx="4" fill="white" stroke="#334155" strokeWidth="4" />
      
      {/* Lignes du document */}
      <line x1="38" y1="36" x2="62" y2="36" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="46" x2="62" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="56" x2="50" y2="56" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

      {/* Flèche Circulaire (Cycle Annuel) - Orange/Ambre pour le dynamisme */}
      <path 
        d="M78 50C78 65.464 65.464 78 50 78C40.5 78 32.5 73.5 27 66" 
        stroke="#F59E0B" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M27 66L34 66" 
        stroke="#F59E0B" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M27 66L27 59" 
        stroke="#F59E0B" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Coche de validation (Succès) - Vert émeraude */}
      <circle cx="68" cy="70" r="14" fill="#10B981" stroke="white" strokeWidth="3" />
      <path 
        d="M62 70L66 74L74 66" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AppLogo;

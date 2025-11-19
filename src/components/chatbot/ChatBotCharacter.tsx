"use client";

interface ChatBotCharacterProps {
  size?: number;
  className?: string;
  animated?: boolean;
  showBubble?: boolean; // ✅ New prop
}

const ChatBotCharacter = ({ 
  size = 64, 
  className = "",
  animated = false,
  showBubble = true, // ✅ Default to true
}: ChatBotCharacterProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f0f9ff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <line x1="60" y1="5" x2="60" y2="18" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="3" r="4" fill="#3b82f6">
        {animated && (
          <animate
            attributeName="r"
            values="4;5;4"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Robot Head/Body - Larger and positioned higher */}
      <circle cx="60" cy="60" r="45" fill="url(#robotGradient)" stroke="#2563eb" strokeWidth="2" />
      
      {/* Headset Left */}
      <path
        d="M 20 55 Q 16 60 20 65"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="13" y="57" width="7" height="12" rx="2" fill="#1e40af" />

      {/* Headset Right */}
      <path
        d="M 100 55 Q 104 60 100 65"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="100" y="57" width="7" height="12" rx="2" fill="#1e40af" />

      {/* Face plate */}
      <rect 
        x="30" 
        y="42" 
        width="60" 
        height="40" 
        rx="10" 
        fill="url(#faceGradient)" 
        stroke="#3b82f6" 
        strokeWidth="2"
      />

      {/* Eyes - NO ANIMATION */}
      <circle cx="48" cy="58" r="6" fill="#3b82f6" />
      <circle cx="72" cy="58" r="6" fill="#3b82f6" />

      {/* Eye highlights */}
      <circle cx="50" cy="56" r="2.5" fill="white" />
      <circle cx="74" cy="56" r="2.5" fill="white" />

      {/* Smile */}
      <path
        d="M 42 70 Q 60 78 78 70"
        stroke="#3b82f6"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Speech bubble - ✅ Only show if showBubble is true */}
      {showBubble && (
        <g>
          {/* Bubble shadow */}
          <rect 
            x="6" 
            y="6" 
            width="50" 
            height="32" 
            rx="10" 
            fill="#000000" 
            opacity="0.1"
          />
          
          {/* Main bubble - YELLOW */}
          <rect 
            x="5" 
            y="5" 
            width="50" 
            height="32" 
            rx="10" 
            fill="#fbbf24" 
            stroke="#f59e0b" 
            strokeWidth="2"
          />
          
          {/* Bubble tail */}
          <path
            d="M 40 37 L 45 47 L 34 37 Z"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Typing dots */}
          <circle cx="18" cy="21" r="3" fill="#ffffff">
            {animated && (
              <animate
                attributeName="cy"
                values="21;18;21"
                dur="1s"
                repeatCount="indefinite"
                begin="0s"
              />
            )}
          </circle>
          <circle cx="30" cy="21" r="3" fill="#ffffff">
            {animated && (
              <animate
                attributeName="cy"
                values="21;18;21"
                dur="1s"
                repeatCount="indefinite"
                begin="0.2s"
              />
            )}
          </circle>
          <circle cx="42" cy="21" r="3" fill="#ffffff">
            {animated && (
              <animate
                attributeName="cy"
                values="21;18;21"
                dur="1s"
                repeatCount="indefinite"
                begin="0.4s"
              />
            )}
          </circle>
        </g>
      )}

      {/* Body/Neck */}
      <rect 
        x="52" 
        y="85" 
        width="16" 
        height="20" 
        rx="3" 
        fill="#3b82f6" 
        stroke="#2563eb" 
        strokeWidth="2"
      />

      {/* Body details */}
      <line x1="56" y1="90" x2="56" y2="100" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <line x1="64" y1="90" x2="64" y2="100" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="56" cy="102" r="2" fill="#60a5fa" />
      <circle cx="64" cy="102" r="2" fill="#60a5fa" />
    </svg>
  );
};

export default ChatBotCharacter;
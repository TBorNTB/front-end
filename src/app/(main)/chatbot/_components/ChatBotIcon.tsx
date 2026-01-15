"use client";

interface ChatBotIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
  showBubble?: boolean; 
}

const ChatBotIcon = ({ 
  size = 80, 
  className = "",
  animated = false,
  showBubble = true, 
}: ChatBotIconProps) => {
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

      {/* Chatbot Icon - embedded as foreignObject */}
      <foreignObject x="3" y="10" width="120" height="100">
        <img src="/icon/chatbot.svg" alt="Chatbot" style={{ width: '100%', height: '100%' }} />
      </foreignObject>

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
    </svg>
  );
};

export default ChatBotIcon;
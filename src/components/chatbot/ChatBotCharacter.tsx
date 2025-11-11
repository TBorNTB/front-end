"use client";

interface ChatBotCharacterProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const ChatBotCharacter = ({ 
  size = 32, 
  className = "",
  animated = false 
}: ChatBotCharacterProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="currentColor"
        className={animated ? "animate-pulse-subtle" : ""}
      />
      
      {/* Face - Eyes (bigger and friendlier) */}
      <circle cx="24" cy="28" r="4" fill="white" />
      <circle cx="40" cy="28" r="4" fill="white" />
      {/* Eye highlights */}
      <circle cx="25" cy="27" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="41" cy="27" r="1.5" fill="currentColor" opacity="0.6" />
      
      {/* Face - Smile (bigger and happier) */}
      <path
        d="M 22 38 Q 32 46 42 38"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Chat bubble decoration (more visible) */}
      <circle cx="50" cy="14" r="10" fill="currentColor" opacity="0.4" />
      <circle cx="52" cy="12" r="4" fill="currentColor" opacity="0.7" />
      <circle cx="53" cy="11" r="1.5" fill="white" />
    </svg>
  );
};

export default ChatBotCharacter;


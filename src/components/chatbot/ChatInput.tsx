"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="SSG에 대해 물어보세요..."
          rows={1}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm bg-white"
          style={{
            minHeight: "48px",
            maxHeight: "120px",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatInput;


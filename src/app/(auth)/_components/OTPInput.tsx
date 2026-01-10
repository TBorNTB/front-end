// app/(main)/(auth)/components/OTPInput.tsx
"use client";

import { getOTPInputClassName } from '@/lib/form-utils';
import { useEffect, useRef, useState } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  onComplete,
  hasError = false,
  disabled = false,
  autoFocus = false
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const padded = (value ?? '').toString().slice(0, length).padEnd(length, ' ');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Safely pad the current value for fixed-length rendering
  const getPadded = () => (value ?? '').toString().slice(0, length).padEnd(length, ' ');

  const handleChange = (index: number, raw: string) => {
    // Allow alphanumeric (A-Z, 0-9), keep only the last entered char
    const char = raw.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    if (!char) return;

    const padded = getPadded();
    const nextChars = padded.split('');
    nextChars[index] = char;
    const updatedValue = nextChars.join('').replace(/\s+$/, '');

    onChange(updatedValue);

    // Auto-focus next input when a char is entered
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    if (updatedValue.length === length) {
      onComplete?.(updatedValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    const padded = getPadded();

    if (e.key === 'Backspace') {
      e.preventDefault();
      const nextChars = padded.split('');
      if (nextChars[index] !== ' ') {
        // Clear current cell
        nextChars[index] = ' ';
        onChange(nextChars.join('').replace(/\s+$/, ''));
      } else if (index > 0) {
        // Move left and clear previous cell
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        nextChars[index - 1] = ' ';
        onChange(nextChars.join('').replace(/\s+$/, ''));
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, length);

    if (!pasted) return;

    const nextValue = pasted;
    onChange(nextValue);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(nextValue.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
    
    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="text"
          pattern="[a-zA-Z0-9]*"
          maxLength={1}
          value={(padded[index] && padded[index] !== ' ') ? padded[index] : ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setActiveIndex(index)}
          disabled={disabled}
          className={getOTPInputClassName(hasError, activeIndex === index) + " caret-primary-600"}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
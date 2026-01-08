// app/(main)/(auth)/components/OTPInput.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { getOTPInputClassName } from '@/lib/form-utils';

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

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, char: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(char)) return; // Allow alphanumeric

    const newValue = value.split('');
    newValue[index] = char.toUpperCase(); // 대문자로 변환
    const updatedValue = newValue.join('').slice(0, length);
    
    onChange(updatedValue);
    
    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
    
    // Call onComplete when all digits are entered
    if (updatedValue.length === length) {
      onComplete?.(updatedValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
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
    const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, length);
    onChange(pastedData);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
    
    if (pastedData.length === length) {
      onComplete?.(pastedData);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9a-zA-Z]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setActiveIndex(index)}
          disabled={disabled}
          className={getOTPInputClassName(hasError, activeIndex === index)}
          autoComplete="one-time-code"
          placeholder="0"
        />
      ))}
    </div>
  );
}

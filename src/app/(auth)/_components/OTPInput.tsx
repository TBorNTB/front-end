// app/(main)/(auth)/components/OTPInput.tsx
"use client";

import { getOTPInputClassName } from '@/lib/form-utils';
import { useEffect, useRef, useState } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value = '',
  onChange, 
  onComplete,
  onBlur,
  hasError = false,
  disabled = false,
  autoFocus = false
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Use local state for immediate display, independent of form validation
  // This is the source of truth for what the user sees
  const [displayValue, setDisplayValue] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Sync displayValue with form value when form updates externally (e.g., paste)
  useEffect(() => {
    if (value && value.length > displayValue.length) {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (index: number, inputValue: string) => {
    // Get only the last character and validate it's alphanumeric
    const char = inputValue.slice(-1).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (!char) return;

    // Build new value based on displayValue (what user sees)
    const chars = displayValue.split('');
    chars[index] = char;
    const newValue = chars.join('').substring(0, length);

    // Update display immediately (user sees character instantly)
    setDisplayValue(newValue);
    
    // Also update form (for submission)
    onChange(newValue);

    // Auto-focus next input
    if (index < length - 1 && newValue.length > index) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }, 0);
    }

    // Call onComplete if full
    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = displayValue.split('');
      
      if (chars[index]) {
        chars[index] = '';
        const newValue = chars.join('');
        setDisplayValue(newValue);
        onChange(newValue);
      } else if (index > 0) {
        chars[index - 1] = '';
        const newValue = chars.join('');
        setDisplayValue(newValue);
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
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
      .substring(0, length);

    if (pasted) {
      setDisplayValue(pasted);
      onChange(pasted);
      
      const nextIndex = Math.min(pasted.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);
      }, 0);
      
      if (pasted.length === length) {
        onComplete?.(pasted);
      }
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }, (_, index) => {
        // Priority: displayValue (what user typed) > value prop (from form) > empty
        // displayValue is the source of truth for what the user sees
        const char = displayValue[index] || '';
        
        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="text"
            pattern="[a-zA-Z0-9]*"
            maxLength={1}
            value={char}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => {
              if (index === length - 1) onBlur?.();
            }}
            disabled={disabled}
            className={getOTPInputClassName(hasError, activeIndex === index) + " caret-primary-600"}
            autoComplete="one-time-code"
          />
        );
      })}
    </div>
  );
}
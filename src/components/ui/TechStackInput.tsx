'use client';

import { useCallback, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

function normalizeTechStackLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const lowered = trimmed.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

function parseTechStack(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => normalizeTechStackLabel(s))
    .filter(Boolean);
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export interface TechStackInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  onMaxLengthExceeded?: () => void;
}

export function TechStackInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  maxLength = 255,
  onMaxLengthExceeded,
}: TechStackInputProps) {
  const tags = useMemo(() => uniqueCaseInsensitive(parseTechStack(value)), [value]);
  const [draft, setDraft] = useState('');

  const commitDraft = useCallback(
    (raw: string) => {
      const normalized = normalizeTechStackLabel(raw);
      if (!normalized) return;

      const nextTags = uniqueCaseInsensitive([...tags, normalized]);
      const nextValue = nextTags.join(', ');

      if (maxLength && nextValue.length > maxLength) {
        onMaxLengthExceeded?.();
        return;
      }

      onChange(nextValue);
      setDraft('');
    },
    [maxLength, onChange, onMaxLengthExceeded, tags]
  );

  const removeTag = useCallback(
    (label: string) => {
      const nextTags = tags.filter((t) => t.toLowerCase() !== label.toLowerCase());
      onChange(nextTags.join(', '));
    },
    [onChange, tags]
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commitDraft(draft);
          }
          if (e.key === 'Backspace' && !draft && tags.length > 0) {
            // Quick remove last tag
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={() => {
          // Commit any pending text on blur
          if (draft.trim()) commitDraft(draft);
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <span className="text-xs">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-sm hover:bg-black/5"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Hidden input value guide (optional) */}
      {maxLength ? (
        <div className="text-xs text-gray-700">
          {value.length}/{maxLength}
        </div>
      ) : null}
    </div>
  );
}

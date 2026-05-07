'use client';

/**
 * BaseSearchInput — combined ZIP code / military base name input with autocomplete.
 *
 * Behavior:
 *   - Digit-first input → ZIP mode (strips non-digits, caps at 5, calls onZipChange when complete)
 *   - Letter-first input → base search mode (shows installation dropdown)
 *   - On selection → fills with base name, calls onZipChange(base.zip)
 *
 * Parent holds the resolved 5-digit ZIP via `value`. Display text is internal state.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { searchStations } from '@/lib/stationSearch';
import { getLocationName, isZipInDataset, isTerritory } from '@/lib/calculations/bah';
import type { DutyStation } from '@/data/duty-stations/stations';

export interface BaseSearchInputProps {
  label: string;
  /** Explicit HTML id for the input (auto-derived from label if omitted). */
  id?: string;
  /** The resolved 5-digit ZIP code (parent-controlled). '' when unresolved. */
  value: string;
  onZipChange: (zip: string) => void;
  placeholder?: string;
  /** Static hint shown when no dynamic hint applies. */
  hint?: string;
  /** Exclude OCONUS installations from suggestions (default true — they use OHA, not BAH). */
  excludeOconus?: boolean;
  className?: string;
}

export function BaseSearchInput({
  label,
  id: idProp,
  value,
  onZipChange,
  placeholder = 'Enter ZIP code or base name (e.g. 78234 or Fort Liberty)',
  hint,
  excludeOconus = true,
  className,
}: BaseSearchInputProps) {
  const inputId = idProp ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const [text, setText] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track whether the user has interacted so we don't clobber their input
  // when a parent sets an initial value after mount (e.g. from URL params).
  const userHasInteracted = useRef(false);

  useEffect(() => {
    if (value && !userHasInteracted.current) setText(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isNumericMode = text !== '' && /^\d/.test(text);

  const suggestions = useMemo(
    () => (!isNumericMode && text.length >= 2 ? searchStations(text, excludeOconus) : []),
    [text, isNumericMode, excludeOconus],
  );

  const showDropdown = open && suggestions.length > 0;

  // Feedback derived from the resolved ZIP value
  const feedback = useMemo((): { kind: 'error' | 'location' | null; msg: string } => {
    if (value.length !== 5) return { kind: null, msg: '' };
    if (isTerritory(value))
      return { kind: 'error', msg: 'U.S. territory ZIP — BAH does not apply (OHA area)' };
    if (!isZipInDataset(value))
      return { kind: 'error', msg: 'ZIP code not found in BAH dataset' };
    const loc = getLocationName(value);
    return loc ? { kind: 'location', msg: `📍 ${loc}` } : { kind: null, msg: '' };
  }, [value]);

  function handleChange(raw: string) {
    userHasInteracted.current = true;
    if (raw === '') {
      setText('');
      setOpen(false);
      onZipChange('');
      return;
    }

    if (/^\d/.test(raw)) {
      // ZIP mode — digits only, max 5
      const digits = raw.replace(/\D/g, '').slice(0, 5);
      setText(digits);
      setOpen(false);
      setHighlighted(0);
      onZipChange(digits.length === 5 ? digits : '');
    } else {
      // Base name search mode
      setText(raw);
      setOpen(true);
      setHighlighted(0);
      onZipChange('');
    }
  }

  function selectStation(s: DutyStation) {
    setText(s.name);
    setOpen(false);
    onZipChange(s.zip);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlighted]) selectStation(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Close on outside interaction
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasError = feedback.kind === 'error';

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode={isNumericMode ? 'numeric' : 'text'}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        className={[
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900',
          'placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors',
          hasError
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-zinc-300 focus:ring-red-600 focus:border-red-600',
        ].join(' ')}
      />

      {/* Inline feedback */}
      {feedback.kind === 'error' && (
        <p className="text-xs text-red-600 mt-1">{feedback.msg}</p>
      )}
      {feedback.kind === 'location' && !showDropdown && (
        <p className="text-xs text-zinc-500 mt-1">{feedback.msg}</p>
      )}
      {feedback.kind === null && hint && !showDropdown && (
        <p className="text-xs text-zinc-500 mt-1">{hint}</p>
      )}

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <ul
          role="listbox"
          aria-label="Military installations"
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden max-h-72 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li key={s.slug} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                // onMouseDown (not onClick) prevents the input blur from firing before selection
                onMouseDown={(e) => { e.preventDefault(); selectStation(s); }}
                onTouchEnd={(e) => { e.preventDefault(); selectStation(s); }}
                className={[
                  'w-full text-left px-4 py-3 flex items-start justify-between gap-3',
                  'min-h-[52px] transition-colors', // 52px ≥ 44px touch target
                  i > 0 ? 'border-t border-zinc-100' : '',
                  i === highlighted
                    ? 'bg-red-50'
                    : 'hover:bg-zinc-50 active:bg-zinc-100',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 leading-tight truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-tight">
                    {s.city}, {s.state}
                    {s.formerName ? ` · fmr. ${s.formerName}` : ''}
                    {' · '}{s.branches.join('/')}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono flex-none mt-0.5 tabular-nums">
                  {s.zip}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

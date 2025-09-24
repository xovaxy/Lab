import { useEffect, useRef, useState } from 'react';

export interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  className?: string;
}

// Themed, accessible dropdown with keyboard support and mobile-friendly sizing
export function Dropdown<T extends string = string>({ label, value, onChange, options, placeholder = 'Select...', className = '' }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(() => Math.max(0, options.findIndex(o => o.value === value)));
  const listRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setHighlight(Math.max(0, options.findIndex(o => o.value === value)));
  }, [value, options]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight(h => Math.min(options.length - 1, h + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight(h => Math.max(0, h - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = options[highlight];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
          btnRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, options, highlight, onChange]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (listRef.current && !listRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm text-text-secondary mb-2">{label}</label>}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full glass rounded-lg border border-white/10 px-3 py-2 text-left flex items-center justify-between"
      >
        <span className={selected ? 'text-white' : 'text-text-secondary'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
      </button>
      {open && (
        <div ref={listRef} className="mt-2 glass rounded-lg border border-white/10 max-h-60 overflow-auto no-scrollbar">
          {options.map((opt, i) => {
            const active = opt.value === value;
            const isHighlight = i === highlight;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={active}
                className={`w-full text-left px-3 py-2 transition-colors ${
                  active ? 'bg-[rgba(0,245,212,0.2)] text-white' : isHighlight ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/10'
                }`}
                onClick={() => { onChange(opt.value); setOpen(false); btnRef.current?.focus(); }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;

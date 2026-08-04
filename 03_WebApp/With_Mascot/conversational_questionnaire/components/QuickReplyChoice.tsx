"use client";

import { useRef } from "react";

export interface Choice {
  value: string;
  label: string;
}

/**
 * Quick replies for a single-choice context question.
 *
 * Same radiogroup contract as the scale — one tab stop, arrows that clamp — but
 * stacked, because these options are sentences rather than points on a
 * continuum and there is no meaningful order to move along.
 */
export default function QuickReplyChoice({
  options,
  value,
  onSelect,
  disabled = false,
  labelledBy,
  testIdPrefix,
}: {
  options: Choice[];
  value: string | undefined;
  onSelect: (value: string) => void;
  disabled?: boolean;
  labelledBy: string;
  testIdPrefix: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), options.length - 1);
    if (next !== from) refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        refs.current[options.length - 1]?.focus();
        break;
    }
  };

  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2">
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={i === tabStop ? 0 : -1}
            disabled={disabled}
            data-testid={`${testIdPrefix}-${option.value}`}
            onClick={() => onSelect(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={[
              "flex min-h-[48px] items-center gap-3 rounded-control border px-4 py-3 text-left text-sm transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-mint bg-mint/10 font-semibold text-ink shadow-[var(--shadow-selected)]"
                : "border-line bg-surface text-muted hover:border-muted/70 hover:text-ink",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                active ? "border-mint bg-mint" : "border-muted/50",
              ].join(" ")}
            >
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-mintInk" /> : null}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

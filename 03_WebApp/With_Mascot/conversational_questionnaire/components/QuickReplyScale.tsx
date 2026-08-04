"use client";

import { useEffect, useRef } from "react";
import { emotionForValue, mascotFaceSrc } from "@/lib/mascot/states";

/** Labels arrive already localised — this component knows nothing about i18n. */
export interface ScaleChoice {
  value: number;
  label: string;
}

/**
 * Quick replies for a five-point interest question.
 *
 * The interaction contract is copied deliberately from
 * `components/assessment/LikertScale.tsx`, which already gets this right: a real
 * radiogroup, roving tabindex so the group is one tab stop, and arrow keys that
 * **clamp rather than wrap** — wrapping meant pressing Left on "strongly
 * dislike" selected "strongly like", the opposite of what the key asked for.
 *
 * Selection is signalled three ways — ring, filled dot, and the answer echoed
 * as text into the transcript — so it never depends on colour.
 *
 * The mascot face appears from `sm:` up only. On a narrow screen the row is a
 * vertical stack and a face would land under the 96px the character needs to be
 * readable, which would add colour without adding meaning.
 */
export default function QuickReplyScale({
  options,
  value,
  onSelect,
  disabled = false,
  labelledBy,
  testIdPrefix,
}: {
  options: ScaleChoice[];
  value: number | undefined;
  onSelect: (value: number) => void;
  disabled?: boolean;
  labelledBy: string;
  testIdPrefix: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  /*
   * Number keys answer directly.
   *
   * Thirty questions is thirty trips to the pointer, or four key presses each
   * with the arrow keys. Pressing "4" is one. The labels carry the number so
   * this is discoverable rather than hidden.
   *
   * Guarded so it cannot fire while someone is typing into the free-text
   * question, and so it never swallows a browser or screen-reader shortcut.
   */
  useEffect(() => {
    if (disabled) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      const n = Number(e.key);
      if (!Number.isInteger(n)) return;
      const option = options.find((o) => o.value === n);
      if (!option) return;

      e.preventDefault();
      onSelect(option.value);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, onSelect, disabled]);

  const move = (from: number, delta: number) => {
    const next = Math.min(Math.max(from + delta, 0), options.length - 1);
    if (next === from) return;
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
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

  const dotSize = ["h-3 w-3", "h-[17px] w-[17px]", "h-[22px] w-[22px]", "h-[27px] w-[27px]", "h-8 w-8"];

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-2"
    >
      {options.map((option, i) => {
        const active = option.value === value;
        const emotion = emotionForValue(option.value);
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
              "group flex min-h-[52px] items-center gap-3 rounded-control border px-4 py-3 text-left transition-all duration-200",
              "sm:min-h-[132px] sm:flex-col sm:justify-center sm:gap-2 sm:px-2 sm:py-3 sm:text-center",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "motion-safe:active:scale-[0.97]",
              active
                ? "border-mint bg-mint/10 shadow-[var(--shadow-selected-lift)] sm:-translate-y-0.5"
                : "border-line bg-surface hover:border-muted/70 motion-safe:hover:-translate-y-0.5",
            ].join(" ")}
          >
            {emotion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mascotFaceSrc(emotion)}
                alt=""
                aria-hidden
                width={88}
                height={72}
                className={[
                  "hidden w-[88px] shrink-0 transition-all duration-200 sm:block",
                  active ? "opacity-100 motion-safe:scale-105" : "opacity-75 group-hover:opacity-100",
                ].join(" ")}
              />
            ) : null}

            <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center sm:hidden">
              <span
                className={[
                  "grid place-items-center rounded-full border-2 transition-all duration-200",
                  dotSize[i] ?? "h-5 w-5",
                  active ? "border-mint bg-mint" : "border-muted/50 bg-transparent",
                ].join(" ")}
              >
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-mintInk" /> : null}
              </span>
            </span>

            <span
              className={[
                "text-sm font-semibold leading-tight transition-colors sm:text-[12px]",
                active ? "text-ink" : "text-muted group-hover:text-ink",
              ].join(" ")}
            >
              {/* The number is the keyboard shortcut and the scale point at
                  once, so the hint needs no separate legend. */}
              <span aria-hidden className="mr-1 opacity-60">
                {option.value}
              </span>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

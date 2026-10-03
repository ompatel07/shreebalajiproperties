"use client";

import { useId } from "react";

import { formatPrice, groupIndian } from "@/lib/format";
import { cn, parseRupees } from "@/lib/utils";

/**
 * Calculator inputs.
 *
 * The pairing matters: every money field has BOTH a text box and a slider.
 * Someone who knows their number types it; someone exploring drags. Offering
 * only a slider makes an exact figure impossible to enter, and only a text
 * box makes exploration tedious.
 *
 * The text box accepts what people actually type — "1.2cr", "85 lakh",
 * "45,00,000" — via `parseRupees`.
 */

export function MoneyField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  quick,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
  /** Preset chips — faster than dragging to a round number. */
  quick?: number[];
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase"
        >
          {label}
        </label>
        <output className="font-display text-[1.0625rem] text-ink tabular-nums" data-numeric>
          {formatPrice(value)}
        </output>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          aria-hidden
          className="shrink-0 font-mono text-caption text-ink-faint"
        >
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={groupIndian(value)}
          onChange={(e) => {
            const parsed = parseRupees(e.target.value);
            if (parsed !== null) onChange(Math.min(max, Math.max(0, parsed)));
            else if (e.target.value.trim() === "") onChange(0);
          }}
          className="w-full rounded-[2px] border border-rule-strong bg-paper px-3 py-2.5 text-[0.9375rem] text-ink tabular-nums focus:border-brass focus:outline-none"
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-rule-strong"
        style={{ accentColor: "var(--color-brass)" }}
      />

      {quick && quick.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange(q)}
              className={cn(
                "rounded-[2px] border px-2.5 py-1 font-mono text-[0.5625rem] tracking-[0.08em] transition-colors",
                value === q
                  ? "border-ink bg-ink text-bone"
                  : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {formatPrice(q)}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="mt-2 text-[0.75rem] leading-snug text-ink-faint">{hint}</p>}
    </div>
  );
}

export function SliderField({
  label,
  value,
  display,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase"
        >
          {label}
        </label>
        <output className="font-display text-[1.0625rem] text-ink tabular-nums" data-numeric>
          {display}
        </output>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-rule-strong"
        style={{ accentColor: "var(--color-brass)" }}
      />

      <div className="mt-1.5 flex justify-between font-mono text-[0.5rem] text-ink-faint tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {hint && <p className="mt-1.5 text-[0.75rem] leading-snug text-ink-faint">{hint}</p>}
    </div>
  );
}

export function ChoiceField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase">
        {label}
      </legend>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              "rounded-[2px] border px-3.5 py-2 font-mono text-micro tracking-[0.08em] transition-colors",
              value === opt.value
                ? "border-ink bg-ink text-bone"
                : "border-rule-strong text-ink-soft hover:border-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hint && <p className="mt-2 text-[0.75rem] leading-snug text-ink-faint">{hint}</p>}
    </fieldset>
  );
}

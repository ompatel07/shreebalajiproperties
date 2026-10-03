"use client";

import { AlertCircle } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Form primitives.
 *
 * Accessibility details that are easy to skip and expensive to retrofit:
 *   · The label is a real `<label>` bound by id — not a placeholder. A
 *     placeholder-only field is unreadable once the visitor starts typing.
 *   · Errors are wired through `aria-describedby` + `aria-invalid` and the
 *     container is `role="alert"`, so the message is announced rather than
 *     only coloured red.
 *   · `inputMode`/`autoComplete` are set per field type, which on a phone is
 *     the difference between a numeric keypad and a QWERTY one — a real
 *     conversion factor for a tel field.
 */

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
  className?: string;
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldShellProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-muted uppercase"
      >
        {label}
        {required && (
          <span className="ml-1 text-brass" aria-hidden>
            *
          </span>
        )}
      </label>

      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}

      {hint && !error && (
        <p id={hintId} className="text-[0.75rem] text-ink-faint">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-[0.75rem] text-alert"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  "w-full rounded-[2px] border bg-paper px-3.5 py-3 text-[0.9375rem] text-ink " +
  "transition-colors duration-250 placeholder:text-ink-faint " +
  "focus:border-brass focus:outline-none disabled:opacity-50 " +
  "aria-[invalid=true]:border-alert";

export function TextInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(controlBase, "border-rule-strong", className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={4}
      className={cn(controlBase, "resize-y border-rule-strong", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        controlBase,
        "cursor-pointer appearance-none border-rule-strong",
        // Chevron drawn as a background image so the control keeps a native
        // select's keyboard behaviour.
        "bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-10",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%236e685c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * The honeypot. Visually gone, off the tab order, and hidden from assistive
 * tech — but still a real input in the DOM that naive bots will fill.
 */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="botField">Do not fill this in</label>
      <input
        id="botField"
        name="botField"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

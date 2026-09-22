import { useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

const variantClass = {
  primary: "bg-primary text-white hover:bg-primary/90 border-primary",
  secondary: "border-brown-mid/30 bg-transparent text-brown-dark hover:bg-bg-secondary",
  ghost: "border-transparent bg-transparent text-brown-dark hover:bg-bg-secondary",
};

export function Button({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variantClass; loading?: boolean }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

const errorBorder = "border-red-400 focus:border-red-500";

export function Input({
  label,
  className = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-brown-dark">
      <span>{label}</span>
      <input
        className={`min-h-11 rounded-lg border bg-surface px-3 py-2 text-brown-dark shadow-sm transition duration-200 placeholder:text-brown-mid/70 ${error ? errorBorder : "border-brown-mid/25 focus:border-primary"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function Select({
  label,
  children,
  className = "",
  error,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-brown-dark">
      <span>{label}</span>
      <select
        className={`min-h-11 rounded-lg border bg-surface px-3 py-2 text-brown-dark shadow-sm transition duration-200 ${error ? errorBorder : "border-brown-mid/25 focus:border-primary"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-brown-dark">
      <span>{label}</span>
      <textarea
        className={`min-h-28 rounded-lg border bg-surface px-3 py-2 text-brown-dark shadow-sm transition duration-200 placeholder:text-brown-mid/70 ${error ? errorBorder : "border-brown-mid/25 focus:border-primary"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-brown-mid/15 bg-surface p-4 shadow-soft ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-bg-secondary text-brown-dark",
    success: "bg-primary/10 text-primary",
    warning: "bg-primary-light/20 text-brown-dark",
    danger: "bg-red-100 text-red-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-brown-mid/15 ${className}`} />;
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-brown-mid/30 bg-surface p-6 text-center">
      <p className="text-sm text-brown-mid">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Avatar({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return src && !failed ? (
    <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={`h-12 w-12 rounded-lg object-cover ${className}`} />
  ) : (
    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-bg-secondary font-semibold ${className}`}>
      {initials}
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-brown-dark/40 p-4 sm:place-items-center" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-surface shadow-soft">
        <div className="flex items-center justify-between gap-4 border-b border-brown-mid/15 p-5">
          <h2 className="font-heading text-2xl font-bold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl",
        "bg-gradient-to-br from-violet-600 to-blue-500",
        "shadow-lg shadow-blue-500/20",
        "relative",
        className
      )}
    >
      {/* Subtle shine for a premium glass effect */}
      <div className="absolute inset-0 rounded-xl border-t border-white/20"></div>

      {/* Clean, readable "C1" typography */}
      <div
        className="relative flex items-center justify-center gap-x-0.5 text-white"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
      >
        <span className="text-xl font-bold tracking-tight">C</span>
        <span className="text-xl font-bold tracking-tight">1</span>
      </div>
    </div>
  );
}

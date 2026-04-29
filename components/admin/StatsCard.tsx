import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

type StatsCardProps = {
  title: string;
  value: string | number;
  helperText?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  className?: string;
};

const trendStyleMap: Record<TrendDirection, string> = {
  up: "text-emerald-300",
  down: "text-rose-300",
  neutral: "text-zinc-300",
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "up") {
    return <ArrowUpRight className="h-4 w-4" />;
  }

  if (direction === "down") {
    return <ArrowDownRight className="h-4 w-4" />;
  }

  return <ArrowRight className="h-4 w-4" />;
}

export function StatsCard({ title, value, helperText, trend, className }: StatsCardProps) {
  return (
    <article className={cn("rounded-xl border border-white/10 bg-zinc-950 p-5", className)}>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[#e8c547]">{value}</p>

      <div className="mt-3 flex items-center justify-between text-xs">
        <p className="text-zinc-400">{helperText ?? ""}</p>

        {trend ? (
          <p className={cn("inline-flex items-center gap-1", trendStyleMap[trend.direction])}>
            <TrendIcon direction={trend.direction} />
            {trend.value}
          </p>
        ) : null}
      </div>
    </article>
  );
}

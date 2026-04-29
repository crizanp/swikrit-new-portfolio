import { StatsCard as EnhancedStatsCard } from "@/components/admin/StatsCard";

interface StatsCardProps {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return <EnhancedStatsCard title={label} value={value} />;
}

import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-brand">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading admin workspace...
      </div>
    </div>
  );
}

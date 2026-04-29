export default function WorkLoading() {
  return (
    <div className="space-y-10 pt-12">
      <section className="container space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary/80" />
        <div className="h-10 w-72 animate-pulse rounded bg-secondary/80" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-secondary/80" />
      </section>

      <section className="container grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
            <div className="aspect-[16/10] animate-pulse bg-secondary/70" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-secondary/70" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-secondary/70" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

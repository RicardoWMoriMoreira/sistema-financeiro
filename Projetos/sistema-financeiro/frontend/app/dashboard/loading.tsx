import { ChartSkeleton } from "@/components/loading/chart-skeleton";
import { SummaryCardsSkeleton } from "@/components/loading/summary-cards-skeleton";
import { TableSkeleton } from "@/components/loading/table-skeleton";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <SummaryCardsSkeleton />

        <section className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-9 w-16" />
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </section>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1 h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <TableSkeleton title="Últimas transações" rows={5} columns={5} />
      </div>
    </main>
  );
}

import { SummaryCardsSkeleton } from "@/components/loading/summary-cards-skeleton";
import { TableSkeleton } from "@/components/loading/table-skeleton";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <SummaryCardsSkeleton />

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <Skeleton className="h-6 w-20" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="flex items-end gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-1 h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-4 h-10 w-full" />
          </CardContent>
        </Card>

        <TableSkeleton title="Transações" rows={8} columns={6} />
      </div>
    </main>
  );
}

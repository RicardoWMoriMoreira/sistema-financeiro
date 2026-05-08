import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
  title?: string;
  rows?: number;
  columns?: number;
};

export function TableSkeleton({
  title = "Carregando...",
  rows = 5,
  columns = 6,
}: TableSkeletonProps) {
  return (
    <Card
      aria-label={title}
      className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-2">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

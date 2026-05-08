import { Spinner } from "@/components/ui/spinner";

export default function RecurringLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
}

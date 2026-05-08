import { AppNavigation } from "@/components/layout/app-navigation";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
            Sistema Financeiro
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Dashboard financeiro
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Gerencie categorias, cadastre transações, filtre lançamentos e
            acompanhe seu resumo financeiro.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AppNavigation />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

type QuickAction = {
  title: string;
  description: string;
  href: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Nova transação",
    description: "Cadastre uma receita ou despesa.",
    href: "/transactions#nova-transacao",
  },
  {
    title: "Filtrar transações",
    description: "Consulte lançamentos por tipo, categoria ou período.",
    href: "/transactions#filtros",
  },
  {
    title: "Gerenciar categorias",
    description: "Crie, edite ou remova categorias financeiras.",
    href: "/categories",
  },
];

export function QuickActions() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {quickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-400 dark:hover:bg-slate-900/80"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {action.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {action.description}
          </p>
        </Link>
      ))}
    </section>
  );
}

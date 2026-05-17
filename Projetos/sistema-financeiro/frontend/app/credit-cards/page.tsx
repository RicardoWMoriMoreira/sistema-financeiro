import { CreditCardManager } from "@/components/credit-cards/credit-card-manager";
import { AppHeader } from "@/components/layout/app-header";
import { getCreditCards } from "@/lib/api";

export default async function CreditCardsPage() {
  const cards = await getCreditCards();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Cartões de Crédito</h2>
          <p className="mt-2 text-sm text-slate-400">
            Cadastre seus cartões para usar no lançamento de transações pagas no crédito.
          </p>
        </section>

        <CreditCardManager cards={cards} />
      </div>
    </main>
  );
}

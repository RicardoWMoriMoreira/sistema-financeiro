import { PiggyBankManager } from "@/components/cofrinhos/piggy-bank-manager";
import { AppHeader } from "@/components/layout/app-header";
import { getPiggyBanks } from "@/lib/api";

export default async function PiggyBanksPage() {
  const piggyBanks = await getPiggyBanks();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Cofrinhos</h2>
          <p className="mt-2 text-sm text-slate-400">
            Crie objetivos de economia e acompanhe quanto já foi guardado em cada cofrinho.
          </p>
        </section>

        <PiggyBankManager piggyBanks={piggyBanks} />
      </div>
    </main>
  );
}

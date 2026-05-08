import { CategoryManager } from "@/components/categories/category-manager";
import { AppHeader } from "@/components/layout/app-header";
import { getCategories } from "@/lib/api";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Categorias</h2>
          <p className="mt-2 text-sm text-slate-400">
            Crie, edite e remova categorias usadas nas suas receitas e despesas.
          </p>
        </section>

        <CategoryManager categories={categories} />
      </div>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks";
import { formatTransactionType } from "@/lib/formatters";
import type { Category, TransactionType } from "@/types/transactions";

type CategoryManagerProps = {
  categories: Category[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<TransactionType>("expense");

  const [error, setError] = useState<string | null>(null);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        type,
      },
      {
        onSuccess: () => {
          setName("");
          setType("expense");
          toast.success("Categoria criada com sucesso!");
          router.refresh();
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "Erro ao cadastrar categoria.";

          setError(message);
          toast.error(message);
        },
      }
    );
  }

  function startEditing(category: Category) {
    setError(null);
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setEditingType(category.type);
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingName("");
    setEditingType("expense");
  }

  async function handleUpdateCategory(categoryId: number) {
    setError(null);

    if (!editingName.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    updateMutation.mutate(
      {
        id: categoryId,
        data: {
          name: editingName.trim(),
          type: editingType,
        },
      },
      {
        onSuccess: () => {
          cancelEditing();
          toast.success("Categoria atualizada com sucesso!");
          router.refresh();
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "Erro ao editar categoria.";

          setError(message);
          toast.error(message);
        },
      }
    );
  }

  async function handleDeleteCategory(categoryId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar esta categoria?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    deleteMutation.mutate(categoryId, {
      onSuccess: () => {
        toast.success("Categoria deletada com sucesso!");
        router.refresh();
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "Erro ao deletar categoria.";

        setError(message);
        toast.error(message);
      },
    });
  }

  return (
    <Card
      id="categorias"
      className="mt-6 border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
    >
      <CardHeader>
        <CardTitle>Gerenciar categorias</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          onSubmit={handleCreateCategory}
          className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Alimentação"
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando..." : "Criar categoria"}
            </Button>
          </div>
        </form>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                  <TableHead className="text-slate-600 dark:text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Tipo</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <TableRow key={category.id} className="border-slate-200 dark:border-slate-800">
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                          />
                        ) : (
                          category.name
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Select
                            value={editingType}
                            onValueChange={(value) =>
                              setEditingType(value as TransactionType)
                            }
                          >
                            <SelectTrigger className="w-[160px] border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="expense">Despesa</SelectItem>
                              <SelectItem value="income">Receita</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={
                              category.type === "income"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {formatTransactionType(category.type)}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateCategory(category.id)}
                              disabled={isSubmitting}
                              aria-label={`Salvar alterações da categoria ${category.name}`}
                            >
                              Salvar
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              disabled={isSubmitting}
                              aria-label="Cancelar edição"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(category)}
                              disabled={isSubmitting}
                              aria-label={`Editar categoria ${category.name}`}
                            >
                              Editar
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={isSubmitting}
                              aria-label={`Deletar categoria ${category.name}`}
                            >
                              Deletar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { ProjectionItem } from "@/types/transactions";

type ChartDataItem = {
  label: string;
  income: number;
  expense: number;
  balance: number;
  incomeProj?: number;
  expenseProj?: number;
  balanceProj?: number;
  is_projected: boolean;
};

const projectionMonthsOptions = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
];

const historyMonthsOptions = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

function transformData(items: ProjectionItem[]): ChartDataItem[] {
  return items.map((item) => {
    const income = Number(item.income);
    const expense = Number(item.expense);
    const balance = Number(item.balance);

    if (item.is_projected) {
      return {
        label: item.label,
        income: income,
        expense: expense,
        balance: balance,
        incomeProj: income,
        expenseProj: expense,
        balanceProj: balance,
        is_projected: true,
      };
    }

    return {
      label: item.label,
      income,
      expense,
      balance,
      is_projected: false,
    };
  });
}

function findSeparatorLabel(data: ChartDataItem[]): string | undefined {
  const idx = data.findIndex((d) => d.is_projected);
  if (idx <= 0) return undefined;
  return data[idx - 1].label;
}

export function ProjectionChart() {
  const [projectionMonths, setProjectionMonths] = useState("3");
  const [historyMonths, setHistoryMonths] = useState("3");
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjection() {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(
          `${apiUrl}/transactions/projection?history_months=${historyMonths}&projection_months=${projectionMonths}`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar projeção");
        }

        const result = await response.json();
        setData(transformData(result.items));
      } catch (err) {
        setError("Não foi possível carregar a projeção.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjection();
  }, [historyMonths, projectionMonths]);

  const separatorLabel = findSeparatorLabel(data);

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Projeção financeira futura</CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Estimativa baseada na média dos meses anteriores. Áreas tracejadas indicam valores projetados.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                Histórico:
              </span>
              <Select value={historyMonths} onValueChange={setHistoryMonths}>
                <SelectTrigger className="w-[110px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
                  {historyMonthsOptions.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-700 dark:focus:text-slate-50"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                Projeção:
              </span>
              <Select value={projectionMonths} onValueChange={setProjectionMonths}>
                <SelectTrigger className="w-[110px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
                  {projectionMonthsOptions.map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-700 dark:focus:text-slate-50"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Carregando...</p>
          </div>
        ) : error ? (
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nenhum dado histórico disponível para gerar a projeção.
            </p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="incomeProjGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="expenseProjGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="balanceProjGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.01} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value.toString();
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      income: "Receitas",
                      expense: "Despesas",
                      balance: "Saldo",
                      incomeProj: "Receitas (estimado)",
                      expenseProj: "Despesas (estimado)",
                      balanceProj: "Saldo (estimado)",
                    };
                    const amount = typeof value === "number" ? value : Number(value ?? 0);
                    const key = String(name);
                    return [formatCurrency(amount), labels[key] || key];
                  }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: "16px" }}
                  payload={[
                    { value: "income", type: "line", color: "#34d399", id: "income" },
                    { value: "expense", type: "line", color: "#f87171", id: "expense" },
                    { value: "balance", type: "line", color: "#60a5fa", id: "balance" },
                  ]}
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      income: "Receitas",
                      expense: "Despesas",
                      balance: "Saldo",
                    };
                    return (
                      <span className="text-slate-300">{labels[value] || value}</span>
                    );
                  }}
                />

                {separatorLabel && (
                  <ReferenceLine
                    x={separatorLabel}
                    stroke="#64748b"
                    strokeDasharray="4 3"
                    label={{
                      value: "hoje",
                      position: "insideTopRight",
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                  />
                )}

                {/* Linhas históricas — sólidas */}
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                  dot={{ fill: "#34d399", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#34d399" }}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f87171"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                  dot={{ fill: "#f87171", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f87171" }}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#balanceGrad)"
                  dot={{ fill: "#60a5fa", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#60a5fa" }}
                  legendType="none"
                />

                {/* Linhas projetadas — tracejadas, sobrepostas */}
                <Area
                  type="monotone"
                  dataKey="incomeProj"
                  stroke="#34d399"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="url(#incomeProjGrad)"
                  dot={{ fill: "#34d399", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#34d399" }}
                  connectNulls
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="expenseProj"
                  stroke="#f87171"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="url(#expenseProjGrad)"
                  dot={{ fill: "#f87171", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f87171" }}
                  connectNulls
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="balanceProj"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="url(#balanceProjGrad)"
                  dot={{ fill: "#60a5fa", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#60a5fa" }}
                  connectNulls
                  legendType="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          * Projeção calculada com base na média mensal e tendência do período histórico selecionado. Não constitui garantia de resultados futuros.
        </p>
      </CardContent>
    </Card>
  );
}

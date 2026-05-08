"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type {
  HistoryPeriod,
  TransactionHistoryItem,
} from "@/types/transactions";

type ChartDataItem = {
  period: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
};

const periodLabels: Record<HistoryPeriod, string> = {
  "6m": "Últimos 6 meses",
  "12m": "Último ano",
  ytd: "Este ano",
  all: "Tudo",
};

function formatPeriodLabel(period: string): string {
  if (period.includes("-W")) {
    const [year, week] = period.split("-W");
    return `Sem ${week}/${year}`;
  }

  if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [, month, day] = period.split("-");
    return `${day}/${month}`;
  }

  if (period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split("-");
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
  }

  return period;
}

function transformData(items: TransactionHistoryItem[]): ChartDataItem[] {
  return items.map((item) => ({
    period: item.period,
    label: formatPeriodLabel(item.period),
    income: Number(item.income),
    expense: Number(item.expense),
    balance: Number(item.balance),
  }));
}

export function EvolutionChart() {
  const [period, setPeriod] = useState<HistoryPeriod>("6m");
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(
          `${apiUrl}/transactions/history?period=${period}&group_by=month`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar histórico");
        }

        const result = await response.json();
        setData(transformData(result.items));
      } catch (err) {
        setError("Não foi possível carregar o histórico.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [period]);

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Evolução financeira</CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Acompanhe a evolução de receitas e despesas ao longo do tempo.
            </p>
          </div>

          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as HistoryPeriod)}
          >
            <SelectTrigger className="w-[180px] border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50">
              {Object.entries(periodLabels).map(([value, label]) => (
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
              Nenhum dado para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}k`;
                    }
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
                    };
                    const amount = typeof value === "number" ? value : Number(value ?? 0);
                    const key = String(name);
                    return [formatCurrency(amount), labels[key] || key];
                  }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      income: "Receitas",
                      expense: "Despesas",
                      balance: "Saldo",
                    };
                    return (
                      <span className="text-slate-300">
                        {labels[value] || value}
                      </span>
                    );
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ fill: "#34d399", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#34d399" }}
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ fill: "#f87171", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f87171" }}
                />

                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#60a5fa", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#60a5fa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

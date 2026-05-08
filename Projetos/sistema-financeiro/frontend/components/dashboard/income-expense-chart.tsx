"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { formatCurrency } from "@/lib/formatters";
import type { TransactionSummary } from "@/types/transactions";

type IncomeExpenseChartProps = {
  summary: TransactionSummary;
};

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

export function IncomeExpenseChart({ summary }: IncomeExpenseChartProps) {
  const data: ChartItem[] = [
    {
      name: "Receitas",
      value: Number(summary.total_income),
      color: "#34d399",
    },
    {
      name: "Despesas",
      value: Number(summary.total_expense),
      color: "#f87171",
    },
  ];

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <CardTitle>Receitas versus despesas</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Comparação geral entre entradas e saídas cadastradas.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#334155"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                tickFormatter={(value) => formatCurrency(Number(value))}
              />

              <Tooltip
                cursor={{ fill: "#1e293b" }}
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#f8fafc",
                }}
              />

              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
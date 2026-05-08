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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { Transaction } from "@/types/transactions";

type ExpenseByCategoryChartProps = {
  transactions: Transaction[];
};

type ChartItem = {
  category: string;
  total: number;
};

const chartColors = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#a3e635",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
];

function getExpensesByCategory(transactions: Transaction[]): ChartItem[] {
  const totalsByCategory = new Map<string, number>();

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );

  for (const transaction of expenseTransactions) {
    const categoryName = transaction.category?.name ?? "Sem categoria";
    const currentTotal = totalsByCategory.get(categoryName) ?? 0;

    totalsByCategory.set(
      categoryName,
      currentTotal + Number(transaction.amount),
    );
  }

  return Array.from(totalsByCategory.entries())
    .map(([category, total]) => ({
      category,
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function ExpenseByCategoryChart({
  transactions,
}: ExpenseByCategoryChartProps) {
  const data = getExpensesByCategory(transactions);

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Veja quais categorias concentram mais gastos.
        </p>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma despesa cadastrada ainda.
          </p>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  left: 24,
                  right: 24,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#334155"
                />

                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  width={120}
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

                <Bar dataKey="total" radius={[0, 12, 12, 0]}>
                  {data.map((item, index) => (
                    <Cell
                      key={item.category}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

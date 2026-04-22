"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

type StuckLead = {
  stage: string;
  count: number;
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function StuckLeadsChart({ data }: { data: StuckLead[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stuck Leads</CardTitle>
      </CardHeader>

      <CardContent className="flex justify-end pr-6 p-2">
        <PieChart width={400} height={250}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="stage"
            cx="40%"
            cy="50%"
            outerRadius={90}
            label={({ payload, percent }) => {
            const stage = payload?.stage ?? "";
            const value = percent ? (percent * 100).toFixed(0) : "0";
            return `${stage} (${value}%)`;
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </CardContent>
    </Card>
  );
}
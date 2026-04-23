"use client";
// renders a bar chart using Recharts inside a styled UI card.
import { DashboardData } from "@/services/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, XAxis, Bar, CartesianGrid } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"

// returns only the type of totalLeadsByStage from the full dashboard response
const PipelineStages = ({ data }: { data: DashboardData["totalLeadsByStage"] }) => {
  // theme & metadata
  const chartConfig = {
    stage: {
      label: "Stage",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card className="grid-cols-1">
      <CardHeader>
        <CardTitle>Pipeline Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stage"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--chart-1)" radius={8} />
          </BarChart>
        </ChartContainer>
       
      </CardContent>
    </Card>
  )
}
export default PipelineStages;
import { DashboardData } from "@/services/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, XAxis, Bar, CartesianGrid } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"

const ByStageBreakdown = ({ data }: { data: DashboardData["totalLeadsByStage"] }) => {

  const chartConfig = {
    stage: {
      label: "Stage",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Leads by Stage</CardTitle>
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
export default ByStageBreakdown
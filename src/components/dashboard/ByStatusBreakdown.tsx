"use client";
import { DashboardData } from "@/services/dashboard"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"


const ByStatusBreakdown = ({ data }: { data: DashboardData["totalLeadsByStatus"] }) => {

  const chartConfig = {
    status: {
      label: "Status",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig


 return (
    <Card className="col-span-1">
    <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig}>
        <BarChart layout="vertical" accessibilityLayer data={data}>
          <CartesianGrid horizontal={false}/>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}                    
            >
            </XAxis>
            <YAxis
             type="category"
             dataKey="status"
             tickLine={false}
             axisLine={false}
            >  
            </YAxis>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
             dataKey="count"
             fill="var(--chart-1)" 
             radius={8}
            >
            </Bar>
        </BarChart>
      </ChartContainer>
   
    </CardContent>
    </Card>
 )

}

export default ByStatusBreakdown;
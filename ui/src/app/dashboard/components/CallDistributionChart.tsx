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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

interface CallDistributionChartProps {
  dispositionData: DistributionItem[];
  channelData: DistributionItem[];
}

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#64748b", // slate-500
];

export function CallDistributionChart({
  dispositionData,
  channelData,
}: CallDistributionChartProps) {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: DistributionItem & { fill: string } }>;
  }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-xs text-foreground">{data.name}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Calls: <strong className="text-foreground">{data.count}</strong></span>
            <span>Ratio: <strong className="text-foreground">{data.percentage}%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = (items: DistributionItem[], emptyMessage: string) => {
    if (!items || items.length === 0 || items.every((i) => i.count === 0)) {
      return (
        <div className="flex h-[240px] items-center justify-center text-center text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    const chartData = items.map((item, idx) => ({
      ...item,
      fill: PALETTE[idx % PALETTE.length],
    }));

    return (
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className="border-border/60 shadow-sm col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Distribution</CardTitle>
            <CardDescription>Breakdown by call type and outcome</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
            <TabsTrigger value="channels" className="text-xs">
              By Channel
            </TabsTrigger>
            <TabsTrigger value="dispositions" className="text-xs">
              By Disposition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="mt-0">
            {renderBarChart(channelData, "No channel data available")}
          </TabsContent>

          <TabsContent value="dispositions" className="mt-0">
            {renderBarChart(dispositionData, "No disposition data available")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


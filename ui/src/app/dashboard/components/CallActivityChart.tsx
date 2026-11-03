"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface DailyActivityPoint {
  date: string;
  displayDate: string;
  calls: number;
  durationMinutes: number;
  inbound: number;
  outbound: number;
}

interface CallActivityChartProps {
  data: DailyActivityPoint[];
}

export function CallActivityChart({ data }: CallActivityChartProps) {
  const hasData = data && data.length > 0 && data.some((d) => d.calls > 0);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const point = data.find((d) => d.displayDate === label) || {
        inbound: 0,
        outbound: 0,
        durationMinutes: 0,
      };

      return (
        <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-sm text-foreground mb-1.5">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}:</span>
                </span>
                <span className="font-medium text-foreground">{entry.value}</span>
              </div>
            ))}
            <div className="border-t border-border/60 pt-1 mt-1 text-muted-foreground flex justify-between gap-4">
              <span>Inbound / Outbound:</span>
              <span className="font-medium text-foreground">
                {point.inbound} / {point.outbound}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/60 shadow-sm col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Call Volume & Trends</CardTitle>
        <CardDescription>
          Daily activity across all inbound, outbound, and web agent calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No recent call activity found</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Calls will appear here automatically once processed by voice agents
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="callCountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(128, 128, 128, 0.2)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(128, 128, 128, 0.2)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  name="Total Calls"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#callCountGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="durationMinutes"
                  name="Talk Time (mins)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#durationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


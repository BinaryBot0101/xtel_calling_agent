"use client";

import { Activity, CheckCircle2, Clock, Phone, Workflow } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

interface DashboardMetricsProps {
  totalCalls: number;
  totalDurationSeconds: number;
  activeAgents: number;
  totalAgents: number;
  completedCalls: number;
}

export function DashboardMetrics({
  totalCalls,
  totalDurationSeconds,
  activeAgents,
  totalAgents,
  completedCalls,
}: DashboardMetricsProps) {
  const avgDuration =
    totalCalls > 0 ? Math.round(totalDurationSeconds / totalCalls) : 0;
  const completionRate =
    totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Calls */}
      <Card className="border-border/60 shadow-sm transition-all hover:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Calls
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Phone className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {totalCalls.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <span className="font-medium text-foreground">{completedCalls}</span> answered / finished
          </p>
        </CardContent>
      </Card>

      {/* Total Talk Time */}
      <Card className="border-border/60 shadow-sm transition-all hover:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Talk Time
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {formatDuration(totalDurationSeconds)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cumulative conversation duration
          </p>
        </CardContent>
      </Card>

      {/* Average Call Duration */}
      <Card className="border-border/60 shadow-sm transition-all hover:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Call Duration
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {formatDuration(avgDuration)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      {/* Active Voice Agents */}
      <Card className="border-border/60 shadow-sm transition-all hover:border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Voice Agents
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Workflow className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{activeAgents}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalAgents} total agents configured
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


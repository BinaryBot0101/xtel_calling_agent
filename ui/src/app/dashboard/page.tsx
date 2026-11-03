"use client";

import { format, subDays } from "date-fns";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getPreferencesApiV1OrganizationsPreferencesGet,
  getUsageHistoryApiV1OrganizationsUsageRunsGet,
  getWorkflowCountApiV1WorkflowCountGet,
} from "@/client/sdk.gen";
import type { WorkflowRunUsageResponse } from "@/client/types.gen";
import { PageLayout } from "@/components/layout/PageLayout";
import { MediaPreviewDialog } from "@/components/MediaPreviewDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getLocalTimezone } from "@/lib/dateTime";

import { CallActivityChart, type DailyActivityPoint } from "./components/CallActivityChart";
import { CallDistributionChart, type DistributionItem } from "./components/CallDistributionChart";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { RecentCallsTable } from "./components/RecentCallsTable";

export default function DashboardPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runs, setRuns] = useState<WorkflowRunUsageResponse[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [activeAgents, setActiveAgents] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);
  const [timezone, setTimezone] = useState(getLocalTimezone());

  const { dialog, openPreview } = MediaPreviewDialog();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!auth.isAuthenticated) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [runsResponse, countsResponse, prefsResponse] = await Promise.allSettled([
        getUsageHistoryApiV1OrganizationsUsageRunsGet({
          query: {
            page: 1,
            limit: 100,
          },
        }),
        getWorkflowCountApiV1WorkflowCountGet(),
        getPreferencesApiV1OrganizationsPreferencesGet(),
      ]);

      if (runsResponse.status === "fulfilled" && runsResponse.value.data) {
        const data = runsResponse.value.data;
        setRuns(data.runs || []);
        setTotalCalls(data.total_count ?? data.runs.length ?? 0);
        setTotalDurationSeconds(data.total_duration_seconds ?? 0);
      }

      if (countsResponse.status === "fulfilled" && countsResponse.value.data) {
        setActiveAgents(countsResponse.value.data.active ?? 0);
        setTotalAgents(countsResponse.value.data.total ?? 0);
      }

      if (prefsResponse.status === "fulfilled" && prefsResponse.value.data?.timezone) {
        setTimezone(prefsResponse.value.data.timezone);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate daily activity trend over the past 7 days
  const dailyTrends = useMemo<DailyActivityPoint[]>(() => {
    const daysMap = new Map<
      string,
      { calls: number; durationSeconds: number; inbound: number; outbound: number }
    >();

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const key = format(d, "yyyy-MM-dd");
      daysMap.set(key, { calls: 0, durationSeconds: 0, inbound: 0, outbound: 0 });
    }

    runs.forEach((run) => {
      if (!run.created_at) return;
      try {
        const runDate = new Date(run.created_at);
        const key = format(runDate, "yyyy-MM-dd");
        const existing = daysMap.get(key) || {
          calls: 0,
          durationSeconds: 0,
          inbound: 0,
          outbound: 0,
        };
        existing.calls += 1;
        existing.durationSeconds += run.call_duration_seconds || 0;
        if (run.call_type === "inbound") {
          existing.inbound += 1;
        } else {
          existing.outbound += 1;
        }
        daysMap.set(key, existing);
      } catch {
        // ignore invalid dates
      }
    });

    return Array.from(daysMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, stats]) => {
        const parsed = new Date(`${dateKey}T00:00:00`);
        return {
          date: dateKey,
          displayDate: format(parsed, "MMM d"),
          calls: stats.calls,
          durationMinutes: Math.round((stats.durationSeconds / 60) * 10) / 10,
          inbound: stats.inbound,
          outbound: stats.outbound,
        };
      });
  }, [runs]);

  // Aggregate channel distribution (Inbound, Outbound, Web)
  const channelData = useMemo<DistributionItem[]>(() => {
    const total = runs.length;
    if (total === 0) return [];

    let inbound = 0;
    let outbound = 0;
    let web = 0;

    runs.forEach((run) => {
      const mode = run.mode;
      if (mode === "webrtc" || mode === "smallwebrtc") {
        web += 1;
      } else if (run.call_type === "inbound") {
        inbound += 1;
      } else {
        outbound += 1;
      }
    });

    return [
      { name: "Inbound", count: inbound, percentage: Math.round((inbound / total) * 100) },
      { name: "Outbound", count: outbound, percentage: Math.round((outbound / total) * 100) },
      ...(web > 0
        ? [{ name: "Web Call", count: web, percentage: Math.round((web / total) * 100) }]
        : []),
    ];
  }, [runs]);

  // Aggregate disposition distribution
  const dispositionData = useMemo<DistributionItem[]>(() => {
    const total = runs.length;
    if (total === 0) return [];

    const counts: Record<string, number> = {};
    runs.forEach((run) => {
      const disp = run.disposition_code || "Completed";
      counts[disp] = (counts[disp] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  }, [runs]);

  const completedCallsCount = useMemo(() => {
    return runs.filter(
      (r) =>
        (r.call_duration_seconds && r.call_duration_seconds > 0) ||
        (r.disposition_code && !r.disposition_code.toLowerCase().includes("fail"))
    ).length;
  }, [runs]);

  return (
    <PageLayout
      title="Dashboard"
      description="Overview of your voice agent activity and call performance"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/workflow/create">
              <Plus className="h-4 w-4" />
              New Agent
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Key Metrics */}
        <DashboardMetrics
          totalCalls={totalCalls}
          totalDurationSeconds={totalDurationSeconds}
          activeAgents={activeAgents}
          totalAgents={totalAgents}
          completedCalls={completedCallsCount}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CallActivityChart data={dailyTrends} />
          <CallDistributionChart
            dispositionData={dispositionData}
            channelData={channelData}
          />
        </div>

        {/* Recent Calls Table */}
        <RecentCallsTable
          runs={runs}
          loading={loading}
          timezone={timezone}
          onOpenPreview={openPreview}
        />

        {/* Quick Access to Key Platform Features */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <QuickActionsCard />
        </div>
      </div>

      {dialog}
    </PageLayout>
  );
}


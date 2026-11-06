"use client";

import { ArrowRight, Bot, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { WorkflowRunUsageResponse } from "@/client/types.gen";
import { CallTypeCell } from "@/components/CallTypeCell";
import { MediaPreviewButton } from "@/components/MediaPreviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/dateTime";

import { formatDuration } from "./DashboardMetrics";

interface RecentCallsTableProps {
  runs: WorkflowRunUsageResponse[];
  loading?: boolean;
  timezone?: string;
  onOpenPreview: (recordingUrl: string | null, transcriptUrl: string | null, runId: number) => void;
}

export function RecentCallsTable({
  runs,
  loading = false,
  timezone,
  onOpenPreview,
}: RecentCallsTableProps) {
  const getDispositionBadge = (code?: string | null) => {
    if (!code) {
      return (
        <Badge variant="outline" className="text-muted-foreground font-normal text-xs">
          Completed
        </Badge>
      );
    }

    const upper = code.toUpperCase();
    if (upper.includes("XFER") || upper.includes("TRANSFER")) {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
          {code}
        </Badge>
      );
    }
    if (upper.includes("FAIL") || upper.includes("ERROR") || upper.includes("DROP")) {
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
          {code}
        </Badge>
      );
    }
    if (upper.includes("COMPLET") || upper.includes("SUCCESS")) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
          {code}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-xs">
        {code}
      </Badge>
    );
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
          <CardDescription>Latest voice agent executions and conversation logs</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/usage">
            View all calls
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-[80px] pl-6">ID</TableHead>
                <TableHead>Voice Agent</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[110px]">Duration</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Started At</TableHead>
                <TableHead className="w-[80px] text-right pr-6">Recording</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/60">
                    <TableCell className="pl-6"><div className="h-4 w-10 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-muted/60 animate-pulse rounded" /></TableCell>
                    <TableCell className="text-right pr-6"><div className="h-8 w-8 bg-muted/60 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="text-sm font-medium">No calls found</p>
                      <p className="text-xs text-muted-foreground/80">
                        When your agents handle calls or tests, they will show up here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                runs.slice(0, 10).map((run) => (
                  <TableRow key={run.id} className="border-border/60 hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                      #{run.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm text-foreground truncate max-w-[200px]">
                          {run.workflow_name || run.name || `Agent #${run.workflow_id}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CallTypeCell
                        mode={run.mode}
                        callType={run.call_type}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatDuration(run.call_duration_seconds)}
                    </TableCell>
                    <TableCell>
                      {getDispositionBadge(run.disposition)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(run.created_at, timezone)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end">
                        <MediaPreviewButton
                          recordingUrl={run.recording_url}
                          transcriptUrl={run.transcript_url}
                          runId={run.id}
                          onOpenPreview={onOpenPreview}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


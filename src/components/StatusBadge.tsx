import React from 'react';
import type { HealthStatus, LiveStatus } from '@/types/mojaloop';

interface StatusBadgeProps {
  liveStatus: LiveStatus;
  healthStatus: HealthStatus;
  compact?: boolean;
}

export function StatusBadge({ liveStatus, healthStatus, compact = false }: StatusBadgeProps) {
  if (liveStatus === 'running') {
    if (healthStatus === 'starting' || healthStatus === 'unhealthy') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
          {compact ? 'Up (starting)' : `Running (${healthStatus})`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        {compact ? (healthStatus === 'healthy' ? 'Healthy' : 'Running') : `Running${healthStatus === 'healthy' ? ' (healthy)' : ''}`}
      </span>
    );
  }

  if (liveStatus === 'exited') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
        <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
        {compact ? 'Exited (0)' : 'Exited (0) • Completed'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/25">
      <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
      {compact ? 'Stopped / Inactive' : 'Not Started (Inactive)'}
    </span>
  );
}

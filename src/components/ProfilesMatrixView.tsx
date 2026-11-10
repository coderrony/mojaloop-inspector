import React from 'react';
import type { LiveStatus, ProfileRecord, ServiceRecord } from '@/types/mojaloop';

interface ProfilesMatrixViewProps {
  profiles: ProfileRecord[];
  servicesById: Record<string, ServiceRecord>;
  selectedProfile: string | null;
  statusFilter: 'all' | LiveStatus;
  searchQuery: string;
  onSelectProfile: (profileName: string | null) => void;
  onSelectService: (serviceId: string) => void;
}

export function ProfilesMatrixView({
  profiles,
  servicesById,
  selectedProfile,
  statusFilter,
  searchQuery,
  onSelectProfile,
  onSelectService,
}: ProfilesMatrixViewProps) {
  const q = searchQuery.trim().toLowerCase();

  const filteredProfiles = profiles.filter((prof) => {
    if (selectedProfile && prof.name !== selectedProfile) return false;

    const matchingServices = prof.services.filter((sid) => {
      const svc = servicesById[sid];
      if (!svc) return false;
      if (statusFilter !== 'all' && svc.liveStatus !== statusFilter) return false;
      if (q) {
        const hit =
          prof.name.toLowerCase().includes(q) ||
          svc.id.toLowerCase().includes(q) ||
          svc.image.toLowerCase().includes(q) ||
          svc.category.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });

    return matchingServices.length > 0;
  });

  return (
    <section aria-label="IIPS Container Profiles Matrix" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">IIPS Container Profiles</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            One profile per row • Click any profile to filter, or click any container chip to inspect its Docker image, logs &amp; Mojaloop role
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {selectedProfile && (
            <button
              type="button"
              onClick={() => onSelectProfile(null)}
              className="rounded-lg border px-3 py-1.5 font-medium transition hover:border-sky-500"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              Clear profile filter ({selectedProfile}) ×
            </button>
          )}
          <div className="flex items-center gap-3 rounded-lg border px-3 py-1.5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Running
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
              Health Starting
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
              Exited (0) Task
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" aria-hidden="true" />
              Not Started
            </span>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div
          className="px-5 py-3 border-b flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: '#123552', borderColor: 'var(--border-subtle)' }}
        >
          <span>Docker Compose Profiles ({filteredProfiles.length})</span>
          <span className="hidden sm:inline">Associated Containers Grouped Together</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {filteredProfiles.map((prof) => {
            const visibleServices = prof.services.filter((sid) => {
              const svc = servicesById[sid];
              if (!svc) return false;
              if (statusFilter !== 'all' && svc.liveStatus !== statusFilter) return false;
              if (q && !prof.name.toLowerCase().includes(q)) {
                return (
                  svc.id.toLowerCase().includes(q) ||
                  svc.image.toLowerCase().includes(q) ||
                  svc.category.toLowerCase().includes(q)
                );
              }
              return true;
            });

            return (
              <div
                key={prof.name}
                className={`grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 p-4 transition-colors ${
                  prof.isExecutedInCommand ? 'bg-sky-500/[0.03]' : ''
                }`}
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {/* Left Column: Profile Info */}
                <div className="border-l-4 pl-3 flex flex-col justify-between gap-2" style={{ borderColor: prof.isExecutedInCommand ? '#0284c7' : '#64748b' }}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProfile(selectedProfile === prof.name ? null : prof.name)}
                        className="text-left font-bold text-sm hover:underline"
                        style={{ color: prof.isExecutedInCommand ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        {prof.name}
                      </button>
                      {prof.isExecutedInCommand && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          Executed
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {prof.totalCount} {prof.totalCount === 1 ? 'container' : 'containers'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {prof.runningCount > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {prof.runningCount} up
                      </span>
                    )}
                    {prof.exitedCount > 0 && (
                      <span className="text-sky-600 dark:text-sky-400 font-medium">
                        {prof.exitedCount} exited(0)
                      </span>
                    )}
                    {prof.inactiveCount > 0 && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {prof.inactiveCount} inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column: Clickable Container Chips */}
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex flex-wrap gap-2">
                    {visibleServices.map((sid) => {
                      const svc = servicesById[sid];
                      if (!svc) return null;

                      let dotClass = 'bg-slate-400';
                      let pillStyle = 'border-slate-500/20 bg-slate-500/5 text-slate-600 dark:text-slate-400';
                      if (svc.liveStatus === 'running') {
                        if (svc.healthStatus === 'starting' || svc.healthStatus === 'unhealthy') {
                          dotClass = 'bg-amber-500 animate-pulse';
                          pillStyle = 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200';
                        } else {
                          dotClass = 'bg-emerald-500';
                          pillStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
                        }
                      } else if (svc.liveStatus === 'exited') {
                        dotClass = 'bg-sky-500';
                        pillStyle = 'border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-200';
                      }

                      return (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => onSelectService(sid)}
                          title={`${sid} — ${svc.image} (${svc.statusText})`}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:scale-[1.02] hover:shadow-sm ${pillStyle}`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />
                          <span>{sid}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {prof.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

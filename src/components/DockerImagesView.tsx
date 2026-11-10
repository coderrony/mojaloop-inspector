import React from 'react';
import type { ImageRecord, LiveStatus } from '@/types/mojaloop';
import { BoxIcon, ExternalLinkIcon } from './Icons';

interface DockerImagesViewProps {
  images: ImageRecord[];
  statusFilter: 'all' | LiveStatus;
  searchQuery: string;
  onSelectService: (serviceId: string) => void;
}

export function DockerImagesView({
  images,
  statusFilter,
  searchQuery,
  onSelectService,
}: DockerImagesViewProps) {
  const q = searchQuery.trim().toLowerCase();

  const filteredImages = images.filter((img) => {
    const matchesStatus =
      statusFilter === 'all' || img.containers.some((c) => c.liveStatus === statusFilter);
    if (!matchesStatus) return false;

    if (q) {
      return (
        img.image.toLowerCase().includes(q) ||
        img.role.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q) ||
        img.containers.some((c) => c.id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section aria-label="Docker Images to Containers Mapping" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Docker Images &rarr; Spawned Containers</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          See exactly which Docker image builds and runs which containers on your EC2 host. Click any container to inspect its configuration and role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredImages.map((img) => {
          const visibleContainers = img.containers.filter((c) => {
            if (statusFilter !== 'all' && c.liveStatus !== statusFilter) return false;
            if (q && !img.image.toLowerCase().includes(q) && !img.role.toLowerCase().includes(q)) {
              return c.id.toLowerCase().includes(q);
            }
            return true;
          });

          const runningCnt = img.containers.filter((c) => c.liveStatus === 'running').length;
          const exitedCnt = img.containers.filter((c) => c.liveStatus === 'exited').length;
          const inactiveCnt = img.containers.filter((c) => c.liveStatus === 'inactive').length;

          return (
            <article
              key={img.image}
              className="flex flex-col justify-between rounded-xl border p-4 shadow-sm transition hover:border-sky-500/50"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="space-y-3">
                {/* Image Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <BoxIcon className="w-4 h-4 shrink-0" />
                      <h3 className="font-mono text-xs font-bold break-all" style={{ color: 'var(--accent)' }}>
                        {img.image}
                      </h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className="rounded px-1.5 py-0.5 border font-medium"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                      >
                        {img.category}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Disk: <strong>{img.diskUsage}</strong>
                      </span>
                      {img.inUseOnServer ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Pulled &amp; Active</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>• Not Pulled</span>
                      )}
                    </div>
                  </div>

                  <a
                    href={img.githubRepo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open repository for ${img.image}`}
                    className="shrink-0 rounded-lg p-1.5 border transition hover:border-sky-500"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Role summary */}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {img.role}
                </p>

                {/* Spawned containers */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Containers ({img.containers.length})</span>
                    <span className="font-normal normal-case">
                      {runningCnt > 0 && <span className="text-emerald-600 dark:text-emerald-400 mr-2">{runningCnt} up</span>}
                      {exitedCnt > 0 && <span className="text-sky-600 dark:text-sky-400 mr-2">{exitedCnt} exited(0)</span>}
                      {inactiveCnt > 0 && <span>{inactiveCnt} inactive</span>}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {visibleContainers.map((c) => {
                      let badgeStyle = 'border-slate-500/25 bg-slate-500/5 text-slate-600 dark:text-slate-400';
                      let dot = 'bg-slate-400';
                      if (c.liveStatus === 'running') {
                        if (c.healthStatus === 'starting' || c.healthStatus === 'unhealthy') {
                          badgeStyle = 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200';
                          dot = 'bg-amber-500 animate-pulse';
                        } else {
                          badgeStyle = 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
                          dot = 'bg-emerald-500';
                        }
                      } else if (c.liveStatus === 'exited') {
                        badgeStyle = 'border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-200';
                        dot = 'bg-sky-500';
                      }

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectService(c.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:scale-[1.03] ${badgeStyle}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
                          <span>{c.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

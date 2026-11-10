import React from 'react';
import type { LiveStatus, ServiceRecord } from '@/types/mojaloop';
import { StatusBadge } from './StatusBadge';

interface ServicesExplorerTableProps {
  services: ServiceRecord[];
  statusFilter: 'all' | LiveStatus;
  categoryFilter: string;
  searchQuery: string;
  onCategoryChange: (cat: string) => void;
  onSelectService: (serviceId: string) => void;
}

export function ServicesExplorerTable({
  services,
  statusFilter,
  categoryFilter,
  searchQuery,
  onCategoryChange,
  onSelectService,
}: ServicesExplorerTableProps) {
  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];
  const q = searchQuery.trim().toLowerCase();

  const filtered = services.filter((svc) => {
    if (statusFilter !== 'all' && svc.liveStatus !== statusFilter) return false;
    if (categoryFilter !== 'All' && svc.category !== categoryFilter) return false;
    if (q) {
      return (
        svc.id.toLowerCase().includes(q) ||
        svc.image.toLowerCase().includes(q) ||
        svc.shortSummary.toLowerCase().includes(q) ||
        svc.behindTheScenes.toLowerCase().includes(q) ||
        svc.profiles.some((p) => p.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section aria-label="Services Explorer Table" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="services-table-heading" className="text-lg font-bold tracking-tight">
            All Services &amp; Live Container Status ({filtered.length} / {services.length})
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Click any service row to inspect ports, volumes, dependencies, and behind-the-scenes behavior.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="category-filter" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Category:
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="services-table-heading"
        className="table-wrapper"
      >
        <table className="services-table">
          <caption className="sr-only">
            Mojaloop services, live container status, Docker images, categories, and roles
          </caption>
          <thead>
            <tr>
              <th scope="col">Service / Container</th>
              <th scope="col">Live State</th>
              <th scope="col">Docker Image</th>
              <th scope="col">Category</th>
              <th scope="col">Behind the Scenes Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc) => (
              <tr
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                className="cursor-pointer transition-colors"
              >
                <th scope="row">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(svc.id);
                    }}
                    className="text-left font-bold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {svc.id}
                  </button>
                  {svc.ports.length > 0 && (
                    <div className="mt-0.5 text-[11px] font-mono font-normal" style={{ color: 'var(--text-secondary)' }}>
                      {svc.ports.slice(0, 2).join(', ')}
                    </div>
                  )}
                </th>
                <td>
                  <StatusBadge liveStatus={svc.liveStatus} healthStatus={svc.healthStatus} compact />
                </td>
                <td>
                  <code className="text-xs font-mono break-all">{svc.image}</code>
                </td>
                <td>
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-medium border whitespace-nowrap"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                  >
                    {svc.category}
                  </span>
                </td>
                <td className="max-w-md text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {svc.shortSummary}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No services match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

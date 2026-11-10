'use client';

import React, { useEffect, useRef } from 'react';
import type { DiagnosticNote, ServiceRecord } from '@/types/mojaloop';
import { StatusBadge } from './StatusBadge';
import { CloseIcon, ExternalLinkIcon } from './Icons';

interface ServiceDetailDialogProps {
  service: ServiceRecord | null;
  allServicesById: Record<string, ServiceRecord>;
  diagnosticNotes: DiagnosticNote[];
  onClose: () => void;
  onSelectService: (serviceId: string) => void;
  onSelectProfile: (profileName: string) => void;
}

export function ServiceDetailDialog({
  service,
  allServicesById,
  diagnosticNotes,
  onClose,
  onSelectService,
  onSelectProfile,
}: ServiceDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (service) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [service]);

  const handleClose = () => {
    onClose();
  };

  // Fallback for browsers without closedby="any" support (e.g. Safari)
  const isOutsideDialog = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    pressedOutsideRef.current = isOutsideDialog(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    if (pressedOutsideRef.current && isOutsideDialog(e)) {
      dialogRef.current?.close();
    }
    pressedOutsideRef.current = false;
  };

  const matchingNotes = service
    ? diagnosticNotes.filter((n) => n.serviceId === service.id)
    : [];

  return (
    <dialog
      ref={dialogRef}
      className="service-dialog"
      aria-labelledby="service-dialog-title"
      onClose={handleClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...({ closedby: 'any' } as Record<string, unknown>)}
    >
      {service && (
        <>
          <header
            className="flex items-start justify-between gap-4 border-b px-6 py-4"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 id="service-dialog-title" className="text-xl font-bold tracking-tight truncate">
                  {service.id}
                </h2>
                <StatusBadge liveStatus={service.liveStatus} healthStatus={service.healthStatus} />
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium border"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
                >
                  {service.category}
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {service.shortSummary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close service details"
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-500/15"
              autoFocus
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </header>

          <div className="overflow-y-auto px-6 py-5 space-y-5">
            {matchingNotes.map((note, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 text-sm ${
                  note.severity === 'warning'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}
              >
                <p className="font-semibold">{note.title}</p>
                <p className="mt-1 opacity-90">{note.detail}</p>
              </div>
            ))}

            {/* Behind the scenes explanation */}
            <section
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Behind the Scenes in Mojaloop
              </h3>
              <p className="mt-2 text-sm leading-relaxed">{service.behindTheScenes}</p>
              <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-semibold">Developer Customization: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{service.developerCustomization}</span>
              </div>
            </section>

            {/* Technical Specs Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Container & Image Metadata
                </h3>
                <div>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>Container Name</span>
                  <code className="text-xs font-semibold">{service.containerName}</code>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>Docker Image</span>
                  <code className="text-xs font-semibold break-all">{service.image}</code>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>Image Size on EC2</span>
                    <span className="text-xs font-medium">{service.diskSize}</span>
                  </div>
                  <a
                    href={service.githubRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    Source / Image <ExternalLinkIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Network, Ports & Runtime
                </h3>
                <div>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>Live Status</span>
                  <span className="text-xs font-medium">{service.statusText}</span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>Exposed / Mapped Ports</span>
                  {service.ports.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {service.ports.map((p) => (
                        <code
                          key={p}
                          className="rounded px-2 py-0.5 text-xs border"
                          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                        >
                          {p}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Internal mojaloop-net only</span>
                  )}
                </div>
              </div>
            </section>

            {/* Dependencies & Profiles */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Depends On ({service.dependsOn.length})
                </h3>
                {service.dependsOn.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {service.dependsOn.map((depId) => {
                      const dep = allServicesById[depId];
                      return (
                        <button
                          key={depId}
                          type="button"
                          onClick={() => onSelectService(depId)}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:border-sky-500"
                          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              dep?.liveStatus === 'running'
                                ? 'bg-emerald-500'
                                : dep?.liveStatus === 'exited'
                                  ? 'bg-sky-500'
                                  : 'bg-slate-400'
                            }`}
                            aria-hidden="true"
                          />
                          {depId}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No upstream service dependencies</p>
                )}
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Assigned Profiles ({service.profiles.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {service.profiles.map((prof) => (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => {
                        onSelectProfile(prof);
                        dialogRef.current?.close();
                      }}
                      className="rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:border-sky-500"
                      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                    >
                      --profile {prof}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Command, Volumes, Env */}
            <section className="rounded-xl border p-4 space-y-3 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h3 className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Startup Command
                </h3>
                <pre
                  className="overflow-x-auto rounded-lg p-2.5 font-mono text-[11px] leading-relaxed"
                  style={{ backgroundColor: 'var(--bg-elevated)' }}
                >
                  {service.command}
                </pre>
              </div>

              {service.volumes.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Mounted Volumes & Configs
                  </h3>
                  <ul className="space-y-1 font-mono text-[11px]">
                    {service.volumes.map((v) => (
                      <li key={v} className="truncate" title={v}>
                        • {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.envVars.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Key Environment Variables
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {service.envVars.map((e) => (
                      <code
                        key={e}
                        className="rounded px-2 py-0.5 text-[11px] border"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                      >
                        {e}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </dialog>
  );
}

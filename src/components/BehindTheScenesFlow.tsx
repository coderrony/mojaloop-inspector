import React, { useState } from 'react';
import type { ArchitectureFlow, ServiceRecord, SnapshotData } from '@/types/mojaloop';
import { StatusBadge } from './StatusBadge';

interface BehindTheScenesFlowProps {
  flows: ArchitectureFlow[];
  snapshot: SnapshotData;
  servicesById: Record<string, ServiceRecord>;
  onSelectService: (serviceId: string) => void;
}

export function BehindTheScenesFlow({
  flows,
  snapshot,
  servicesById,
  onSelectService,
}: BehindTheScenesFlowProps) {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id ?? '');
  const activeFlow = flows.find((f) => f.id === selectedFlowId) ?? flows[0];

  return (
    <section aria-label="Behind the Scenes Architecture Flows" className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">How Mojaloop Works Behind the Scenes</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Interactive architectural walkthroughs based on your live server execution (`{snapshot.executedCommand}`). Click any service badge to inspect its details.
        </p>
      </div>

      {/* Live Provisioning & Test Run Results + Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              TTK Provisioning Report
            </h3>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              {snapshot.provisioningReport.passPercentage} PASSED
            </span>
          </div>
          <p className="text-sm font-semibold">
            {snapshot.provisioningReport.passedAssertions} / {snapshot.provisioningReport.passedAssertions + snapshot.provisioningReport.failedAssertions} Assertions
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {snapshot.provisioningReport.totalRequests} API requests across {snapshot.provisioningReport.totalTestCases} test suites in {(snapshot.provisioningReport.durationMs / 1000).toFixed(1)}s.
          </p>
          <button
            type="button"
            onClick={() => onSelectService('ttk-provisioning')}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Inspect ttk-provisioning &rarr;
          </button>
        </div>

        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              TTK Functional Tests Report
            </h3>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300">
              {snapshot.testsReport.passPercentage} PASSED
            </span>
          </div>
          <p className="text-sm font-semibold">
            {snapshot.testsReport.passedAssertions} / {snapshot.testsReport.passedAssertions + snapshot.testsReport.failedAssertions} Assertions
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {snapshot.testsReport.totalRequests} requests in {(snapshot.testsReport.durationMs / 1000).toFixed(1)}s. Saved to <code>{snapshot.testsReport.reportFile}</code>.
          </p>
          <button
            type="button"
            onClick={() => onSelectService('ttk-tests')}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Inspect ttk-tests &rarr;
          </button>
        </div>

        <div
          className="rounded-xl border p-4 space-y-2 border-amber-500/40 bg-amber-500/5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Live EC2 Diagnostic Alert
            </h3>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200">
              Health Port Mismatch
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            <strong>central-settlement</strong> shows <em>health: starting</em> in Docker only because compose polls port <code>3001</code> instead of <code>3007</code>. Its RulesHandler is live &amp; processing Kafka fee events!
          </p>
          <button
            type="button"
            onClick={() => onSelectService('central-settlement')}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Inspect central-settlement &rarr;
          </button>
        </div>
      </div>

      {/* Flow Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {flows.map((flow) => {
          const isActive = flow.id === activeFlow?.id;
          return (
            <button
              key={flow.id}
              type="button"
              onClick={() => setSelectedFlowId(flow.id)}
              className={`rounded-xl border px-4 py-2 text-left text-xs font-semibold transition ${
                isActive ? 'shadow-sm' : 'opacity-80 hover:opacity-100'
              }`}
              style={{
                borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? 'var(--accent-fg)' : 'var(--text-primary)',
              }}
            >
              {flow.title}
            </button>
          );
        })}
      </div>

      {/* Active Flow Steps */}
      {activeFlow && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div>
            <h3 className="text-base font-bold">{activeFlow.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {activeFlow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {activeFlow.steps.map((st) => {
              const svc = servicesById[st.serviceId];
              return (
                <div
                  key={st.step}
                  className="flex flex-col justify-between rounded-xl border p-4 relative"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                      >
                        {st.step}
                      </span>
                      {svc && (
                        <StatusBadge
                          liveStatus={svc.liveStatus}
                          healthStatus={svc.healthStatus}
                          compact
                        />
                      )}
                    </div>

                    <h4 className="text-sm font-bold leading-snug">{st.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {st.action}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="text-[11px] font-mono truncate" title={st.artifact} style={{ color: 'var(--text-secondary)' }}>
                      {st.artifact}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectService(st.serviceId)}
                      className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:border-sky-500 text-center"
                      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}
                    >
                      Inspect {st.serviceId}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

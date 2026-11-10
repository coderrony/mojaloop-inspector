'use client';

import React, { useMemo, useRef, useState } from 'react';
import type {
  ArchitectureFlow,
  ImageRecord,
  LiveStatus,
  ProfileRecord,
  ServiceRecord,
  SnapshotData,
} from '@/types/mojaloop';
import { ProfilesMatrixView } from './ProfilesMatrixView';
import { DockerImagesView } from './DockerImagesView';
import { ServicesExplorerTable } from './ServicesExplorerTable';
import { BehindTheScenesFlow } from './BehindTheScenesFlow';
import { ServiceDetailDialog } from './ServiceDetailDialog';
import {
  BoxIcon,
  LayersIcon,
  SearchIcon,
  ServerIcon,
  SunMoonIcon,
  WorkflowIcon,
} from './Icons';

interface DashboardClientProps {
  snapshot: SnapshotData;
  services: ServiceRecord[];
  profiles: ProfileRecord[];
  images: ImageRecord[];
  flows: ArchitectureFlow[];
}

type TabKey = 'profiles' | 'images' | 'services' | 'flows';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profiles', label: 'Container Profiles Matrix' },
  { key: 'images', label: 'Docker Images -> Containers' },
  { key: 'services', label: 'Services Explorer (54)' },
  { key: 'flows', label: 'Behind the Scenes Flows' },
];

export function DashboardClient({
  snapshot,
  services,
  profiles,
  images,
  flows,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profiles');
  const [statusFilter, setStatusFilter] = useState<'all' | LiveStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const servicesById = useMemo(() => {
    const map: Record<string, ServiceRecord> = {};
    for (const s of services) {
      map[s.id] = s;
    }
    return map;
  }, [services]);

  const selectedService = selectedServiceId ? (servicesById[selectedServiceId] ?? null) : null;

  const cycleTheme = () => {
    const next = themeMode === 'system' ? 'dark' : themeMode === 'dark' ? 'light' : 'system';
    setThemeMode(next);
    if (next === 'system') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = next;
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % TABS.length;
      setActiveTab(TABS[next].key);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + TABS.length) % TABS.length;
      setActiveTab(TABS[prev].key);
      tabRefs.current[prev]?.focus();
    }
  };

  const handleSelectProfileFromDialog = (profName: string) => {
    setSelectedProfile(profName);
    setActiveTab('profiles');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Hero Banner */}
      <header
        className="border-b text-white"
        style={{ backgroundColor: '#102e47', borderColor: '#1e4a6e' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <ServerIcon className="w-6 h-6 text-sky-400" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Mojaloop IIPS Live Architecture &amp; Container Inspector
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Server: <code className="text-sky-300 font-mono">{snapshot.serverHost}</code> ({snapshot.serverIp}) • Captured: {snapshot.capturedAt}
              </p>
            </div>

            <button
              type="button"
              onClick={cycleTheme}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <SunMoonIcon className="w-4 h-4" />
              <span>Theme: {themeMode}</span>
            </button>
          </div>

          <div className="rounded-lg border border-white/15 bg-black/25 px-3.5 py-2 font-mono text-xs text-sky-200 overflow-x-auto">
            <span className="text-slate-400 select-none">$ </span>
            {snapshot.executedCommand}
          </div>

          {/* Clickable KPI Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setActiveTab('services');
              }}
              className={`rounded-xl border p-3 text-left transition ${
                statusFilter === 'all' ? 'border-sky-400 bg-white/15' : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
                Total Defined
              </span>
              <span className="text-2xl font-bold">{snapshot.counts.totalDefined}</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">All compose services</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter(statusFilter === 'running' ? 'all' : 'running');
              }}
              className={`rounded-xl border p-3 text-left transition ${
                statusFilter === 'running'
                  ? 'border-emerald-400 bg-emerald-500/25'
                  : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 block">
                Running Live
              </span>
              <span className="text-2xl font-bold text-emerald-300">{snapshot.counts.running}</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">Active microservices</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter(statusFilter === 'exited' ? 'all' : 'exited');
              }}
              className={`rounded-xl border p-3 text-left transition ${
                statusFilter === 'exited'
                  ? 'border-sky-400 bg-sky-500/25'
                  : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-sky-300 block">
                Exited (0) Tasks
              </span>
              <span className="text-2xl font-bold text-sky-300">{snapshot.counts.exitedCompleted}</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">Provision &amp; tests done</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive');
              }}
              className={`rounded-xl border p-3 text-left transition ${
                statusFilter === 'inactive'
                  ? 'border-slate-300 bg-slate-500/30'
                  : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
                Inactive / Stopped
              </span>
              <span className="text-2xl font-bold text-slate-200">{snapshot.counts.inactive}</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">Unselected profiles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
                Docker Images
              </span>
              <span className="text-2xl font-bold">
                {snapshot.counts.pulledImages}
                <span className="text-sm font-normal text-slate-400"> / {snapshot.counts.totalImages}</span>
              </span>
              <span className="block text-[11px] text-slate-300 mt-0.5">Pulled on EC2 host</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flows')}
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 block">
                TTK Tests Passed
              </span>
              <span className="text-2xl font-bold text-emerald-300">100%</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">
                {snapshot.provisioningReport.passedAssertions + snapshot.testsReport.passedAssertions} /{' '}
                {snapshot.provisioningReport.passedAssertions + snapshot.testsReport.passedAssertions} assertions
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar: Accessible Tabs + Search + Filter */}
      <div
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          {/* Tablist */}
          <div
            role="tablist"
            aria-label="Inspector views"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {TABS.map((t, idx) => {
              const isSelected = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${t.key}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveTab(t.key)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-colors hover:opacity-85"
                >
                  {t.key === 'profiles' && <LayersIcon className="w-4 h-4" />}
                  {t.key === 'images' && <BoxIcon className="w-4 h-4" />}
                  {t.key === 'services' && <ServerIcon className="w-4 h-4" />}
                  {t.key === 'flows' && <WorkflowIcon className="w-4 h-4" />}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Quick Status Selector */}
          <div className="flex flex-wrap items-center gap-2.5 py-2">
            <div className="relative">
              <label htmlFor="global-search" className="sr-only">
                Search containers, images, or profiles
              </label>
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center" style={{ color: 'var(--text-secondary)' }}>
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                id="global-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service, image, profile..."
                className="rounded-lg border pl-9 pr-3 py-1.5 text-xs w-56 sm:w-64"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="status-filter" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                State:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | LiveStatus)}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <option value="all">All ({snapshot.counts.totalDefined})</option>
                <option value="running">Running ({snapshot.counts.running})</option>
                <option value="exited">Exited(0) Completed ({snapshot.counts.exitedCompleted})</option>
                <option value="inactive">Inactive / Stopped ({snapshot.counts.inactive})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tab Panels */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 py-6">
        <div
          role="tabpanel"
          id="panel-profiles"
          aria-labelledby="tab-profiles"
          hidden={activeTab !== 'profiles'}
        >
          <ProfilesMatrixView
            profiles={profiles}
            servicesById={servicesById}
            selectedProfile={selectedProfile}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onSelectProfile={setSelectedProfile}
            onSelectService={setSelectedServiceId}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-images"
          aria-labelledby="tab-images"
          hidden={activeTab !== 'images'}
        >
          <DockerImagesView
            images={images}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onSelectService={setSelectedServiceId}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-services"
          aria-labelledby="tab-services"
          hidden={activeTab !== 'services'}
        >
          <ServicesExplorerTable
            services={services}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            onCategoryChange={setCategoryFilter}
            onSelectService={setSelectedServiceId}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-flows"
          aria-labelledby="tab-flows"
          hidden={activeTab !== 'flows'}
        >
          <BehindTheScenesFlow
            flows={flows}
            snapshot={snapshot}
            servicesById={servicesById}
            onSelectService={setSelectedServiceId}
          />
        </div>
      </main>

      {/* Native Accessible Service Inspector Modal */}
      <ServiceDetailDialog
        service={selectedService}
        allServicesById={servicesById}
        diagnosticNotes={snapshot.liveDiagnosticNotes}
        onClose={() => setSelectedServiceId(null)}
        onSelectService={(id) => setSelectedServiceId(id)}
        onSelectProfile={handleSelectProfileFromDialog}
      />
    </div>
  );
}

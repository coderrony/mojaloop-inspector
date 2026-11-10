export type LiveStatus = 'running' | 'exited' | 'inactive';

export type HealthStatus =
  | 'healthy'
  | 'starting'
  | 'unhealthy'
  | 'none'
  | 'not-started';

export interface ServiceRecord {
  id: string;
  containerName: string;
  category: string;
  image: string;
  imageRepository: string;
  imageTag: string;
  diskSize: string;
  githubRepo: string;
  liveStatus: LiveStatus;
  healthStatus: HealthStatus;
  statusText: string;
  startedAt: string;
  finishedAt: string;
  profiles: string[];
  ports: string[];
  dependsOn: string[];
  command: string;
  volumes: string[];
  envVars: string[];
  shortSummary: string;
  behindTheScenes: string;
  developerCustomization: string;
}

export interface ProfileRecord {
  name: string;
  isExecutedInCommand: boolean;
  description: string;
  totalCount: number;
  runningCount: number;
  exitedCount: number;
  inactiveCount: number;
  services: string[];
}

export interface ImageContainerRef {
  id: string;
  containerName: string;
  liveStatus: LiveStatus;
  healthStatus: HealthStatus;
  statusText: string;
}

export interface ImageRecord {
  image: string;
  repository: string;
  tag: string;
  imageId: string;
  diskUsage: string;
  contentSize: string;
  inUseOnServer: boolean;
  githubRepo: string;
  category: string;
  role: string;
  containers: ImageContainerRef[];
}

export interface FlowStep {
  step: number;
  title: string;
  serviceId: string;
  action: string;
  artifact: string;
}

export interface ArchitectureFlow {
  id: string;
  title: string;
  subtitle: string;
  steps: FlowStep[];
}

export interface DiagnosticNote {
  serviceId: string;
  severity: 'warning' | 'success' | 'info';
  title: string;
  detail: string;
}

export interface TestReportSummary {
  status: string;
  passedAssertions: number;
  failedAssertions: number;
  totalRequests: number;
  totalTestCases: number;
  passPercentage: string;
  durationMs: number;
  completedTime: string;
  reportFile: string;
}

export interface SnapshotData {
  serverHost: string;
  serverIp: string;
  capturedAt: string;
  executedCommand: string;
  activeProfiles: string[];
  counts: {
    totalDefined: number;
    running: number;
    exitedCompleted: number;
    inactive: number;
    totalImages: number;
    pulledImages: number;
    totalProfiles: number;
  };
  provisioningReport: TestReportSummary;
  testsReport: TestReportSummary;
  liveDiagnosticNotes: DiagnosticNote[];
}

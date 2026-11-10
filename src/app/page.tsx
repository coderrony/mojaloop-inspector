import React from 'react';
import snapshotJson from '@/data/snapshot.json';
import servicesJson from '@/data/services.json';
import profilesJson from '@/data/profiles.json';
import imagesJson from '@/data/images.json';
import flowsJson from '@/data/flows.json';
import type {
  ArchitectureFlow,
  ImageRecord,
  ProfileRecord,
  ServiceRecord,
  SnapshotData,
} from '@/types/mojaloop';
import { DashboardClient } from '@/components/DashboardClient';

export default function HomePage() {
  return (
    <DashboardClient
      snapshot={snapshotJson as SnapshotData}
      services={servicesJson as ServiceRecord[]}
      profiles={profilesJson as ProfileRecord[]}
      images={imagesJson as ImageRecord[]}
      flows={flowsJson as ArchitectureFlow[]}
    />
  );
}

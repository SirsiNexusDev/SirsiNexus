import { Breadcrumb } from '@/components/Breadcrumb';
import { Suspense } from 'react';
import { ProjectAnalytics } from '@/components/Analytics/ProjectAnalytics';
import { ProjectAnalyticsSkeleton } from '@/components/Analytics/ProjectAnalyticsSkeleton';

export default function AnalyticsPage() {
  return (
    <div>
      <Breadcrumb />
      <Suspense fallback={<ProjectAnalyticsSkeleton />}>
        <ProjectAnalytics />
      </Suspense>
    </div>
  );
}

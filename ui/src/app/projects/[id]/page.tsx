import { Suspense } from 'react';
import { ProjectDetail } from '@/components/Projects/ProjectDetail';
import { ProjectDetailSkeleton } from '@/components/Projects/ProjectDetailSkeleton';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectDetail id={id} />
      </Suspense>
    </div>
  );
}

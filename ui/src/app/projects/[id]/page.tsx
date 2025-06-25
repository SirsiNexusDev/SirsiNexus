import { Suspense } from 'react';
import { ProjectDetail } from '@/components/Projects/ProjectDetail';
import { ProjectDetailSkeleton } from '@/components/Projects/ProjectDetailSkeleton';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetail id={params.id} />
    </Suspense>
  );
}

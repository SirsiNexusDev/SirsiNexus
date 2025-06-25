import { ProjectForm } from '@/components/ProjectForm';
import { RootLayout } from '@/components/RootLayout';

export default function Home() {
  return (
    <RootLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Create New Project</h1>
        <ProjectForm
          onSubmit={async (data) => {
            console.log('Form submitted:', data);
            // In production, this would connect to the real backend
          }}
        />
      </div>
    </RootLayout>
  );
}

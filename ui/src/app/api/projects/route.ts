import { NextResponse } from 'next/server';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['active', 'completed', 'archived']),
  settings: z.object({
    visibility: z.enum(['public', 'private']),
    allowComments: z.boolean(),
    notifications: z.boolean(),
  }),
  tags: z.array(z.string()),
});

// Comprehensive mock data for projects
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Platform Migration',
    description: 'Complete migration of legacy e-commerce platform to AWS with microservices architecture, implementing CI/CD pipelines and auto-scaling capabilities. This project involves migrating a monolithic PHP application to a modern React/Node.js stack with containerized services.',
    status: 'active',
    tags: ['ecommerce', 'aws', 'microservices', 'ci-cd', 'auto-scaling', 'php', 'react', 'nodejs'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-01T15:30:00Z',
    stats: {
      tasks: 45,
      completed: 32,
      pending: 8,
      blocked: 5,
    },
    team: [
      { id: '1', name: 'Sarah Chen', role: 'admin', avatar: '/avatars/sarah.jpg' },
      { id: '2', name: 'Marcus Johnson', role: 'member', avatar: '/avatars/marcus.jpg' },
      { id: '3', name: 'Elena Rodriguez', role: 'member', avatar: '/avatars/elena.jpg' },
      { id: '4', name: 'David Kim', role: 'member', avatar: '/avatars/david.jpg' },
    ],
    settings: {
      visibility: 'public',
      allowComments: true,
      notifications: true,
    },
  },
  {
    id: '2',
    name: 'Legacy Database Modernization',
    description: 'Comprehensive modernization of Oracle databases to PostgreSQL on Google Cloud Platform with data validation, performance optimization, and zero-downtime migration strategy. Includes setting up read replicas, implementing connection pooling, and optimizing query performance.',
    status: 'completed',
    tags: ['database', 'postgresql', 'gcp', 'performance', 'oracle', 'migration', 'optimization'],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-06-25T16:45:00Z',
    stats: {
      tasks: 38,
      completed: 38,
      pending: 0,
      blocked: 0,
    },
    team: [
      { id: '5', name: 'Alex Thompson', role: 'admin', avatar: '/avatars/alex.jpg' },
      { id: '6', name: 'Maria Santos', role: 'member', avatar: '/avatars/maria.jpg' },
      { id: '7', name: 'James Wilson', role: 'member', avatar: '/avatars/james.jpg' },
    ],
    settings: {
      visibility: 'private',
      allowComments: true,
      notifications: false,
    },
  },
  {
    id: '3',
    name: 'SAP ERP Cloud Migration',
    description: 'Enterprise SAP ERP system migration to Azure with hybrid connectivity, security hardening, and disaster recovery implementation. This complex project involves migrating critical business processes with minimal disruption to daily operations.',
    status: 'active',
    tags: ['sap', 'erp', 'azure', 'enterprise', 'security', 'disaster-recovery', 'hybrid'],
    createdAt: '2024-02-01T08:30:00Z',
    updatedAt: '2024-07-01T11:20:00Z',
    stats: {
      tasks: 67,
      completed: 23,
      pending: 35,
      blocked: 9,
    },
    team: [
      { id: '8', name: 'Robert Chang', role: 'admin', avatar: '/avatars/robert.jpg' },
      { id: '9', name: 'Lisa Park', role: 'admin', avatar: '/avatars/lisa.jpg' },
      { id: '10', name: 'Ahmed Hassan', role: 'member', avatar: '/avatars/ahmed.jpg' },
      { id: '11', name: 'Jennifer Lee', role: 'member', avatar: '/avatars/jennifer.jpg' },
      { id: '12', name: 'Carlos Mendez', role: 'member', avatar: '/avatars/carlos.jpg' },
    ],
    settings: {
      visibility: 'private',
      allowComments: false,
      notifications: true,
    },
  },
  {
    id: '4',
    name: 'Container Orchestration Setup',
    description: 'Implementation of Kubernetes clusters on multiple cloud providers with service mesh, monitoring, and automated deployment pipelines. Features include Istio service mesh, Prometheus monitoring, Grafana dashboards, and GitOps workflows.',
    status: 'active',
    tags: ['kubernetes', 'containers', 'devops', 'monitoring', 'multi-cloud', 'istio', 'prometheus', 'grafana'],
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-07-01T09:15:00Z',
    stats: {
      tasks: 29,
      completed: 18,
      pending: 8,
      blocked: 3,
    },
    team: [
      { id: '13', name: 'Michael Brown', role: 'admin', avatar: '/avatars/michael.jpg' },
      { id: '14', name: 'Sophie Turner', role: 'member', avatar: '/avatars/sophie.jpg' },
      { id: '15', name: 'Diego Ramirez', role: 'member', avatar: '/avatars/diego.jpg' },
    ],
    settings: {
      visibility: 'public',
      allowComments: true,
      notifications: true,
    },
  },
  {
    id: '5',
    name: 'Data Warehouse Transformation',
    description: 'Migration from on-premises Teradata to cloud-native data warehouse solution with real-time analytics and machine learning capabilities. Implementing modern data lake architecture with Delta Lake, Apache Spark, and automated ETL pipelines.',
    status: 'active',
    tags: ['data-warehouse', 'analytics', 'ml', 'teradata', 'real-time', 'spark', 'etl', 'delta-lake'],
    createdAt: '2024-04-20T10:45:00Z',
    updatedAt: '2024-07-01T13:30:00Z',
    stats: {
      tasks: 52,
      completed: 31,
      pending: 15,
      blocked: 6,
    },
    team: [
      { id: '16', name: 'Rachel Green', role: 'admin', avatar: '/avatars/rachel.jpg' },
      { id: '17', name: 'Kevin Singh', role: 'member', avatar: '/avatars/kevin.jpg' },
      { id: '18', name: 'Emma Watson', role: 'member', avatar: '/avatars/emma.jpg' },
      { id: '19', name: 'Lucas Miller', role: 'member', avatar: '/avatars/lucas.jpg' },
    ],
    settings: {
      visibility: 'private',
      allowComments: true,
      notifications: true,
    },
  },
];

export async function GET() {
  try {
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return NextResponse.json({
      success: true,
      data: mockProjects,
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    // Create new project with mock data structure
    const newProject = {
      id: (mockProjects.length + 1).toString(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        tasks: 0,
        completed: 0,
        pending: 0,
        blocked: 0,
      },
      team: [],
    };

    // Add to mock projects array
    mockProjects.push(newProject);

    return NextResponse.json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid project data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Failed to create project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create project' 
      },
      { status: 500 }
    );
  }
}

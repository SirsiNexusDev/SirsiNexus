import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            team: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const projectsWithStats = projects.map(project => ({
      ...project,
      stats: {
        tasks: project._count.tasks,
        completed: project.tasks?.filter(t => t.status === 'completed').length || 0,
        inProgress: project.tasks?.filter(t => t.status === 'in_progress').length || 0,
        blockers: project.tasks?.filter(t => t.status === 'blocked').length || 0,
      },
    }));

    return NextResponse.json(projectsWithStats);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    const project = await db.project.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        team: {
          create: [
            {
              userId: session.user.id,
              role: 'owner',
            },
          ],
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

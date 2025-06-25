import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tasks = await db.task.findMany({
      where: {
        projectId: params.id,
        project: {
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
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const project = await db.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        team: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isTeamMember = project.ownerId === session.user.id ||
      project.team.some(member => member.userId === session.user.id);

    if (!isTeamMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = taskSchema.parse(body);

    if (validatedData.assigneeId) {
      const isValidAssignee = project.team.some(
        member => member.userId === validatedData.assigneeId
      );

      if (!isValidAssignee) {
        return NextResponse.json(
          { error: 'Assignee must be a team member' },
          { status: 400 }
        );
      }
    }

    const task = await db.task.create({
      data: {
        ...validatedData,
        projectId: params.id,
        createdById: session.user.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid task data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

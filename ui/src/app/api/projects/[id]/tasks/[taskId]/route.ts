import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().min(1, 'Task description is required').optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
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
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
        projectId: params.id,
      },
      include: {
        project: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const isTeamMember = task.project.ownerId === session.user.id ||
      task.project.team.some(member => member.userId === session.user.id);

    if (!isTeamMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = taskUpdateSchema.parse(body);

    if (validatedData.assigneeId) {
      const isValidAssignee = task.project.team.some(
        member => member.userId === validatedData.assigneeId
      );

      if (!isValidAssignee) {
        return NextResponse.json(
          { error: 'Assignee must be a team member' },
          { status: 400 }
        );
      }
    }

    const updatedTask = await db.task.update({
      where: {
        id: params.taskId,
      },
      data: validatedData,
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid task data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
        projectId: params.id,
      },
      include: {
        project: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const isAuthorized = task.project.ownerId === session.user.id ||
      task.project.team.some(member =>
        member.userId === session.user.id &&
        ['owner', 'admin'].includes(member.role)
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Only project owners and admins can delete tasks' },
        { status: 403 }
      );
    }

    await db.task.delete({
      where: {
        id: params.taskId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

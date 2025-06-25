import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const teamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']),
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

    const project = await db.project.findUnique({
      where: {
        id: params.id,
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
        team: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project.team);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
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

    const isAuthorized = project.ownerId === session.user.id || 
      project.team.some(member => 
        member.userId === session.user.id && 
        ['owner', 'admin'].includes(member.role)
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = teamMemberSchema.parse(body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a team member
    const existingMember = project.team.find(member => member.userId === userId);
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    const updatedProject = await db.project.update({
      where: {
        id: params.id,
      },
      data: {
        team: {
          create: {
            userId,
            role,
          },
        },
      },
      include: {
        team: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedProject.team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid team member data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to add team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const isAuthorized = project.ownerId === session.user.id || 
      project.team.some(member => 
        member.userId === session.user.id && 
        ['owner', 'admin'].includes(member.role)
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = teamMemberSchema.parse(body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const existingMember = project.team.find(member => member.userId === userId);
    if (!existingMember) {
      return NextResponse.json(
        { error: 'User is not a team member' },
        { status: 404 }
      );
    }

    const updatedProject = await db.project.update({
      where: {
        id: params.id,
      },
      data: {
        team: {
          update: {
            where: {
              id: existingMember.id,
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        team: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedProject.team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid team member data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

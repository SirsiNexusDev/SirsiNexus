import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; userId: string } }
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

    const teamMember = project.team.find(member => member.userId === params.userId);
    if (!teamMember) {
      return NextResponse.json(
        { error: 'User is not a team member' },
        { status: 404 }
      );
    }

    // Prevent removing the owner
    if (teamMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the project owner' },
        { status: 403 }
      );
    }

    await db.project.update({
      where: {
        id: params.id,
      },
      data: {
        team: {
          delete: {
            id: teamMember.id,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

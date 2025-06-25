import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's projects
    const userProjects = await db.project.findMany({
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
        stats: true,
      },
    });

    // Calculate project status distribution
    const projectStats = {
      total: userProjects.length,
      active: userProjects.filter(p => p.status === 'active').length,
      completed: userProjects.filter(p => p.status === 'completed').length,
      archived: userProjects.filter(p => p.status === 'archived').length,
    };

    // Calculate task statistics
    const taskStats = userProjects.reduce(
      (acc, project) => {
        if (project.stats) {
          acc.total += project.stats.tasks;
          acc.completed += project.stats.completed;
          acc.inProgress += project.stats.inProgress;
          acc.blockers += project.stats.blockers;
        }
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0, blockers: 0 }
    );

    // Get historical data for trends
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const historicalProjects = await db.project.findMany({
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
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const historicalTasks = await db.task.findMany({
      where: {
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
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group historical data by day
    const projectTrend = new Array(7).fill(0).map((_, index) => {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: historicalProjects.filter(
          p => p.createdAt.toISOString().split('T')[0] === dateStr
        ).length,
      };
    });

    const taskTrend = new Array(7).fill(0).map((_, index) => {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: historicalTasks.filter(
          t => t.createdAt.toISOString().split('T')[0] === dateStr
        ).length,
      };
    });

    return NextResponse.json({
      projects: projectStats,
      tasks: taskStats,
      trends: {
        projects: projectTrend,
        tasks: taskTrend,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

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
    const userProjects = await db.project.findMany();

    // Calculate project status distribution
    const projectStats = {
      total: userProjects.length,
      active: userProjects.filter(p => p.status === 'active').length,
      completed: userProjects.filter(p => p.status === 'completed').length,
      archived: userProjects.filter(p => p.status === 'archived').length,
    };

    // Calculate task statistics
    const taskStats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      blockers: 0,
    };

    // Mock trend data
    const projectTrend = new Array(7).fill(0).map((_, index) => ({
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5),
    }));

    const taskTrend = new Array(7).fill(0).map((_, index) => ({
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10),
    }));

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

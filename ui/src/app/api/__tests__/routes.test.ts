import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../api/projects/route';
import { GET as getProject, PUT as updateProject, DELETE as deleteProject } from '../../api/projects/[id]/route';
import { GET as getTasks, POST as createTask } from '../../api/projects/[id]/tasks/route';
import { GET as getTeam, POST as addTeamMember } from '../../api/projects/[id]/team/route';

// Mock the auth module
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    projectMember: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
}));

import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  }
};

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerId: '1'
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Task Description',
  status: 'todo',
  priority: 'medium',
  projectId: '1',
  assignedToId: '1',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('Projects API', () => {
    describe('GET /api/projects', () => {
      it('should return projects for authenticated user', async () => {
        (db.project.findMany as jest.Mock).mockResolvedValue([mockProject]);

        const request = new NextRequest('http://localhost/api/projects');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([mockProject]);
        expect(db.project.findMany).toHaveBeenCalledWith({
          where: { ownerId: '1' },
          include: {
            tasks: true,
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost/api/projects');
        const response = await GET(request);

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/projects', () => {
      it('should create a new project', async () => {
        (db.project.create as jest.Mock).mockResolvedValue(mockProject);

        const request = new NextRequest('http://localhost/api/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Project',
            description: 'Test Description'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toEqual(mockProject);
        expect(db.project.create).toHaveBeenCalledWith({
          data: {
            name: 'Test Project',
            description: 'Test Description',
            ownerId: '1'
          },
          include: {
            tasks: true,
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        });
      });

      it('should return 400 for invalid data', async () => {
        const request = new NextRequest('http://localhost/api/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: '' // Invalid empty name
          })
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/projects/[id]', () => {
      it('should return specific project', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);

        const response = await getProject(
          new NextRequest('http://localhost/api/projects/1'),
          { params: { id: '1' } }
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockProject);
      });

      it('should return 404 for non-existent project', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(null);

        const response = await getProject(
          new NextRequest('http://localhost/api/projects/999'),
          { params: { id: '999' } }
        );

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/projects/[id]', () => {
      it('should update project', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.project.update as jest.Mock).mockResolvedValue({
          ...mockProject,
          name: 'Updated Project'
        });

        const request = new NextRequest('http://localhost/api/projects/1', {
          method: 'PUT',
          body: JSON.stringify({
            name: 'Updated Project'
          })
        });

        const response = await updateProject(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.name).toBe('Updated Project');
      });
    });

    describe('DELETE /api/projects/[id]', () => {
      it('should delete project', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.project.delete as jest.Mock).mockResolvedValue(mockProject);

        const response = await deleteProject(
          new NextRequest('http://localhost/api/projects/1'),
          { params: { id: '1' } }
        );

        expect(response.status).toBe(204);
        expect(db.project.delete).toHaveBeenCalledWith({
          where: { id: '1' }
        });
      });
    });
  });

  describe('Tasks API', () => {
    describe('GET /api/projects/[id]/tasks', () => {
      it('should return tasks for project', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.task.findMany as jest.Mock).mockResolvedValue([mockTask]);

        const response = await getTasks(
          new NextRequest('http://localhost/api/projects/1/tasks'),
          { params: { id: '1' } }
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([mockTask]);
      });
    });

    describe('POST /api/projects/[id]/tasks', () => {
      it('should create new task', async () => {
        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.task.create as jest.Mock).mockResolvedValue(mockTask);

        const request = new NextRequest('http://localhost/api/projects/1/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Test Task',
            description: 'Test Task Description',
            priority: 'medium'
          })
        });

        const response = await createTask(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toEqual(mockTask);
      });
    });
  });

  describe('Team Management API', () => {
    describe('GET /api/projects/[id]/team', () => {
      it('should return team members', async () => {
        const mockMembers = [
          {
            id: '1',
            projectId: '1',
            userId: '1',
            role: 'owner',
            user: { id: '1', name: 'Test User', email: 'test@example.com' }
          }
        ];

        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.projectMember.findMany as jest.Mock).mockResolvedValue(mockMembers);

        const response = await getTeam(
          new NextRequest('http://localhost/api/projects/1/team'),
          { params: { id: '1' } }
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockMembers);
      });
    });

    describe('POST /api/projects/[id]/team', () => {
      it('should add team member', async () => {
        const mockUser = { id: '2', email: 'user2@example.com', name: 'User 2' };
        const mockMember = {
          id: '2',
          projectId: '1',
          userId: '2',
          role: 'member',
          user: mockUser
        };

        (db.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
        (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (db.projectMember.create as jest.Mock).mockResolvedValue(mockMember);

        const request = new NextRequest('http://localhost/api/projects/1/team', {
          method: 'POST',
          body: JSON.stringify({
            email: 'user2@example.com',
            role: 'member'
          })
        });

        const response = await addTeamMember(request, { params: { id: '1' } });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toEqual(mockMember);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (db.project.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/projects');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Security Tests', () => {
    it('should not allow access to other users projects', async () => {
      const otherUserProject = { ...mockProject, ownerId: '2' };
      (db.project.findFirst as jest.Mock).mockResolvedValue(otherUserProject);

      const response = await getProject(
        new NextRequest('http://localhost/api/projects/1'),
        { params: { id: '1' } }
      );

      expect(response.status).toBe(403);
    });

    it('should validate user permissions for team operations', async () => {
      const nonOwnerProject = { ...mockProject, ownerId: '2' };
      (db.project.findFirst as jest.Mock).mockResolvedValue(nonOwnerProject);

      const request = new NextRequest('http://localhost/api/projects/1/team', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          role: 'member'
        })
      });

      const response = await addTeamMember(request, { params: { id: '1' } });

      expect(response.status).toBe(403);
    });
  });
});

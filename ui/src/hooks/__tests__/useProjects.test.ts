import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useProjects } from '../useProjects';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import agentReducer from '@/store/slices/agentSlice';
import projectReducer from '@/store/slices/projectSlice';
import { projectsApi } from '@/lib/api/projects';

// Mock the projectsApi
jest.mock('@/lib/api/projects', () => ({
  projectsApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addTeamMember: jest.fn(),
    removeTeamMember: jest.fn(),
  },
}));

// Mock the useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('useProjects', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
        agent: agentReducer,
        projects: projectReducer,
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock for list API to prevent hanging
    (projectsApi.list as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  it('fetches projects on mount', async () => {
    const mockProjects = [{
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: '1',
        name: 'John Doe',
      },
      team: [],
      settings: {
        visibility: 'public',
        allowComments: true,
        notifications: true,
      },
      tags: ['test'],
      stats: {
        tasks: 0,
        completed: 0,
        pending: 0,
        blocked: 0,
      },
    }];

    (projectsApi.list as jest.Mock).mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProjects(), {
        wrapper,
      });
      result = hookResult.result;
    });

    await waitFor(() => {
      expect(result.current.projects).toEqual(mockProjects);
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(projectsApi.list).toHaveBeenCalled();
  });

  it('creates a new project', async () => {
    const newProject = {
      name: 'New Project',
      description: 'New Description',
      status: 'active' as const,
      owner: {
        id: '1',
        name: 'John Doe',
      },
      team: [],
      settings: {
        visibility: 'public' as const,
        allowComments: true,
        notifications: true,
      },
      tags: ['new'],
      stats: {
        tasks: 0,
        completed: 0,
        pending: 0,
        blocked: 0,
      },
    };

    const createdProject = {
      ...newProject,
      id: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (projectsApi.create as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: createdProject,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper,
    });

    let response;
    await act(async () => {
      response = await result.current.createProject(newProject);
    });

    await waitFor(() => {
      expect(projectsApi.create).toHaveBeenCalledWith(newProject);
      expect(response).toEqual(createdProject);
      expect(result.current.projects).toContainEqual(createdProject);
    });
  }, 10000);

  it('updates a project', async () => {
    const projectId = '1';
    const updates = {
      name: 'Updated Project',
      description: 'Updated Description',
    };

    const updatedProject = {
      id: projectId,
      ...updates,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: '1',
        name: 'John Doe',
      },
      team: [],
      settings: {
        visibility: 'public',
        allowComments: true,
        notifications: true,
      },
      tags: ['test'],
      stats: {
        tasks: 0,
        completed: 0,
        pending: 0,
        blocked: 0,
      },
    };

    (projectsApi.update as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: updatedProject,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper,
    });

    let response;
    await act(async () => {
      response = await result.current.updateProjectDetails(projectId, updates);
    });

    expect(projectsApi.update).toHaveBeenCalledWith(projectId, updates);
    expect(response).toEqual(updatedProject);
  });

  it('deletes a project', async () => {
    const projectId = '1';

    (projectsApi.delete as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper,
    });

    let response;
    await act(async () => {
      response = await result.current.deleteProject(projectId);
    });

    await waitFor(() => {
      expect(projectsApi.delete).toHaveBeenCalledWith(projectId);
      expect(response).toBe(true);
      expect(result.current.projects).not.toContainEqual(expect.objectContaining({ id: projectId }));
    });
  }, 10000);

  it('handles API errors', async () => {
    const error = 'API Error';
    (projectsApi.list as jest.Mock).mockRejectedValue(new Error(error));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProjects(), {
        wrapper,
      });
      result = hookResult.result;
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });
  });

  it('updates filters', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper,
    });

    act(() => {
      result.current.setFilters({ status: ['active'] });
    });

    expect(result.current.filters.status).toEqual(['active']);
  });

  it('updates sort', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(Provider, { store }, children)
    );

    const { result } = renderHook(() => useProjects(), {
      wrapper,
    });

    act(() => {
      result.current.setSort('name', 'asc');
    });

    expect(result.current.sort).toEqual({
      field: 'name',
      order: 'asc',
    });
  });
});

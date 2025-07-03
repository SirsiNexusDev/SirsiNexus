import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Projects } from '../Projects';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import agentReducer from '@/store/slices/agentSlice';
import projectReducer from '@/store/slices/projectSlice';

// Mock the API
jest.mock('@/lib/api/projects', () => ({
  projectsApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockProjectsApi = require('@/lib/api/projects').projectsApi;

// Mock the toast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockProjects = [
  {
    id: '1',
    name: 'Test Project',
    description: 'A test project',
    status: 'active',
    tags: ['test'],
    stats: { tasks: 5, completed: 2, pending: 2, blocked: 1 },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

const createMockStore = (overrideState = {}) => configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    agent: agentReducer,
    projects: projectReducer,
  },
  preloadedState: {
    projects: {
      projects: mockProjects,
      currentProject: null,
      loading: false,
      error: null,
      filters: {
        search: '',
        status: [],
        tags: [],
      },
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
      ...overrideState,
    },
  },
});

describe('Projects', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Mock successful API response
    mockProjectsApi.list.mockResolvedValue({
      success: true,
      data: mockProjects,
    });
  });

  it('renders project list', async () => {
    const mockStore = createMockStore();
    
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('A test project')).toBeInTheDocument();
    });
  });

  it('filters projects by search term', async () => {
    const mockStore = createMockStore();
    
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  it('filters projects by status', async () => {
    const mockStore = createMockStore();
    
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const statusFilter = screen.getByText('Filter by status');
    fireEvent.click(statusFilter);
    
    const completedOption = screen.getByText('Completed');
    fireEvent.click(completedOption);

    await waitFor(() => {
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  it('sorts projects', async () => {
    const mockStore = createMockStore();
    
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const sortSelect = screen.getByText('Sort by');
    fireEvent.click(sortSelect);
    
    const nameOption = screen.getByText('Name A-Z');
    fireEvent.click(nameOption);

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.projects.sort.field).toBe('name');
      expect(state.projects.sort.order).toBe('asc');
    });
  });

  it('confirms before deleting a project', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    mockProjectsApi.delete.mockResolvedValue({ success: true });
    
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('shows loading state', () => {
    const loadingStore = createMockStore({ loading: true });

    render(
      <Provider store={loadingStore}>
        <Projects />
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorStore = createMockStore({ error: 'Failed to load projects' });

    render(
      <Provider store={errorStore}>
        <Projects />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to load projects')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Projects } from '../Projects';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import agentReducer from '@/store/slices/agentSlice';
import projectReducer from '@/store/slices/projectSlice';

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    agent: agentReducer,
    project: projectReducer,
  },
  preloadedState: {
    project: {
      projects: [
        {
          id: '1',
          name: 'Test Project',
          description: 'A test project',
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
          tags: ['test', 'active'],
          stats: {
            tasks: 5,
            completed: 2,
            inProgress: 2,
            blockers: 1,
          },
        },
      ],
      currentProject: null,
      loading: false,
      error: null,
      filters: {
        status: [],
        tags: [],
        search: '',
      },
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
    },
  },
});

describe('Projects', () => {
  it('renders project list', () => {
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
  });

  it('filters projects by search term', () => {
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });

  it('filters projects by status', async () => {
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    const statusFilter = screen.getByPlaceholderText('Filter by status');
    fireEvent.click(statusFilter);
    
    const completedOption = screen.getByText('Completed');
    fireEvent.click(completedOption);

    await waitFor(() => {
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  it('sorts projects', async () => {
    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    const sortSelect = screen.getByPlaceholderText('Sort by');
    fireEvent.click(sortSelect);
    
    const nameOption = screen.getByText('Name A-Z');
    fireEvent.click(nameOption);

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.project.sort.field).toBe('name');
      expect(state.project.sort.order).toBe('asc');
    });
  });

  it('confirms before deleting a project', () => {
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(
      <Provider store={mockStore}>
        <Projects />
      </Provider>
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('shows loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
        agent: agentReducer,
        project: projectReducer,
      },
      preloadedState: {
        project: {
          ...mockStore.getState().project,
          loading: true,
        },
      },
    });

    render(
      <Provider store={loadingStore}>
        <Projects />
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
        agent: agentReducer,
        project: projectReducer,
      },
      preloadedState: {
        project: {
          ...mockStore.getState().project,
          error: 'Failed to load projects',
        },
      },
    });

    render(
      <Provider store={errorStore}>
        <Projects />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to load projects')).toBeInTheDocument();
  });
});

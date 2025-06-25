import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { EditProject } from '../EditProject';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import agentReducer from '@/store/slices/agentSlice';
import projectReducer from '@/store/slices/projectSlice';
import { Project } from '@/store/slices/projectSlice';

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    agent: agentReducer,
    project: projectReducer,
  },
});

const mockProject: Project = {
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
  tags: ['test', 'mock'],
  stats: {
    tasks: 0,
    completed: 0,
    inProgress: 0,
    blockers: 0,
  },
};

describe('EditProject', () => {
  it('renders edit project modal with project data', () => {
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test, mock')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    const nameInput = screen.getByDisplayValue('Test Project');
    const descriptionInput = screen.getByDisplayValue('Test Description');
    
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(descriptionInput, { target: { value: '' } });
    
    fireEvent.click(screen.getByText('Update Project'));

    expect(await screen.findByText('Project name is required')).toBeInTheDocument();
    expect(await screen.findByText('Project description is required')).toBeInTheDocument();
  });

  it('calls onOpenChange when canceling', () => {
    const handleOpenChange = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={handleOpenChange}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates project with valid data', async () => {
    const handleOpenChange = jest.fn();
    const handleSuccess = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={handleOpenChange}
          onSuccess={handleSuccess}
        />
      </Provider>
    );

    const nameInput = screen.getByDisplayValue('Test Project');
    fireEvent.change(nameInput, { target: { value: 'Updated Project' } });

    const descriptionInput = screen.getByDisplayValue('Test Description');
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    const tagsInput = screen.getByDisplayValue('test, mock');
    fireEvent.change(tagsInput, { target: { value: 'updated, test' } });

    // Submit form
    fireEvent.click(screen.getByText('Update Project'));

    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(handleSuccess).toHaveBeenCalled();
    });

    const state = mockStore.getState();
    expect(state.project.projects[0]).toMatchObject({
      name: 'Updated Project',
      description: 'Updated Description',
      tags: ['updated', 'test'],
    });
  });

  it('resets form when modal is reopened', () => {
    const { rerender } = render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    const nameInput = screen.getByDisplayValue('Test Project');
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

    rerender(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={false}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    rerender(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
  });

  it('updates project status', async () => {
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Select status'));
    fireEvent.click(screen.getByText('Completed'));

    fireEvent.click(screen.getByText('Update Project'));

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.project.projects[0].status).toBe('completed');
    });
  });

  it('updates project visibility', async () => {
    render(
      <Provider store={mockStore}>
        <EditProject
          project={mockProject}
          open={true}
          onOpenChange={() => {}}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Select visibility'));
    fireEvent.click(screen.getByText('Private'));

    fireEvent.click(screen.getByText('Update Project'));

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.project.projects[0].settings.visibility).toBe('private');
    });
  });
});

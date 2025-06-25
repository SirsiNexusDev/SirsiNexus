import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateProject } from '../CreateProject';
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
});

describe('CreateProject', () => {
  it('renders create project button', () => {
    render(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );

    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('opens modal on button click', async () => {
    render(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );

    fireEvent.click(screen.getByText('Create Project'));

    expect(await screen.findByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Project description')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );

    fireEvent.click(screen.getByText('Create Project'));
    fireEvent.click(screen.getByText('Create Project', { selector: 'button[type="submit"]' }));

    expect(await screen.findByText('Project name is required')).toBeInTheDocument();
    expect(await screen.findByText('Project description is required')).toBeInTheDocument();
  });

  it('creates a new project with valid data', async () => {
    const onSuccess = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <CreateProject onSuccess={onSuccess} />
      </Provider>
    );

    // Open modal
    fireEvent.click(screen.getByText('Create Project'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Project name'), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByPlaceholderText('Project description'), {
      target: { value: 'A test project description' },
    });

    // Select status
    fireEvent.click(screen.getByText('Select status'));
    fireEvent.click(screen.getByText('Active'));

    // Select visibility
    fireEvent.click(screen.getByText('Select visibility'));
    fireEvent.click(screen.getByText('Private'));

    // Add tags
    fireEvent.change(screen.getByPlaceholderText('Enter tags separated by commas'), {
      target: { value: 'test,project,new' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Create Project', { selector: 'button[type="submit"]' }));

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.project.projects).toHaveLength(1);
      expect(state.project.projects[0]).toMatchObject({
        name: 'Test Project',
        description: 'A test project description',
        status: 'active',
        settings: {
          visibility: 'private',
        },
        tags: ['test', 'project', 'new'],
      });
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('closes modal without creating project when clicking cancel', async () => {
    render(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );

    // Open modal
    fireEvent.click(screen.getByText('Create Project'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Project name'), {
      target: { value: 'Test Project' },
    });

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });

    const state = mockStore.getState();
    expect(state.project.projects).toHaveLength(0);
  });

  it('resets form when modal is closed', async () => {
    render(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );

    // Open modal
    fireEvent.click(screen.getByText('Create Project'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Project name'), {
      target: { value: 'Test Project' },
    });

    // Close modal
    fireEvent.click(screen.getByText('Cancel'));

    // Reopen modal
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByPlaceholderText('Project name')).toHaveValue('');
  });
});

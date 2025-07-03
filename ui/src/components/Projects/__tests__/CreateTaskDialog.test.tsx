import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTaskDialog } from '../CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

// Mock the hooks
jest.mock('@/hooks/useTasks');
jest.mock('@/hooks/useProjects');

const mockProject = {
  id: 'project-1',
  team: [
    {
      id: 'team-1',
      userId: 'user-1',
      user: { name: 'John Doe' },
    },
  ],
};

const mockCreateTask = jest.fn();
const mockSetOpen = jest.fn();

describe('CreateTaskDialog', () => {
  beforeEach(() => {
    (useTasks as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
      loading: false,
      error: null,
    });

    (useProjects as jest.Mock).mockReturnValue({
      projects: [mockProject],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when open', () => {
    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('shows loading state during task creation', async () => {
    (useTasks as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
      loading: true,
      error: null,
    });

    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message when task creation fails', async () => {
    const errorMessage = 'Failed to create task';
    (useTasks as jest.Mock).mockReturnValue({
      createTask: mockCreateTask,
      loading: false,
      error: errorMessage,
    });

    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const user = userEvent.setup();
    mockCreateTask.mockResolvedValueOnce({ id: 'task-1' });

    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    // Fill out the form
    await user.type(screen.getByPlaceholderText('Task title'), 'Test Task');
    await user.type(screen.getByPlaceholderText('Task description'), 'Test Description');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
        projectId: 'project-1',
        dueDate: undefined,
        assigneeId: undefined,
      });
    });

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
      expect(screen.getByText('Task description is required')).toBeInTheDocument();
    });

    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CreateTaskDialog
        projectId="project-1"
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});

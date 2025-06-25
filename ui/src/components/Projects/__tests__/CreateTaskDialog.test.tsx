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

    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
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

    const submitButton = screen.getByText('Create Task');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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
    await user.type(screen.getByLabelText('Title'), 'Test Task');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    
    // Select status
    await user.click(screen.getByLabelText('Status'));
    await user.click(screen.getByText('To Do'));

    // Select priority
    await user.click(screen.getByLabelText('Priority'));
    await user.click(screen.getByText('Medium'));

    // Submit the form
    await user.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium',
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
    await user.click(screen.getByText('Create Task'));

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

    await user.click(screen.getByText('Cancel'));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});

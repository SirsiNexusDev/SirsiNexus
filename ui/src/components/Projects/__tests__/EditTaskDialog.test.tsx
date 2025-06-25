import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditTaskDialog } from '../EditTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

// Mock the hooks
jest.mock('@/hooks/useTasks');
jest.mock('@/hooks/useProjects');

const mockTask = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Existing Task',
  description: 'Existing Description',
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: '2025-12-31T00:00:00.000Z',
  assigneeId: 'user-1',
  createdAt: '2025-06-25T00:00:00.000Z',
  updatedAt: '2025-06-25T00:00:00.000Z',
};

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

const mockUpdateTask = jest.fn();
const mockSetOpen = jest.fn();

describe('EditTaskDialog', () => {
  beforeEach(() => {
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: mockUpdateTask,
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

  it('renders the dialog with existing task data', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue(mockTask.title);
    expect(screen.getByLabelText('Description')).toHaveValue(mockTask.description);
    expect(screen.getByText(mockTask.status.replace('_', ' '))).toBeInTheDocument();
    expect(screen.getByText(mockTask.priority)).toBeInTheDocument();
  });

  it('shows loading state during task update', async () => {
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: mockUpdateTask,
      loading: true,
      error: null,
    });

    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    const submitButton = screen.getByText('Update Task');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when task update fails', async () => {
    const errorMessage = 'Failed to update task';
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: mockUpdateTask,
      loading: false,
      error: errorMessage,
    });

    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('submits the form with updated data', async () => {
    const user = userEvent.setup();
    mockUpdateTask.mockResolvedValueOnce({ id: 'task-1' });

    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    // Update the title
    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    // Update description
    const descriptionInput = screen.getByLabelText('Description');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    // Update status
    await user.click(screen.getByLabelText('Status'));
    await user.click(screen.getByText('In Progress'));

    // Update priority
    await user.click(screen.getByLabelText('Priority'));
    await user.click(screen.getByText('High'));

    // Submit the form
    await user.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'in_progress',
        priority: 'high',
        dueDate: mockTask.dueDate,
        assigneeId: mockTask.assigneeId,
      });
    });

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    // Clear required fields
    await user.clear(screen.getByLabelText('Title'));
    await user.clear(screen.getByLabelText('Description'));

    // Try to submit
    await user.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
      expect(screen.getByText('Task description is required')).toBeInTheDocument();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockSetOpen}
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});

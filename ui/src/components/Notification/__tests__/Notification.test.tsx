import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Notification, NotificationContainer } from '../Notification';

// Mock framer-motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Notification', () => {
  const mockNotification = {
    id: '1',
    type: 'success' as const,
    title: 'Test Title',
    message: 'Test Message',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders notification with correct content', () => {
    render(<Notification {...mockNotification} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Notification {...mockNotification} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockNotification.onClose).toHaveBeenCalledWith('1');
  });

  it('auto-closes after duration', () => {
    render(<Notification {...mockNotification} duration={1000} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockNotification.onClose).toHaveBeenCalledWith('1');
  });

  it('does not auto-close when duration is 0', () => {
    render(<Notification {...mockNotification} duration={0} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockNotification.onClose).not.toHaveBeenCalled();
  });

  it('applies different styles based on type', () => {
    const types: Array<'success' | 'error' | 'warning' | 'info'> = [
      'success',
      'error',
      'warning',
      'info',
    ];

    types.forEach((type) => {
      const { container } = render(
        <Notification {...mockNotification} type={type} />
      );
      
      // Reset container between renders
      document.body.innerHTML = '';
      
      // Check for type-specific class
      const className = type === 'success' ? 'bg-green-50' :
        type === 'error' ? 'bg-red-50' :
        type === 'warning' ? 'bg-yellow-50' :
        'bg-blue-50';
      expect(container.firstChild).toHaveClass(className);
    });
  });
});

describe('NotificationContainer', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Success',
      message: 'Success message',
      onClose: jest.fn(),
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Error',
      message: 'Error message',
      onClose: jest.fn(),
    },
  ];

  it('renders multiple notifications', () => {
    render(
      <NotificationContainer
        notifications={mockNotifications}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onClose with correct ID when notification is closed', () => {
    const onClose = jest.fn();
    render(
      <NotificationContainer
        notifications={mockNotifications}
        onClose={onClose}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledWith('1');
  });

  it('renders notifications in correct order', () => {
    const { container } = render(
      <NotificationContainer
        notifications={mockNotifications}
        onClose={jest.fn()}
      />
    );

    const notifications = container.querySelectorAll('.max-w-sm');
    expect(notifications[0]).toHaveTextContent('Success');
    expect(notifications[1]).toHaveTextContent('Error');
  });
});

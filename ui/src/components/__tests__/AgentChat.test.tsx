import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentChat } from '../AgentChat';

describe('AgentChat', () => {
  const mockContextualHints = [
    'Test hint 1',
    'Test hint 2',
  ];

  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('renders chat button initially', () => {
    render(<AgentChat />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows contextual hints when provided', () => {
    render(<AgentChat contextualHints={mockContextualHints} />);
    fireEvent.click(screen.getByRole('button'));
    
    mockContextualHints.forEach(hint => {
      expect(screen.getByText(hint)).toBeInTheDocument();
    });
  });

  it('calls onSendMessage when sending a message', async () => {
    const testMessage = 'Hello, Agent!';
    mockOnSendMessage.mockResolvedValueOnce(undefined);

  render(<AgentChat onSendMessage={mockOnSendMessage} />);

    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Type and send message
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, testMessage);
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(mockOnSendMessage).toHaveBeenCalledWith(testMessage);
  });

  it('shows loading state while sending message', async () => {
    mockOnSendMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500)));

  render(<AgentChat onSendMessage={mockOnSendMessage} />);

    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Send message
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Test');
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Check loading state
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    });
  });

  it('preserves message history', async () => {
    mockOnSendMessage.mockResolvedValueOnce(undefined);

  render(<AgentChat onSendMessage={mockOnSendMessage} />);

    // Open chat
    fireEvent.click(screen.getByRole('button'));

    // Send first message
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'First message');
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Send second message
    await userEvent.type(input, 'Second message');
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Both messages should be visible
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });
});

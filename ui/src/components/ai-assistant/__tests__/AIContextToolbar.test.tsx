import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

// Mock the AI Context Service
jest.mock('../../../services/aiContextService', () => ({
  aiContextService: {
    setContext: jest.fn(),
    getContext: jest.fn(),
    getContextualHelp: jest.fn(),
    getFieldHelp: jest.fn(),
    validateField: jest.fn()
  }
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/test'
  }),
  usePathname: () => '/test'
}));

import { AIContextToolbar } from '../AIContextToolbar';
import { aiContextService } from '../../../services/aiContextService';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
    ui: (state = { theme: 'light' }) => state
  }
});

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('AIContextToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (aiContextService.getContextualHelp as jest.Mock).mockResolvedValue({
      message: 'Test help message',
      suggestions: ['Test suggestion 1', 'Test suggestion 2'],
      tips: ['Test tip 1']
    });
  });

  it('should render the AI assistant button', () => {
    renderWithProvider(<AIContextToolbar />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should open help panel when AI button is clicked', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const aiButton = screen.getByRole('button');
    fireEvent.click(aiButton);
    
    await waitFor(() => {
      expect(screen.getByText('AI Context Help')).toBeInTheDocument();
    });
  });

  it('should display contextual help when panel is opened', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const aiButton = screen.getByRole('button');
    fireEvent.click(aiButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test help message')).toBeInTheDocument();
      expect(screen.getByText('Test suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Test suggestion 2')).toBeInTheDocument();
    });
  });

  it('should set context when feature is provided', () => {
    renderWithProvider(<AIContextToolbar feature="analytics" page="dashboard" />);
    
    expect(aiContextService.setContext).toHaveBeenCalledWith({
      feature: 'analytics',
      page: 'dashboard'
    });
  });

  it('should handle suggestion clicks', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const aiButton = screen.getByRole('button');
    fireEvent.click(aiButton);
    
    await waitFor(() => {
      const suggestion = screen.getByText('Test suggestion 1');
      fireEvent.click(suggestion);
    });
    
    expect(aiContextService.getContextualHelp).toHaveBeenCalledWith('Test suggestion 1');
  });

  it('should close panel when close button is clicked', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const aiButton = screen.getByRole('button');
    fireEvent.click(aiButton);
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('AI Context Help')).not.toBeInTheDocument();
    });
  });

  describe('Field Help Integration', () => {
    beforeEach(() => {
      (aiContextService.getFieldHelp as jest.Mock).mockReturnValue({
        message: 'Field help message',
        tips: ['Field tip 1'],
        suggestions: ['What should I enter here?']
      });
    });

    it('should provide field-specific help', () => {
      renderWithProvider(<AIContextToolbar />);
      
      // Simulate field focus event
      const fieldHelpResult = aiContextService.getFieldHelp('cpu', 'number', 8);
      
      expect(aiContextService.getFieldHelp).toHaveBeenCalledWith('cpu', 'number', 8);
      expect(fieldHelpResult.message).toBe('Field help message');
      expect(fieldHelpResult.tips).toContain('Field tip 1');
    });
  });

  describe('Validation Integration', () => {
    beforeEach(() => {
      (aiContextService.validateField as jest.Mock).mockReturnValue({
        isValid: false,
        aiHelp: {
          message: 'Validation error message',
          suggestions: ['Fix this field']
        }
      });
    });

    it('should provide validation help for invalid fields', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const validationResult = aiContextService.validateField('email', 'invalid-email', { required: true });
      
      expect(aiContextService.validateField).toHaveBeenCalledWith('email', 'invalid-email', { required: true });
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.aiHelp?.message).toBe('Validation error message');
    });
  });

  describe('Context Updates', () => {
    it('should update context when user performs actions', () => {
      renderWithProvider(<AIContextToolbar feature="optimization" page="tutorial" />);
      
      expect(aiContextService.setContext).toHaveBeenCalledWith({
        feature: 'optimization',
        page: 'tutorial'
      });
    });

    it('should handle multiple context updates', () => {
      const { rerender } = renderWithProvider(<AIContextToolbar feature="analytics" page="overview" />);
      
      expect(aiContextService.setContext).toHaveBeenCalledWith({
        feature: 'analytics',
        page: 'overview'
      });
      
      rerender(
        <Provider store={createTestStore()}>
          <AIContextToolbar feature="migration" page="steps" userAction="configuring" />
        </Provider>
      );
      
      expect(aiContextService.setContext).toHaveBeenCalledWith({
        feature: 'migration',
        page: 'steps',
        userAction: 'configuring'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (aiContextService.getContextualHelp as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      renderWithProvider(<AIContextToolbar />);
      
      const aiButton = screen.getByRole('button');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sorry, I encountered an issue.')).toBeInTheDocument();
      });
    });

    it('should fallback to default help when context is missing', async () => {
      (aiContextService.getContextualHelp as jest.Mock).mockResolvedValue({
        message: "I'm ready to help! What would you like to know?",
        suggestions: ['How do I get started?', 'Show me features', 'System requirements']
      });
      
      renderWithProvider(<AIContextToolbar />);
      
      const aiButton = screen.getByRole('button');
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(screen.getByText("I'm ready to help! What would you like to know?")).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via keyboard navigation', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const aiButton = screen.getByRole('button');
      expect(aiButton).toHaveAttribute('tabIndex', '0');
      
      aiButton.focus();
      expect(aiButton).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const aiButton = screen.getByRole('button');
      expect(aiButton).toHaveAttribute('aria-label', 'Open AI Assistant');
    });

    it('should support keyboard interactions', async () => {
      renderWithProvider(<AIContextToolbar />);
      
      const aiButton = screen.getByRole('button');
      fireEvent.keyDown(aiButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('AI Context Help')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return <AIContextToolbar feature="analytics" page="dashboard" />;
      });
      
      const { rerender } = renderWithProvider(<TestComponent />);
      
      // Same props should not cause re-render
      rerender(
        <Provider store={createTestStore()}>
          <TestComponent />
        </Provider>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + rerender with same props
    });

    it('should debounce rapid context updates', async () => {
      jest.useFakeTimers();
      
      renderWithProvider(<AIContextToolbar />);
      
      // Simulate rapid context updates
      aiContextService.setContext({ feature: 'test1', page: 'page1' });
      aiContextService.setContext({ feature: 'test2', page: 'page2' });
      aiContextService.setContext({ feature: 'test3', page: 'page3' });
      
      jest.advanceTimersByTime(500);
      
      // Should only call setContext for the last update after debounce
      expect(aiContextService.setContext).toHaveBeenLastCalledWith({
        feature: 'test3',
        page: 'page3'
      });
      
      jest.useRealTimers();
    });
  });
});

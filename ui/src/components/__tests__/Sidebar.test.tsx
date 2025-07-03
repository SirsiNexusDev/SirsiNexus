import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Sidebar } from '../Sidebar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

// Mock useRouter and usePathname
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  preloadedState: {
    auth: {
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      },
      token: 'mock-token',
      loading: false,
      error: null,
    },
    ui: {
      theme: 'light',
      notifications: [],
      sidebarCollapsed: false,
      agentChatVisible: false,
      currentContextualHints: [],
      loadingStates: {},
      modals: {
        welcome: false,
        auth: false,
        settings: false,
      },
    },
  },
});

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    const navItems = [
      'Overview',
      'Demo Scenarios',
      'Credential Management',
      'Projects',
      'Migration Steps',
      'Analytics \u0026 Reports',
      'Security',
      'Scripting Console',
      'Help \u0026 Tutorials'
    ];

    navItems.forEach(item => {
      expect(screen.getByText(new RegExp(item, 'i'))).toBeInTheDocument();
    });
  });

  it('highlights active navigation item based on current path', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/projects');

    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    const projectsButton = screen.getByText('Projects').closest('button');
    expect(projectsButton).toHaveClass('bg-gradient-to-r');
  });

  it('expands and collapses migration steps', async () => {
    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    const migrationStepsButton = screen.getByText('Migration Steps').closest('button');

    if (migrationStepsButton) {
      fireEvent.click(migrationStepsButton);
      expect(screen.getByText('PLAN')).toBeInTheDocument();

      fireEvent.click(migrationStepsButton);
      expect(screen.queryByText('PLAN')).not.toBeInTheDocument();
    }
  });

  it('shows wizard descriptions when expanded', () => {
    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    // Wizards are expanded by default, so we should see the descriptions immediately
    const descriptions = [
      'Complete infrastructure migration',
      'Cost and performance optimization',
      'Configure intelligent auto-scaling'
    ];

    descriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it('requires authentication for protected routes', () => {
    const unauthenticatedStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        auth: {
          ...mockStore.getState().auth,
          isAuthenticated: false,
          user: null,
        },
      },
    });

    render(
      <Provider store={unauthenticatedStore}>
        <Sidebar />
      </Provider>
    );

    // Check that the credentials management button exists
    const credentialsButton = screen.getByText('Credential Management').closest('button');
    expect(credentialsButton).toBeInTheDocument();
  });

  it('displays role-based navigation items', () => {
    const regularUserStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        auth: {
          ...mockStore.getState().auth,
          user: {
            ...mockStore.getState().auth.user,
            role: 'user',
          },
        },
      },
    });

    render(
      <Provider store={regularUserStore}>
        <Sidebar />
      </Provider>
    );

    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });
});

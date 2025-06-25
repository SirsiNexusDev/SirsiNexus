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
      'Dashboard',
      'Projects',
      'Migration Wizard',
      'Credentials',
      'Analytics',
      'Help',
    ];

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Migration Wizard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    expect(screen.getByText('Help & Tutorials')).toBeInTheDocument();
  });

  it('highlights active navigation item based on current path', () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockReturnValue('/projects');

    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    const projectsLink = screen.getByText('Projects').closest('a');
    expect(projectsLink).toHaveClass('mb-2 flex items-center rounded-lg px-4 py-2 text-sm text-sirsi-100 transition-colors hover:bg-sirsi-800');
  });

  it('collapses and expands sidebar', () => {
    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(toggleButton);

    expect(mockStore.getState().ui.sidebarCollapsed).toBe(true);
    expect(screen.getByTestId('sidebar')).toHaveClass('w-16');

    fireEvent.click(toggleButton);
    expect(mockStore.getState().ui.sidebarCollapsed).toBe(false);
    expect(screen.getByTestId('sidebar')).toHaveClass('w-64');
  });

  it('shows tooltips for collapsed items', async () => {
    const collapsedStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        ui: {
          ...mockStore.getState().ui,
          sidebarCollapsed: true,
        },
      },
    });

    render(
      <Provider store={collapsedStore}>
        <Sidebar />
      </Provider>
    );

    const dashboardIcon = screen.getByTestId('dashboard-icon');
    fireEvent.mouseEnter(dashboardIcon);

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
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

    const credentialsLink = screen.getByText('Credential Management').closest('a');
    expect(credentialsLink).toHaveAttribute('href', '/credentials');
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

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from '../Header';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

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

describe('Header', () => {
  it('renders user profile when authenticated', () => {
    render(
      <Provider store={mockStore}>
        <Header />
      </Provider>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows auth modal when clicking login button while unauthenticated', () => {
    const unauthenticatedStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
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

    render(
      <Provider store={unauthenticatedStore}>
        <Header />
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(unauthenticatedStore.getState().ui.modals.auth).toBe(true);
  });

  it('toggles theme when clicking theme switch', () => {
    render(
      <Provider store={mockStore}>
        <Header />
      </Provider>
    );

    const themeSwitch = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeSwitch);

    expect(mockStore.getState().ui.theme).toBe('dark');
  });

  it('displays notifications badge when notifications exist', () => {
    const storeWithNotifications = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        ui: {
          ...mockStore.getState().ui,
          notifications: [
            {
              id: '1',
              type: 'info',
              message: 'Test notification',
              title: 'Test',
            },
          ],
        },
      },
    });

    render(
      <Provider store={storeWithNotifications}>
        <Header />
      </Provider>
    );

    expect(screen.getByTestId('notifications-badge')).toHaveTextContent('1');
  });

  it('opens notifications panel when clicking notifications icon', () => {
    render(
      <Provider store={mockStore}>
        <Header />
      </Provider>
    );

    const notificationsButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(notificationsButton);

    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows loading state during authentication', () => {
    const loadingStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        auth: {
          ...mockStore.getState().auth,
          loading: true,
        },
      },
    });

    render(
      <Provider store={loadingStore}>
        <Header />
      </Provider>
    );

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  });

  it('displays error state when authentication fails', () => {
    const errorStore = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        ...mockStore.getState(),
        auth: {
          ...mockStore.getState().auth,
          error: 'Authentication failed',
        },
      },
    });

    render(
      <Provider store={errorStore}>
        <Header />
      </Provider>
    );

    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });
});

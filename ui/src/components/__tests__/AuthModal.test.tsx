import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthModal } from '../AuthModal';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

const mockStore = configureStore({
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
        auth: true,
        settings: false,
      },
    },
  },
});

describe('AuthModal', () => {
  it('renders login form by default', () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', async () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    fireEvent.click(screen.getByText(/register/i));

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('validates login form inputs', async () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('validates registration form inputs', async () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    fireEvent.click(screen.getByText(/register/i));
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/confirm password is required/i)).toBeInTheDocument();
  });

  it('shows password mismatch error in registration', async () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    fireEvent.click(screen.getByText(/register/i));

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password456');

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLoginResponse = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
      token: 'mock-token',
    };

    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLoginResponse),
      })
    );

    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockStore.getState().auth.isAuthenticated).toBe(true);
      expect(mockStore.getState().auth.user).toEqual(mockLoginResponse.user);
      expect(mockStore.getState().ui.modals.auth).toBe(false);
    });
  });

  it('handles failed login', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('closes modal when clicking outside', () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('modal-overlay'));

    expect(mockStore.getState().ui.modals.auth).toBe(false);
  });

  it('toggles password visibility', async () => {
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

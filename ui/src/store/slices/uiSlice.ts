import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  autoClose?: boolean;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  agentChatVisible: boolean;
  currentContextualHints: string[];
  loadingStates: Record<string, boolean>;
  modals: {
    welcome: boolean;
    auth: boolean;
    settings: boolean;
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  theme: 'light',
  sidebarCollapsed: false,
  notifications: [],
  agentChatVisible: false,
  currentContextualHints: [],
  loadingStates: {},
  modals: {
    welcome: true,
    auth: false,
    settings: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    toggleAgentChat: (state) => {
      state.agentChatVisible = !state.agentChatVisible;
    },
    setContextualHints: (state, action: PayloadAction<string[]>) => {
      state.currentContextualHints = action.payload;
    },
    setLoadingState: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    setModalState: (
      state,
      action: PayloadAction<{ modal: string; visible: boolean }>
    ) => {
      state.modals[action.payload.modal] = action.payload.visible;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  toggleAgentChat,
  setContextualHints,
  setLoadingState,
  setModalState,
} = uiSlice.actions;

export default uiSlice.reducer;

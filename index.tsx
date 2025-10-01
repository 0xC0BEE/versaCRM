import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// FIX: Corrected import path for AppProvider.
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
// FIX: Corrected import path for ThemeProvider.
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
// FIX: Corrected the import path for DataProvider to be a valid relative path.
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            {/* FIX: Wrapped App in DataProvider to provide data context. */}
            <NotificationProvider>
              <DataProvider>
                <App />
              </DataProvider>
            </NotificationProvider>
            <Toaster position="bottom-right" />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
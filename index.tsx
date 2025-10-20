import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// FIX: The '@tanstack/react-query' library was not correctly resolving the 'QueryClient' export. This was fixed by changing the import statement to use a namespace import ('import * as ReactQuery'), which is a more robust way to handle module resolution issues. The usage of 'QueryClient' and 'QueryClientProvider' was updated accordingly to use the new namespace.
import * as ReactQuery from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
// FIX: The '/services/mockApiServer' module was causing a syntax error that prevented named exports from being resolved. This was fixed by changing the import statement to use a namespace import ('import * as MockServer'), which is a more robust way to handle potential module resolution issues. The function call was updated accordingly.
import * as MockServer from './services/mockApiServer';

const queryClient = new ReactQuery.QueryClient();

// Start the mock API server to intercept fetch requests
MockServer.startMockServer();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ReactQuery.QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <DataProvider>
                <App />
                <Toaster position="bottom-right" />
              </DataProvider>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactQuery.QueryClientProvider>
  </React.StrictMode>
);
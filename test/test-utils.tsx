import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { AppProvider } from '../contexts/AppContext';
import { NotificationProvider } from '../contexts/NotificationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off for tests
      retry: false,
    },
  },
});

const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AppProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as renderWithProviders };

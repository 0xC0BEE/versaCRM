import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import App from '../../App';
import apiClient from '../../services/apiClient';

// Mock the api module
vi.mock('../../services/apiClient', () => ({
  default: {
    login: vi.fn(),
  },
}));

describe('Login Flow', () => {
  it('should allow a user to log in and see the dashboard', async () => {
    const mockUser = { id: 'user_admin_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org_1' };
    (apiClient.login as vi.Mock).mockResolvedValue(mockUser);

    renderWithProviders(<App />);

    // The user is initially on the login page
    expect(screen.getByRole('heading', { name: /VersaCRM/i })).toBeInTheDocument();

    // User fills out the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'admin@crm.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    // User clicks the sign-in button
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Wait for the login process to complete and the dashboard to appear
    await waitFor(() => {
      // The login page should be gone
      expect(screen.queryByRole('heading', { name: /VersaCRM/i })).not.toBeInTheDocument();
      // The user should see the header of the main console
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      // And the dashboard page should be rendered
      expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();
    });

    // Check if api.login was called correctly
    expect(apiClient.login).toHaveBeenCalledWith('admin@crm.com');
  });
});
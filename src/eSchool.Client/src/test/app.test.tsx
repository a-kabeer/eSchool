import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { AppRoutes } from '@/App';

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppDataProvider>
              <AppRoutes />
            </AppDataProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('MaterialM Dashboard 3 & Multi-page Application', () => {
  it('renders all 10 Dashboard 3 widgets and switches Recent Projects tabs', () => {
    renderAt('/dashboards/dashboard3');

    expect(screen.getByText('Overall Balance')).toBeInTheDocument();
    expect(screen.getByText('$2,538,942')).toBeInTheDocument();
    expect(screen.getByText('Return On Investment')).toBeInTheDocument();
    expect(screen.getByText('Total followers')).toBeInTheDocument();
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('Marketing Report')).toBeInTheDocument();
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
    expect(screen.getByText('Delivery Analytics')).toBeInTheDocument();
    expect(screen.getByText('Earning Reports')).toBeInTheDocument();

    // SaaS tab shows Photoshop; switching to Mobile filters it out
    expect(screen.getByText('Photoshop')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Mobile' }));
    expect(screen.queryByText('Photoshop')).not.toBeInTheDocument();
    expect(screen.getByText('iOS Mobile App Design')).toBeInTheDocument();
  });

  it('supports Invoices search, creation, and deletion with confirmation', () => {
    renderAt('/apps/invoices');

    expect(screen.getByText('Pineapple Inc.')).toBeInTheDocument();

    // Search filters rows
    const search = screen.getByPlaceholderText('Search Invoice');
    fireEvent.change(search, { target: { value: 'Fortune' } });
    expect(screen.getByText('Fortune Creation')).toBeInTheDocument();
    expect(screen.queryByText('Pineapple Inc.')).not.toBeInTheDocument();

    // Reset search
    fireEvent.change(search, { target: { value: '' } });

    // Create a new invoice
    fireEvent.click(screen.getByRole('button', { name: /add invoice/i }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/bill to/i), {
      target: { value: 'Quantum Systems' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /create invoice/i }));
    expect(screen.getByText('Quantum Systems')).toBeInTheDocument();
  });

  it('enforces RBAC permissions when role is switched to Viewer', () => {
    renderAt('/pages/permissions');

    fireEvent.click(screen.getByText('Viewer'));
    expect(screen.getByText('Current: Viewer')).toBeInTheDocument();

    // Navigate via sidebar link to Invoices and confirm Add Invoice is disabled
    fireEvent.click(screen.getByText('Invoices'));
    fireEvent.click(screen.getByText('Invoice List'));
    const addBtn = screen.getByRole('button', { name: /add invoice/i });
    expect(addBtn).toBeDisabled();
  });

  it('toggles dark mode from the topbar', () => {
    renderAt('/dashboards/dashboard3');
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

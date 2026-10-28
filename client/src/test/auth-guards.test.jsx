import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AccountLayout } from '../pages/customer/AccountLayout';
import * as AuthContextModule from '../context/AuthContext';

describe('Auth Guards & Route Protection', () => {
  it('AdminLayout: redirects unauthenticated users or customers to /admin/login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      admin: null,
      customer: { id: 'cust-1', email: 'customer@jableather.pk', role: 'customer' },
      loading: false,
      logoutAdmin: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Secret Dashboard</div>} />
          </Route>
          <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Protected content must NOT be visible
    expect(screen.queryByText('Admin Secret Dashboard')).toBeNull();
    // Redirect target must be rendered
    expect(screen.getByText('Admin Login Screen')).toBeInTheDocument();
  });

  it('AdminLayout: shows loading state during session check without flashing content', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      admin: null,
      customer: null,
      loading: true,
      logoutAdmin: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Secret Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Checking admin session/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Secret Dashboard')).toBeNull();
  });

  it('AdminLayout: allows access when admin session exists', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      admin: { id: 'admin-uuid', email: 'atelier@jableather.pk', role: 'admin' },
      customer: null,
      loading: false,
      logoutAdmin: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Secret Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Secret Dashboard')).toBeInTheDocument();
  });

  it('AccountLayout: redirects guest to /account/login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      customer: null,
      admin: null,
      loading: false,
      logoutCustomer: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<div>Customer Profile Data</div>} />
          </Route>
          <Route path="/account/login" element={<div>Customer Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Customer Profile Data')).toBeNull();
    expect(screen.getByText('Customer Login Screen')).toBeInTheDocument();
  });

  it('AccountLayout: renders customer portal when authenticated customer is present', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      customer: { id: 'cust-123', name: 'Arham Bhatti', email: 'arham@jableather.pk' },
      admin: null,
      loading: false,
      logoutCustomer: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<div>Customer Profile Data</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, Arham Bhatti/i)).toBeInTheDocument();
    expect(screen.getByText('Customer Profile Data')).toBeInTheDocument();
  });
});

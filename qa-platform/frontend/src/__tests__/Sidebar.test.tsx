/**
 * C11 — Sidebar (Layout) tests
 *
 * The sidebar is rendered inside the Layout component
 * (src/components/Layout/Sidebar.tsx).
 *
 * Navigation items defined in Layout.tsx:
 *   { to: '/dashboard', label: '대시보드',    description: '현황 및 통계'     }
 *   { to: '/analysis',  label: '영향도 분석', description: '변경 영향도 분석' }
 *   { to: '/defects',   label: '결함 관리',   description: '결함 데이터 관리' }
 *
 * Active link styling (when isActive === true via NavLink):
 *   'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
 *
 * The <aside> element in Layout.tsx has data-testid="sidebar".
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout/Sidebar';

// ---- Mock the authStore -------------------------------------------------------
vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 1, email: 'test@example.com', username: 'testuser', is_active: true, is_admin: false },
    logout: vi.fn(),
  }),
}));

// ---- Mock react-hot-toast ----------------------------------------------------
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ---- Mock lucide-react icons used by Layout and Header -----------------------
vi.mock('lucide-react', () => ({
  LayoutDashboard: () => null,
  Bug: () => null,
  Zap: () => null,
  LogOut: () => null,
  ChevronRight: () => null,
  Activity: () => null,
  Bell: () => null,
  Search: () => null,
}));

// ---- Mock Header component (to isolate sidebar) ------------------------------
vi.mock('../components/Layout/Header', () => ({
  default: () => <div data-testid="mock-header" />,
}));

// ---- Render helper -----------------------------------------------------------
function renderLayout(initialPath: string = '/dashboard') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* Layout wraps all authenticated routes; Outlet renders page content */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
          <Route path="analysis" element={<div>Analysis Page</div>} />
          <Route path="defects" element={<div>Defects Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ---- Tests -------------------------------------------------------------------
describe('C11 — Sidebar navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sidebar renders with data-testid="sidebar"', () => {
    renderLayout('/dashboard');

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('sidebar contains a Dashboard navigation link (대시보드)', () => {
    renderLayout('/dashboard');

    const dashboardLink = screen.getByRole('link', { name: /대시보드/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('sidebar contains an Impact Analysis navigation link (영향도 분석)', () => {
    renderLayout('/dashboard');

    const analysisLink = screen.getByRole('link', { name: /영향도 분석/i });
    expect(analysisLink).toBeInTheDocument();
    expect(analysisLink).toHaveAttribute('href', '/analysis');
  });

  it('sidebar contains a Defects navigation link (결함 관리)', () => {
    renderLayout('/dashboard');

    const defectsLink = screen.getByRole('link', { name: /결함 관리/i });
    expect(defectsLink).toBeInTheDocument();
    expect(defectsLink).toHaveAttribute('href', '/defects');
  });

  it('active route link has active styling class', () => {
    // Navigate to /analysis so that link becomes active
    renderLayout('/analysis');

    // NavLink applies the active class string when isActive is true.
    // The active class includes 'bg-indigo-600/20' and 'text-indigo-400'.
    const analysisLink = screen.getByRole('link', { name: /영향도 분석/i });
    expect(analysisLink.className).toContain('bg-indigo-600/20');
    expect(analysisLink.className).toContain('text-indigo-400');
  });

  it('inactive route links do NOT have active styling class', () => {
    renderLayout('/dashboard');

    // /analysis and /defects links should not carry active styles when on /dashboard
    const analysisLink = screen.getByRole('link', { name: /영향도 분석/i });
    const defectsLink = screen.getByRole('link', { name: /결함 관리/i });

    expect(analysisLink.className).not.toContain('bg-indigo-600/20');
    expect(defectsLink.className).not.toContain('bg-indigo-600/20');
  });

  it('sidebar has logout button', () => {
    renderLayout('/dashboard');

    const logoutBtn = screen.getByTestId('logout-btn');
    expect(logoutBtn).toBeInTheDocument();
  });
});

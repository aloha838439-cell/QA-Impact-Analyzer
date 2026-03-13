/**
 * C10 — LoginPage tests
 *
 * LoginPage renders a login form with:
 *   - Email input (label: "이메일 주소", placeholder: "you@example.com")
 *   - Password input (label: "비밀번호", placeholder: "비밀번호를 입력하세요")
 *   - Submit button with text "로그인"
 *
 * Validation (client-side, fires before any API call):
 *   - Empty email  → '이메일을 입력하세요'
 *   - Bad format   → '올바른 이메일 형식이 아닙니다'
 *   - Empty pass   → '비밀번호를 입력하세요'
 *
 * data-testid attributes on LoginPage.tsx:
 *   - email input    → data-testid="email-input"
 *   - password input → data-testid="password-input"
 *   - submit button  → data-testid="login-btn"
 *   - error message  → data-testid="error-message"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ---- Mock dependencies --------------------------------------------------------

// Mock the authStore so login() doesn't touch real Zustand state
vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
  }),
}));

// Mock authService to prevent real HTTP calls
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock react-hot-toast to suppress DOM warnings in jsdom
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons used by LoginPage to avoid SVG rendering issues
vi.mock('lucide-react', () => ({
  Activity: () => null,
  Eye: () => null,
  EyeOff: () => null,
}));

// Mock LoadingSpinner
vi.mock('../components/UI/LoadingSpinner', () => ({
  LoadingSpinner: () => null,
}));

// ---- Render helper ------------------------------------------------------------
function renderLoginPage() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---- Tests -------------------------------------------------------------------
describe('C10 — LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submit button is present and renders', () => {
    renderLoginPage();
    const btn = screen.getByTestId('login-btn');
    expect(btn).toBeInTheDocument();
  });

  it('form fields have correct data-testid attributes (email-input, password-input, login-btn)', () => {
    renderLoginPage();

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });

  it('form fields have correct label associations', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/이메일 주소/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument();
  });

  it('submit with empty email shows inline error message', async () => {
    renderLoginPage();

    // Leave email blank, fill password so only email errors
    await userEvent.type(screen.getByTestId('password-input'), 'anypassword');

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByText('이메일을 입력하세요')).toBeInTheDocument();
    });
  });

  it('submit with invalid email format shows inline error message', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByTestId('email-input'), 'not-an-email');
    await userEvent.type(screen.getByTestId('password-input'), 'anypassword');

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument();
    });
  });

  it('submit with empty password shows inline error message', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
    // Leave password blank

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력하세요')).toBeInTheDocument();
    });
  });

  it('error message has role=alert for accessibility', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // ---------- W-07: API 플로우 테스트 (성공/실패) ----------------------------

  it('valid credentials → API called → navigate to /dashboard', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      access_token: 'test-token',
      token_type: 'bearer',
      user: { id: 1, email: 'admin@qa.com', username: 'admin', is_active: true, is_admin: true },
    });

    renderLoginPage();

    await userEvent.type(screen.getByTestId('email-input'), 'admin@qa.com');
    await userEvent.type(screen.getByTestId('password-input'), 'admin1234');
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
    expect(authService.login).toHaveBeenCalledWith({
      email: 'admin@qa.com',
      password: 'admin1234',
    });
  });

  it('API failure (401) → inline error-message shown', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { data: { detail: '이메일 또는 비밀번호가 올바르지 않습니다.' } },
    });

    renderLoginPage();

    await userEvent.type(screen.getByTestId('email-input'), 'admin@qa.com');
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('이메일 또는 비밀번호');
    });
  });

  it('loading state — login-btn is disabled while request is pending', async () => {
    // Create a promise that never resolves to simulate "pending" state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveFn!: (v: any) => void;
    vi.mocked(authService.login).mockReturnValueOnce(
      new Promise((resolve) => { resolveFn = resolve; }) as ReturnType<typeof authService.login>
    );

    renderLoginPage();

    await userEvent.type(screen.getByTestId('email-input'), 'admin@qa.com');
    await userEvent.type(screen.getByTestId('password-input'), 'admin1234');
    fireEvent.click(screen.getByTestId('login-btn'));

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByTestId('login-btn')).toBeDisabled();
    });

    // Cleanup: resolve the promise to avoid open handles
    resolveFn({ access_token: 'tok', token_type: 'bearer', user: { id: 1, email: 'admin@qa.com', username: 'admin', is_active: true, is_admin: false } });
  });
});

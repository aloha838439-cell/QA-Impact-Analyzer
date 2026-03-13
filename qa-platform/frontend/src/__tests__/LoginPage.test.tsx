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
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

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
      <LoginPage />
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
});

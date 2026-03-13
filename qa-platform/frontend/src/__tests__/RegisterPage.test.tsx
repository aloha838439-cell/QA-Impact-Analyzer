/**
 * C10 — RegisterPage tests (register variant)
 *
 * RegisterPage renders a registration form with:
 *   - Email input       → data-testid="email-input"
 *   - Username input    → data-testid="name-input"
 *   - Password input    → data-testid="password-input" (with live strength indicator)
 *   - Confirm Password  → data-testid="confirm-password-input"
 *   - Submit button     → data-testid="register-btn" ("계정 만들기")
 *   - Form error        → data-testid="error-message"
 *
 * Password strength logic (passwordStrength() function):
 *   Starts at 0, increments for each rule met:
 *     +1 if length >= 8
 *     +1 if contains uppercase letter
 *     +1 if contains digit
 *     +1 if contains special character
 *   Display: "비밀번호 강도: {strengthLabels[strength - 1]}"
 *   strengthLabels = ['약함', '보통', '좋음', '강함']
 *   strength=0 → '너무 짧음'
 *
 * On successful registration the component navigates to '/login'.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import { authService } from '../services/authService';

// ---- Mock dependencies --------------------------------------------------------

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
  }),
}));

vi.mock('../services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  Activity: () => null,
  Eye: () => null,
  EyeOff: () => null,
  CheckCircle: () => null,
}));

vi.mock('../components/UI/LoadingSpinner', () => ({
  LoadingSpinner: () => null,
}));

// ---- Render helpers ----------------------------------------------------------
function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---- Tests -------------------------------------------------------------------
describe('C10 — RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('form fields have correct data-testid attributes', () => {
    renderRegisterPage();

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-btn')).toBeInTheDocument();
  });

  // ---------- Password strength indicator tests --------------------------------

  it('password with length < 8 shows "너무 짧음" strength indicator', async () => {
    renderRegisterPage();
    const passwordInput = screen.getByTestId('password-input');

    // "abc" — length < 8, no uppercase, no digit, no special char → strength = 0 → '너무 짧음'
    await userEvent.type(passwordInput, 'abc');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent('너무 짧음');
    });
  });

  it('password meeting exactly 1 criterion (length >= 8 only) shows "약함" strength indicator', async () => {
    renderRegisterPage();
    const passwordInput = screen.getByTestId('password-input');

    // "abcdefgh" — length >= 8 (+1), no uppercase, no digit, no special → strength = 1 → "약함"
    await userEvent.type(passwordInput, 'abcdefgh');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent('약함');
    });
  });

  it('password meeting 2 criteria shows "보통" strength indicator', async () => {
    renderRegisterPage();
    const passwordInput = screen.getByTestId('password-input');

    // "Abcdefgh" — length >= 8 (+1), uppercase (+1), no digit, no special → strength = 2 → "보통"
    await userEvent.type(passwordInput, 'Abcdefgh');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent('보통');
    });
  });

  it('password meeting 3 criteria shows "좋음" strength indicator', async () => {
    renderRegisterPage();
    const passwordInput = screen.getByTestId('password-input');

    // "Abcdefg1" — length >= 8 (+1), uppercase (+1), digit (+1), no special → strength = 3 → "좋음"
    await userEvent.type(passwordInput, 'Abcdefg1');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent('좋음');
    });
  });

  it('password meeting all 4 criteria shows "강함" strength indicator', async () => {
    renderRegisterPage();
    const passwordInput = screen.getByTestId('password-input');

    // "Abcdefg1!" — length >= 8 (+1), uppercase (+1), digit (+1), special (+1) → strength = 4 → "강함"
    await userEvent.type(passwordInput, 'Abcdefg1!');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent('강함');
    });
  });

  // ---------- Validation error tests ------------------------------------------

  it('submit with empty username shows inline error', async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
    // Leave username blank
    await userEvent.type(screen.getByTestId('password-input'), 'Password1!');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'Password1!');

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toBeInTheDocument();
      expect(screen.getByText('사용자 이름을 입력하세요')).toBeInTheDocument();
    });
  });

  it('submit with empty email shows inline error', async () => {
    renderRegisterPage();

    // Leave email blank; fill other fields correctly
    await userEvent.type(screen.getByTestId('name-input'), 'validuser');
    await userEvent.type(screen.getByTestId('password-input'), 'Password1!');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'Password1!');

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByText('이메일을 입력하세요')).toBeInTheDocument();
    });
  });

  it('submit with username shorter than 3 chars shows inline error', async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
    await userEvent.type(screen.getByTestId('name-input'), 'ab');  // 2 chars — too short
    await userEvent.type(screen.getByTestId('password-input'), 'Password1!');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'Password1!');

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toBeInTheDocument();
      expect(screen.getByText('사용자 이름은 3자 이상이어야 합니다')).toBeInTheDocument();
    });
  });

  it('submit with mismatched passwords shows inline error', async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByTestId('email-input'), 'user@example.com');
    await userEvent.type(screen.getByTestId('name-input'), 'validuser');
    await userEvent.type(screen.getByTestId('password-input'), 'Password1!');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'DifferentPass1!');

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument();
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    });
  });

  it('error messages have role=alert for accessibility', async () => {
    renderRegisterPage();

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // ---------- Successful registration test ------------------------------------

  it('successful registration navigates to /login', async () => {
    const mockRegisterResponse = {
      access_token: 'mock.token.here',
      token_type: 'bearer',
      user: {
        id: 1,
        email: 'newuser@example.com',
        username: 'newuser',
        is_active: true,
        is_admin: false,
      },
    };

    vi.mocked(authService.register).mockResolvedValueOnce(mockRegisterResponse);

    renderRegisterPage();

    await userEvent.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await userEvent.type(screen.getByTestId('name-input'), 'newuser');
    await userEvent.type(screen.getByTestId('password-input'), 'Password1!');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'Password1!');

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});

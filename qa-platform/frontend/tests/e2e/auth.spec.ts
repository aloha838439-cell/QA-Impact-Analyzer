import { test, expect } from '@playwright/test';

/**
 * Sprint 1 — 인증 플로우 E2E 시나리오
 *
 * 전제 조건:
 *   - frontend dev server: http://localhost:3001  (npm run dev -- --port 3001)
 *   - backend API server:  http://localhost:8004  (uvicorn src.main:app --port 8004)
 *
 * data-testid 매핑:
 *   LoginPage.tsx    → email-input, password-input, login-btn, error-message
 *   RegisterPage.tsx → email-input, password-input, name-input, confirm-password-input, register-btn, error-message
 *   Sidebar.tsx      → sidebar, logout-btn
 */

test.describe('인증 플로우', () => {

  /**
   * TC-01: 회원가입 성공 후 로그인 페이지로 이동
   */
  test('회원가입 성공 후 로그인 페이지로 이동', async ({ page }) => {
    const uniqueEmail = `qa-tester-${Date.now()}@example.com`;

    await page.goto('/register');

    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="name-input"]', 'QA 테스터');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
    await page.click('[data-testid="register-btn"]');

    // 회원가입 성공 후 /login으로 이동
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });

  /**
   * TC-02: 올바른 자격증명으로 로그인 성공 (admin 계정)
   */
  test('올바른 자격증명으로 로그인 성공', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'admin@qa.com');
    await page.fill('[data-testid="password-input"]', 'admin1234');
    await page.click('[data-testid="login-btn"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  /**
   * TC-03: 잘못된 비밀번호로 로그인 실패 — 에러 메시지 표시
   */
  test('잘못된 비밀번호로 로그인 실패 — 에러 메시지 표시', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'admin@qa.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-btn"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('이메일 또는 비밀번호');
    await expect(page).toHaveURL('/login');
  });

  /**
   * TC-04: 미인증 사용자 보호 라우트 접근 시 /login 리다이렉트
   */
  test('미인증 사용자 보호 라우트 접근 시 /login 리다이렉트', async ({ page }) => {
    await page.goto('/analysis');
    await expect(page).toHaveURL('/login');
  });

  /**
   * TC-05: 로그아웃 후 토큰 삭제 확인
   */
  test('로그아웃 후 토큰 삭제 확인', async ({ page }) => {
    // 로그인 상태 셋업
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@qa.com');
    await page.fill('[data-testid="password-input"]', 'admin1234');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/dashboard', { timeout: 10_000 });

    await page.click('[data-testid="logout-btn"]');
    await expect(page).toHaveURL('/login');

    // localStorage access_token 삭제 확인
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
  });

});

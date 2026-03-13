import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Activity, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = '이메일을 입력하세요';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = '올바른 이메일 형식이 아닙니다';

    if (!formData.username) newErrors.username = '사용자 이름을 입력하세요';
    else if (formData.username.length < 3)
      newErrors.username = '사용자 이름은 3자 이상이어야 합니다';
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username))
      newErrors.username = '영문, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다';

    if (!formData.password) newErrors.password = '비밀번호를 입력하세요';
    else if (formData.password.length < 8)
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';

    if (!formData.confirmPassword) newErrors.confirmPassword = '비밀번호를 다시 입력하세요';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      toast.success(`회원가입 완료! 환영합니다, ${response.user.username}님!`);
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '회원가입에 실패했습니다. 다시 시도해 주세요.';
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return strength;
  };

  const strength = passwordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['약함', '보통', '좋음', '강함'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-200">계정 만들기</h1>
          <p className="text-slate-400 text-sm mt-1">QA 영향도 분석기 시작하기</p>
        </div>

        {/* Form card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Form-level API error */}
            {errors.form && (
              <p
                role="alert"
                aria-live="polite"
                data-testid="error-message"
                className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
              >
                {errors.form}
              </p>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">이메일</label>
              <input
                id="email"
                type="email"
                data-testid="email-input"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p id="email-error" role="alert" data-testid="email-error" className="text-xs text-red-400 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">사용자 이름</label>
              <input
                id="username"
                type="text"
                data-testid="name-input"
                aria-describedby={errors.username ? 'username-error' : undefined}
                aria-invalid={!!errors.username}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="johndoe"
                autoComplete="username"
                disabled={isLoading}
              />
              {errors.username && (
                <p id="username-error" role="alert" data-testid="username-error" className="text-xs text-red-400 mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="password-input"
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                  aria-invalid={!!errors.password}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 pr-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="8자 이상 입력하세요"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {formData.password && (
                <div id="password-strength" className="mt-2">
                  <div className="flex gap-1" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColors[strength - 1] : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    비밀번호 강도: <span data-testid="password-strength-label">{strength > 0 ? strengthLabels[strength - 1] : '너무 짧음'}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p id="password-error" role="alert" data-testid="password-error" className="text-xs text-red-400 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  data-testid="confirm-password-input"
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 pr-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" role="alert" data-testid="confirm-password-error" className="text-xs text-red-400 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              data-testid="register-btn"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>계정 생성 중...</span>
                </>
              ) : (
                '계정 만들기'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

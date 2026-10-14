import { useState } from 'react';
import authService from '../services/authService';
import '../styles/auth.css';

export default function RegisterPage({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({ fullName, email, password });
      setIsError(false);
      setMessage(result?.message || 'Đăng ký tài khoản thành công!');
    } catch (error) {
      setIsError(true);
      const apiMessage = error.response?.data?.message;
      setMessage(
        apiMessage ||
        (error.message === 'Failed to fetch' || error.message === 'Network Error'
          ? 'Không kết nối được máy chủ. Hãy kiểm tra backend.'
          : error.message || 'Đăng ký thất bại.')
      );
    } finally {
      setLoading(false);
    }
  }

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <main className="auth-page login-page">
      <section className="auth-card login-card">
        <div className="logo">♫</div>

        <h1>Tạo tài khoản mới</h1>
        <p className="subtitle">Đăng ký để khám phá không gian âm nhạc</p>

        <form onSubmit={handleRegister}>
          <label htmlFor="fullName">Họ và tên</label>
          <input
            id="fullName"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <div className="password-box">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            className="auth-button login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {message && (
          <p className={`message ${isError ? 'error' : ''}`}>{message}</p>
        )}

        <p className="auth-footer-text register-text">
          Đã có tài khoản?{' '}
          <a href="/login" onClick={(e) => handleLinkClick(e, '/login')}>
            Đăng nhập
          </a>
        </p>

        <a
          href="/"
          className="back-to-home"
          onClick={(e) => handleLinkClick(e, '/')}
        >
          ← Quay lại trang chủ
        </a>
      </section>
    </main>
  );
}

import { useState } from 'react';
import authService from '../services/authService';
import '../styles/auth.css';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      setIsError(false);
      setMessage(result?.message || 'Đăng nhập thành công!');
    } catch (error) {
      setIsError(true);
      const apiMessage = error.response?.data?.message;
      setMessage(
        apiMessage ||
        (error.message === 'Failed to fetch' || error.message === 'Network Error'
          ? 'Không kết nối được máy chủ. Hãy kiểm tra backend.'
          : error.message || 'Đăng nhập thất bại.')
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
    <main className="login-page">
      <section className="login-card">
        <div className="logo">♫</div>

        <h1>Chào mừng trở lại</h1>
        <p className="subtitle">Đăng nhập để tiếp tục nghe nhạc</p>

        <form onSubmit={handleLogin}>
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
              placeholder="Nhập mật khẩu"
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

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {message && (
          <p className={`message ${isError ? 'error' : ''}`}>{message}</p>
        )}

        <p className="register-text">
          Chưa có tài khoản?{' '}
          <a href="/register" onClick={(e) => handleLinkClick(e, '/register')}>
            Đăng ký
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

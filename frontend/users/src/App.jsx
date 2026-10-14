
import { useState } from 'react'
import './index.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Đăng nhập thất bại.')
      }

      const data = result.data ?? result

      if (data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken)
      }

      setMessage('Đăng nhập thành công!')
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Không kết nối được máy chủ. Hãy kiểm tra backend.'
          : error.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="logo">♫</div>

        <h1>Chào mừng trở lại</h1>
        <p className="subtitle">
          Đăng nhập để tiếp tục nghe nhạc
        </p>

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
          <p className="message">{message}</p>
        )}

        <p className="register-text">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </p>
      </section>
    </main>
  )
}

export default App

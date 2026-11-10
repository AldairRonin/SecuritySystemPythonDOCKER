import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { user, login, isAuthenticating, error } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  if (user) {
    if (user.role === 'PARENT') {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === 'SECURITY') {
      return <Navigate to="/security" replace />;
    }

    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const loggedInUser = await login(username, password);

      if (loggedInUser.role === 'PARENT') {
        navigate('/dashboard', { replace: true });
      } else if (loggedInUser.role === 'SECURITY') {
        navigate('/security', { replace: true });
      } else if (loggedInUser.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      }
    } catch {
      // error is surfaced via auth context state
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-card__title">Вход в систему</h1>

        <p className="login-card__subtitle">
          Войдите, чтобы получить доступ к функциям системы в соответствии с вашей ролью.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Имя пользователя</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <div className="login-card__hint"></div>
      </div>
    </div>
  );
}
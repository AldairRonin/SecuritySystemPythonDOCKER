import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar__brand">Security System · Школа</span>
        {user && (
          <div className="topbar__user">
            <span>{user.fullName}</span>
            <button className="topbar__logout" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}

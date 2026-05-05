import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        onClick={() => navigate('/')}
        style={{ fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', color: '#1b64da' }}
      >
        Pagely
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
        <span style={{ color: '#6b7280' }}>
          {user?.role && <span style={{ marginRight: '4px', color: '#9ca3af' }}>[{user.role}]</span>}
          {user?.id?.slice(0, 8)}...
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#374151',
          }}
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}

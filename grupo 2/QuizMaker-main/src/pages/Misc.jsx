// src/pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/auth.service';

export function Unauthorized() {
  const { profile } = useAuth();
  const navigate    = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface)', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#FEE2E2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <ShieldOff size={36} color="var(--red)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginBottom: 12 }}>
          Acesso Negado
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Você não tem permissão para acessar esta página.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={handleLogout}>Sair</Button>
          <Button onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/teacher')}>
            Ir para o início
          </Button>
        </div>
      </div>
    </div>
  );
}

// src/pages/NotFound.jsx
export function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface)', padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 96, fontWeight: 800, color: 'var(--border)', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
          Página não encontrada
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          O endereço que você acessou não existe.
        </p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    </div>
  );
}

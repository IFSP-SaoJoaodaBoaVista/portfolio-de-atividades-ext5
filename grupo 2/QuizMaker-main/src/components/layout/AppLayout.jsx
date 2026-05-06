// src/components/layout/AppLayout.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu, X, FileQuestion, History, BarChart2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_TEACHER = [
  { to: '/teacher',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/quizzes', icon: BookOpen,         label: 'Meus Quizzes' },
  { to: '/teacher/results', icon: BarChart2,        label: 'Pontuações' },
];

const NAV_STUDENT = [
  { to: '/student',         icon: BookOpen,  label: 'Quizzes Disponíveis' },
  { to: '/student/history', icon: History,   label: 'Meu Histórico' },
];

const NAV_ADMIN = [
  { to: '/admin', icon: ShieldCheck, label: 'Painel Admin' },
];

function SidebarContent({ profile, navItems, onClose, onLogout }) {
  const roleLabel = profile?.role === 'teacher' ? '👨‍🏫 Professor'
                  : profile?.role === 'admin'   ? '🛡️ Administrador'
                  :                               '🎓 Aluno';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileQuestion size={20} color="var(--navy)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>QuizMaker</span>
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Olá!</div>
        <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 2 }}>{profile?.name || 'Usuário'}</div>
        <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>{roleLabel}</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/teacher' || to === '/student' || to === '/admin'} onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: '6px',
              textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 4, transition: 'all 0.15s',
              color: isActive ? 'var(--navy)' : 'rgba(255,255,255,0.7)',
              background: isActive ? 'var(--amber)' : 'transparent',
            })}
          >
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 12px 24px' }}>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
          border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
        }}>
          <LogOut size={18} /> Trocar de perfil
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { profile, isTeacher, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = isAdmin ? NAV_ADMIN : isTeacher ? NAV_TEACHER : NAV_STUDENT;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const roleEmoji = isAdmin ? '🛡️' : isTeacher ? '👨‍🏫' : '🎓';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="desktop-sidebar" style={{ width: 240, flexShrink: 0, background: 'var(--navy)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'none' }}>
        <SidebarContent profile={profile} navItems={navItems} onClose={() => {}} onLogout={handleLogout} />
      </aside>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,27,45,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)} />
      )}
      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: 'var(--navy)', zIndex: 60, overflowY: 'auto', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' }}>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <SidebarContent profile={profile} navItems={navItems} onClose={() => setOpen(false)} onLogout={handleLogout} />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: 60, background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 40 }}>
          <button className="mobile-menu-btn" onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy)', display: 'flex', padding: 4 }}>
            <Menu size={22} />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--navy)' }}>QuizMaker</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{roleEmoji} {profile?.name}</span>
            <button onClick={handleLogout} title="Trocar de perfil"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>{children}</main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color }) {
  const c = color || 'var(--navy)';
  return (
    <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 52, height: 52, borderRadius: '12px', background: c + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={c} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

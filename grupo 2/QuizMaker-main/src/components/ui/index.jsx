// src/components/ui/index.jsx
// Design system: Button, Input, Select, Textarea, Modal, Toast, Spinner, EmptyState

import { useEffect, useRef, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

/* ── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--navy)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2.5px solid ${color}22`,
      borderTop: `2.5px solid ${color}`,
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}

/* ── Button ─────────────────────────────────────────────────────────────── */
const BTN_STYLES = {
  primary: {
    background: 'var(--navy)', color: 'var(--white)',
    border: '1.5px solid var(--navy)',
  },
  secondary: {
    background: 'var(--white)', color: 'var(--navy)',
    border: '1.5px solid var(--border)',
  },
  amber: {
    background: 'var(--amber)', color: 'var(--navy)',
    border: '1.5px solid var(--amber)',
  },
  danger: {
    background: 'var(--red)', color: 'var(--white)',
    border: '1.5px solid var(--red)',
  },
  ghost: {
    background: 'transparent', color: 'var(--text-muted)',
    border: '1.5px solid transparent',
  },
};

export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  onClick, type = 'button', style = {},
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 'var(--radius-sm)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all 0.15s ease',
    opacity: disabled || loading ? 0.65 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...(size === 'sm'  ? { padding: '6px 14px', fontSize: 13 } :
        size === 'lg'  ? { padding: '13px 28px', fontSize: 16 } :
                         { padding: '9px 20px',  fontSize: 14 }),
    ...BTN_STYLES[variant],
    ...style,
  };

  return (
    <button type={type} style={base} disabled={disabled || loading} onClick={onClick}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled || loading ? '0.65' : '1'; }}
    >
      {loading ? <Spinner size={15} color={variant === 'secondary' || variant === 'ghost' ? 'var(--navy)' : 'var(--white)'} /> : null}
      {children}
    </button>
  );
}

/* ── Form Field ─────────────────────────────────────────────────────────── */
export function Field({ label, error, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>}
      {error && (
        <span style={{ fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

const inputBase = (hasError) => ({
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)', background: 'var(--white)',
  outline: 'none', transition: 'border-color 0.15s ease',
});

export function Input({ error, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputBase(!!error),
        borderColor: focused ? 'var(--navy)' : error ? 'var(--red)' : 'var(--border)',
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function Select({ error, children, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputBase(!!error),
        borderColor: focused ? 'var(--navy)' : error ? 'var(--red)' : 'var(--border)',
        appearance: 'none', cursor: 'pointer', ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, style, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      {...props}
      style={{
        ...inputBase(!!error),
        borderColor: focused ? 'var(--navy)' : error ? 'var(--red)' : 'var(--border)',
        resize: 'vertical', ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,27,45,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card animate-fade-up" style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{
          padding: '20px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 4, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
const TOAST_ICONS = {
  success: <CheckCircle size={18} color="var(--green)" />,
  error:   <AlertCircle  size={18} color="var(--red)" />,
  info:    <Info         size={18} color="var(--navy-300)" />,
};

export function Toast({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className="card animate-fade-up" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          minWidth: 280, maxWidth: 400, boxShadow: 'var(--shadow-lg)',
        }}>
          {TOAST_ICONS[t.type]}
          <span style={{ fontSize: 14, flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── useToast hook ──────────────────────────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };
  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));
  return {
    toasts, remove,
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
  };
}

/* ── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 32px', textAlign: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>{icon}</div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        {description && <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320 }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── ConfirmDialog ──────────────────────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

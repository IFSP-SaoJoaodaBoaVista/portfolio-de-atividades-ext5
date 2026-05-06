// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FileQuestion, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Button, Field, Input } from '../components/ui';

export default function LoginPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/teacher');
    }
  }, [user, profile]);

  const onSubmit = async ({ email, password }) => {
    setApiError('');
    const { user: u, error } = await login(email, password);
    if (error) { setApiError(error); return; }
    // Navigation handled by useEffect above
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-500) 100%)',
      padding: 24,
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FileQuestion size={30} color="var(--amber)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
            QuizMaker
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Plataforma de quizzes educacionais
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="E-mail" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'E-mail é obrigatório',
                pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' },
              })}
            />
          </Field>

          <Field label="Senha" error={errors.password?.message}>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                style={{ paddingRight: 44 }}
                {...register('password', { required: 'Senha é obrigatória' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {apiError && (
            <div style={{
              padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5',
              borderRadius: '6px', fontSize: 13, color: 'var(--red)',
            }}>
              {apiError}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
          Acesso restrito. Conta criada pelo administrador.
        </p>
      </div>
    </div>
  );
}

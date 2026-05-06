// src/pages/admin/TeacherManagement.jsx
import { useEffect, useState } from 'react';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Search } from 'lucide-react';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { listTeachers, toggleTeacherActive } from '../../services/users.service';
import { createTeacher } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import {
  Button, Field, Input, Select, Modal,
  Spinner, EmptyState, ConfirmDialog, useToast, Toast,
} from '../../components/ui';
import { useForm } from 'react-hook-form';

const SUBJECTS = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Física', 'Química', 'Biologia', 'Inglês', 'Filosofia', 'Sociologia', 'Artes', 'Educação Física',
];

function TeacherForm({ onSave, onClose }) {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await onSave(data, user.uid);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Nome completo" error={errors.name?.message}>
        <Input placeholder="Ana Oliveira" error={errors.name?.message}
          {...register('name', { required: 'Nome é obrigatório' })} />
      </Field>
      <Field label="E-mail" error={errors.email?.message}>
        <Input type="email" placeholder="professor@escola.com" error={errors.email?.message}
          {...register('email', {
            required: 'E-mail é obrigatório',
            pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' },
          })} />
      </Field>
      <Field label="Senha inicial" error={errors.password?.message} hint="Professor poderá alterar depois">
        <Input type="password" placeholder="Mínimo 6 caracteres" error={errors.password?.message}
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          })} />
      </Field>
      <Field label="Matéria principal" error={errors.subject?.message}>
        <Select error={errors.subject?.message} {...register('subject', { required: 'Selecione uma matéria' })}>
          <option value="">Selecione...</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
        <Button type="submit" loading={isSubmitting}>Criar Professor</Button>
      </div>
    </form>
  );
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);
  const toast = useToast();

  const load = async () => {
    const data = await listTeachers();
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data, adminUid) => {
    try {
      await createTeacher({ name: data.name, email: data.email, password: data.password, subjects: [data.subject] }, adminUid);
      toast.success(`Professor ${data.name} criado com sucesso!`);
      load();
    } catch (err) {
      toast.error(err.message || 'Erro ao criar professor.');
      throw err;
    }
  };

  const handleToggle = async (teacher) => {
    await toggleTeacherActive(teacher.id, !teacher.active);
    toast.info(`Professor ${teacher.active ? 'desativado' : 'ativado'}.`);
    load();
  };

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Professores"
        subtitle={`${teachers.length} professor${teachers.length !== 1 ? 'es' : ''} cadastrado${teachers.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setModalOpen(true)}><UserPlus size={16} />Novo Professor</Button>}
      />

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input placeholder="Buscar professor..." style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon="👨‍🏫" title="Nenhum professor encontrado"
            description="Clique em 'Novo Professor' para cadastrar o primeiro professor."
            action={<Button onClick={() => setModalOpen(true)}><UserPlus size={16} />Novo Professor</Button>}
          />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Nome', 'E-mail', 'Matérias', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className="animate-fade-up" style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  animationDelay: `${i * 0.04}s`,
                }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{t.name}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.email}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(t.subjects || []).map(s => (
                        <span key={s} className="badge badge-navy" style={{ fontSize: 10 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${t.active ? 'badge-green' : 'badge-muted'}`}>
                      {t.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => setConfirmToggle(t)}
                      title={t.active ? 'Desativar' : 'Ativar'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 6, borderRadius: 6 }}
                    >
                      {t.active ? <ToggleRight size={22} color="var(--green)" /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Professor">
        <TeacherForm onSave={handleCreate} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => handleToggle(confirmToggle)}
        title={confirmToggle?.active ? 'Desativar Professor' : 'Ativar Professor'}
        message={`Tem certeza que deseja ${confirmToggle?.active ? 'desativar' : 'ativar'} o professor ${confirmToggle?.name}?`}
        confirmLabel={confirmToggle?.active ? 'Desativar' : 'Ativar'}
        variant={confirmToggle?.active ? 'danger' : 'primary'}
      />

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </AppLayout>
  );
}

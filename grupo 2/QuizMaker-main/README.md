# QuizMaker 🎯

Plataforma web para criação e gestão de quizzes educacionais, com autenticação via Firebase e controle de acesso por perfis (Admin / Professor).

---

## ✅ Funcionalidades implementadas

### Admin
- [x] Dashboard com estatísticas gerais
- [x] Cadastro de professores (via Firebase Auth secundário)
- [x] Ativar / desativar contas de professores
- [x] Visualizar todos os quizzes da plataforma

### Professor
- [x] Login com e-mail e senha
- [x] Dashboard pessoal com resumo
- [x] Criar, editar e excluir quizzes
- [x] Adicionar/remover/reordenar perguntas
- [x] Múltiplas alternativas com indicação da resposta correta
- [x] Publicar / despublicar quiz
- [x] Busca e filtragem de quizzes

---

## 🚀 Como rodar localmente

### 1. Pré-requisitos
- Node.js 18+
- Conta no [Firebase](https://console.firebase.google.com)

### 2. Configurar o Firebase

1. Crie um projeto no Firebase Console
2. Ative **Authentication → Email/Password**
3. Crie um banco **Firestore** em modo de produção
4. Vá em **Configurações do projeto → Seus aplicativos → Web** e copie as credenciais

### 3. Variáveis de ambiente

```bash
cp .env.example .env
# Preencha o .env com suas credenciais Firebase
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Criar conta do Admin manualmente

No **Firebase Console → Authentication → Users**, crie um usuário com e-mail/senha.

Depois, no **Firestore → Coleção `users`**, crie um documento com o UID desse usuário:

```json
{
  "uid": "SEU_UID_AQUI",
  "email": "admin@escola.com",
  "name": "Administrador",
  "role": "admin",
  "active": true,
  "createdAt": "<Timestamp>"
}
```

### 6. Publicar as Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add       # selecione seu projeto
firebase deploy --only firestore:rules
```

### 7. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` e faça login com a conta do Admin.

---

## 📦 Build e deploy

```bash
npm run build
firebase deploy --only hosting
```

---

## 🗂 Estrutura do projeto

```
src/
├── firebase/         # Configuração do Firebase
├── services/         # Lógica de acesso ao Firestore e Auth
│   ├── auth.service.js
│   ├── users.service.js
│   └── quizzes.service.js
├── contexts/         # React Context (AuthContext)
├── components/
│   ├── ui/           # Design system (Button, Input, Modal, Toast...)
│   ├── layout/       # AppLayout, PageHeader, StatCard
│   └── ProtectedRoute.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── admin/        # Dashboard, Professores, Todos os Quizzes
│   └── teacher/      # Dashboard, Lista de Quizzes, Criar/Editar Quiz
├── App.jsx           # Roteamento principal
├── main.jsx          # Entry point
└── index.css         # Design system CSS
```

---

## 🗄 Estrutura do Firestore

```
/users/{uid}
  uid, email, name, role, subjects[], active, createdBy, createdAt

/quizzes/{quizId}
  title, subject, description, authorId, authorName,
  questionCount, isPublished, createdAt, updatedAt

/quizzes/{quizId}/questions/{questionId}
  text, options[{id, text}], correctOptionId, explanation, order
```

---

## 🔐 Segurança

- Senhas gerenciadas pelo Firebase Authentication
- Regras do Firestore garantem isolamento por usuário
- Professores só acessam seus próprios quizzes
- Admin tem visão total, sem escrever dados de outros
- Professores são criados por app Firebase secundário (admin não perde sessão)
- Credenciais nunca expostas no código (sempre via `.env`)

---

## 🔮 Próximos passos sugeridos

- [ ] Portal do aluno (responder quizzes publicados)
- [ ] Dashboard de resultados por quiz
- [ ] Firebase Functions para criação de professores (mais seguro)
- [ ] Banco de questões reutilizável
- [ ] Temporizador por quiz
- [ ] Exportação de resultados em PDF/CSV

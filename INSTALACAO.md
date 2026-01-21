# 🚀 Guia de Instalação e Execução - TarefaFácil

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em seu computador:

- **Node.js** v20 ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14 ou superior ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

## 🗄️ 1. Configuração do Banco de Dados

### Windows:

1. Abra o **pgAdmin** ou **psql**
2. Crie um novo banco de dados:

```sql
CREATE DATABASE tarefafacil;
```

3. Anote as credenciais:
   - Host: `localhost`
   - Porta: `5432` (padrão)
   - Usuário: `postgres` (ou seu usuário)
   - Senha: (sua senha do PostgreSQL)
   - Database: `tarefafacil`

## ⚙️ 2. Configuração do Backend

### Passo 1: Instalar dependências

```powershell
cd backend
npm install
```

### Passo 2: Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` (copie do `.env.example`):

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Porta do servidor
PORT=3000
NODE_ENV=development

# Banco de Dados - SUBSTITUA COM SUAS CREDENCIAIS
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/tarefafacil?schema=public"

# JWT Secret - GERE UMA CHAVE SEGURA
JWT_SECRET=minha_chave_super_secreta_troque_isso_por_algo_unico
JWT_EXPIRES_IN=7d

# Email (Gmail como exemplo - configure com seu email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=TarefaFácil <noreply@tarefafacil.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Notificações
ENABLE_NOTIFICATIONS=true
NOTIFICATION_HOUR=9
```

### Passo 3: Gerar Prisma Client e executar migrations

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### Passo 4: Iniciar o backend

```powershell
npm run dev
```

✅ Backend rodando em `http://localhost:3000`

## 🎨 3. Configuração do Frontend

### Passo 1: Instalar dependências

Abra um **novo terminal** (PowerShell):

```powershell
cd frontend
npm install
```

### Passo 2: Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `frontend`:

```powershell
Copy-Item .env.example .env
```

O conteúdo deve ser:

```env
VITE_API_URL=http://localhost:3000/api
```

### Passo 3: Configurar Tailwind CSS

```powershell
npx tailwindcss init -p
```

### Passo 4: Iniciar o frontend

```powershell
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

## 🎯 4. Acessar o Sistema

1. Abra o navegador em: **http://localhost:5173**
2. Clique em "Criar conta grátis"
3. Cadastre-se com:
   - Nome completo
   - Email válido
   - Senha (mínimo 8 caracteres, com letra e número)
4. Faça login e comece a usar!

## 📧 5. Configuração de Email (Opcional)

Para ativar notificações por email, configure o Gmail:

### Obter senha de app do Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative a **Verificação em duas etapas**
3. Vá em **Senhas de app**
4. Gere uma senha para "Mail" → "Outro"
5. Copie a senha gerada
6. Cole no `.env` em `EMAIL_PASS`

## 🔧 Comandos Úteis

### Backend:

```powershell
# Desenvolvimento
npm run dev

# Produção
npm start

# Ver banco de dados no navegador
npx prisma studio

# Nova migration
npx prisma migrate dev --name nome_da_migration

# Reset do banco de dados
npx prisma migrate reset
```

### Frontend:

```powershell
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados:

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `DATABASE_URL`
- Teste a conexão no pgAdmin

### Porta já em uso:

- Backend: altere `PORT` no `.env`
- Frontend: altere `port` no `vite.config.js`

### Erro ao instalar dependências:

```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Erro no Prisma:

```powershell
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev
```

## 📱 Testando Responsividade

1. Abra o DevTools (F12)
2. Clique no ícone de dispositivos móveis
3. Teste em diferentes resoluções

## 🚀 Deploy (Opcional)

### Backend (Railway):

1. Crie conta em https://railway.app
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Deploy automático!

### Frontend (Vercel):

1. Crie conta em https://vercel.com
2. Conecte seu repositório GitHub
3. Configure `VITE_API_URL` com a URL do backend
4. Deploy automático!

## 📚 Estrutura de Pastas

```
tcc final/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── README.md
```

## ✅ Checklist de Instalação

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `tarefafacil` criado
- [ ] Backend: dependências instaladas (`npm install`)
- [ ] Backend: `.env` configurado
- [ ] Backend: migrations executadas (`npx prisma migrate dev`)
- [ ] Backend: servidor rodando (`npm run dev`)
- [ ] Frontend: dependências instaladas (`npm install`)
- [ ] Frontend: `.env` configurado
- [ ] Frontend: servidor rodando (`npm run dev`)
- [ ] Sistema acessível em http://localhost:5173

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do terminal
2. Consulte a documentação
3. Revise os passos de instalação
4. Verifique as versões do Node.js e PostgreSQL

## 🎓 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Explore o Dashboard
2. ✅ Crie sua primeira tarefa
3. ✅ Configure suas preferências
4. ✅ Teste as notificações
5. ✅ Experimente os filtros e o calendário

---

**Desenvolvido como TCC de Análise e Desenvolvimento de Sistemas** 🎓

Bons estudos e boa organização! 📚✨

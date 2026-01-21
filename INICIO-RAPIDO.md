# ⚡ Início Rápido - TarefaFácil

## 🚀 Comandos para Começar Agora

### 1. Instalar Dependências do Backend

```powershell
cd backend
npm install
```

### 2. Criar arquivo .env no backend

```powershell
# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Editar o arquivo .env e configurar DATABASE_URL
notepad .env
```

**Configuração mínima necessária:**
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/tarefafacil?schema=public"
JWT_SECRET=troque_por_uma_chave_segura_aqui
FRONTEND_URL=http://localhost:5173
```

### 3. Criar Banco de Dados

No **psql** ou **pgAdmin**:
```sql
CREATE DATABASE tarefafacil;
```

### 4. Executar Migrations do Prisma

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Iniciar Backend

```powershell
npm run dev
```

✅ **Backend rodando em** `http://localhost:3000`

---

### 6. Instalar Dependências do Frontend

**Abra um novo terminal:**

```powershell
cd frontend
npm install
```

### 7. Criar arquivo .env no frontend

```powershell
Copy-Item .env.example .env
```

### 8. Iniciar Frontend

```powershell
npm run dev
```

✅ **Frontend rodando em** `http://localhost:5173`

---

## 🎯 Pronto para Usar!

1. Acesse: **http://localhost:5173**
2. Clique em **"Criar conta grátis"**
3. Cadastre-se e comece a organizar suas tarefas!

---

## 📌 Funcionalidades Principais

✅ **Autenticação Completa**
- Login e cadastro com validação
- Recuperação de senha
- JWT tokens seguros

✅ **Gerenciamento de Tarefas**
- Criar, editar, excluir tarefas
- Marcar como concluída
- Filtros por status, disciplina e prioridade
- Ordenação personalizada

✅ **Dashboard Intuitivo**
- Resumo de tarefas pendentes, concluídas e atrasadas
- Tarefas da semana
- Tarefas recentes
- Estatísticas visuais

✅ **Sistema de Notificações**
- Lembretes 24h antes do prazo
- Notificação no dia da entrega
- Emails automáticos (configurável)

✅ **Organização Avançada**
- Categorização por disciplina
- Níveis de prioridade (Alta, Média, Baixa)
- Indicadores visuais de status
- Contador de dias restantes

✅ **Interface Responsiva**
- Design mobile-first
- Compatível com todos os dispositivos
- Dark mode (opcional)

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT + Bcrypt
- Nodemailer + Node-cron

### Frontend
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast
- Lucide Icons

---

## 📖 Documentação Completa

- **Instalação Detalhada:** [INSTALACAO.md](INSTALACAO.md)
- **Documentação Geral:** [README.md](README.md)

---

## 🆘 Problemas Comuns

### Backend não inicia:
- Verifique se PostgreSQL está rodando
- Confirme credenciais no arquivo `.env`
- Execute: `npx prisma migrate reset`

### Frontend não carrega:
- Verifique se backend está rodando
- Confirme URL da API no `.env`
- Limpe cache: `Ctrl + Shift + R`

### Erro ao criar tarefa:
- Verifique se está autenticado
- Confirme que o backend está respondendo
- Veja console do navegador (F12)

---

## 🎓 Sistema Desenvolvido para TCC

**TarefaFácil** - Sistema de gerenciamento de tarefas escolares para estudantes do ensino fundamental e médio.

**Objetivo:** Melhorar a organização, acompanhamento e gestão de tarefas escolares, promovendo hábitos organizacionais eficientes.

---

**Boa sorte com seu TCC! 🚀📚**

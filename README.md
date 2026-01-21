# TarefaFácil — Projeto Final

TarefaFácil é uma aplicação full‑stack para gerenciamento de tarefas com autenticação de usuários, envio de e‑mails de notificação e painel interativo. Desenvolvida como projeto final, demonstra integrações reais entre frontend (React + Vite + Tailwind) e backend (Node.js + Prisma).

## Principais funcionalidades
- Cadastro, login e autenticação JWT
- CRUD de tarefas com categorias/estado
- Notificações por e‑mail
- Proteção de rotas e validações no servidor

## Tecnologias
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Prisma, Nodemailer
- Banco: SQLite / Postgres (conforme `prisma/schema.prisma`)

## Como rodar localmente

```powershell
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Licença
Recomenda-se usar `MIT` se você permitir uso e modificações. Ajuste conforme necessidades acadêmicas.
# 📚 TarefaFácil - Sistema de Gerenciamento de Tarefas Escolares

Sistema web intuitivo e responsivo para estudantes do ensino fundamental e médio gerenciarem suas tarefas escolares de forma eficiente.

## 🎯 Objetivo

Desenvolver um sistema que permita aos estudantes melhorar significativamente a organização, o acompanhamento e a gestão de suas tarefas escolares, promovendo o desenvolvimento de hábitos organizacionais eficientes e o cumprimento pontual de compromissos acadêmicos.

## ✨ Principais Funcionalidades

- ✅ **Gestão de Tarefas**: Criar, editar, visualizar e excluir tarefas escolares
- 📊 **Dashboard Intuitivo**: Visualização centralizada de todas as atividades
- 🔔 **Notificações Automáticas**: Lembretes de prazos (24h antes e no dia)
- 🏷️ **Categorização**: Organização por disciplina e nível de prioridade
- 📅 **Calendário Visual**: Vista mensal com tarefas destacadas
- 📈 **Estatísticas**: Métricas de progresso e produtividade
- 🔐 **Autenticação Segura**: Sistema de login e gerenciamento individualizado

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com Vite
- **Tailwind CSS** para estilização
- **React Router DOM** para navegação
- **Axios** para requisições HTTP
- **Lucide React** para ícones
- **React Hot Toast** para notificações
- **React Hook Form** para formulários
- **React Datepicker** para seleção de datas

### Backend
- **Node.js** v20+
- **Express.js** framework web
- **PostgreSQL** banco de dados relacional
- **Prisma ORM** para modelagem de dados
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Nodemailer** para envio de emails
- **Node-cron** para agendamento de tarefas
- **Zod** para validação de dados

## 📁 Estrutura do Projeto

```
tarefafacil/
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Serviços de API
│   │   ├── context/      # Context API
│   │   └── utils/        # Funções auxiliares
│   └── package.json
│
├── backend/           # API REST Node.js
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── routes/       # Rotas da API
│   │   ├── middlewares/  # Middlewares
│   │   ├── services/     # Serviços
│   │   ├── config/       # Configurações
│   │   └── utils/        # Utilidades
│   ├── prisma/           # Schema e migrations
│   └── package.json
│
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js v20 ou superior
- PostgreSQL instalado e rodando
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd "tcc final"
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Criar arquivo .env com as variáveis de ambiente
cp .env.example .env

# Configurar DATABASE_URL no .env
# Exemplo: DATABASE_URL="postgresql://usuario:senha@localhost:5432/tarefafacil"

# Rodar migrations do Prisma
npx prisma migrate dev

# Iniciar servidor backend
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Criar arquivo .env
# VITE_API_URL=http://localhost:3000/api

# Iniciar aplicação React
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📋 Funcionalidades Detalhadas

### Gestão de Usuários
- Cadastro com validação de email único
- Login com autenticação JWT
- Recuperação de senha via email
- Edição de perfil
- Logout seguro

### Gestão de Tarefas
- Criar tarefas com título, descrição, disciplina, prioridade e data de entrega
- Listar todas as tarefas com filtros
- Editar informações das tarefas
- Excluir tarefas com confirmação
- Marcar como concluída
- Categorizar por disciplina (Matemática, Português, História, etc.)
- Definir prioridade (Alta, Média, Baixa)

### Dashboard
- Resumo de tarefas pendentes, concluídas e atrasadas
- Tarefas do dia e da semana
- Gráficos de distribuição
- Filtros avançados (status, disciplina, prioridade)
- Ordenação personalizada

### Notificações
- Lembrete automático 24h antes do prazo
- Notificação no dia da entrega
- Destaque visual de tarefas atrasadas
- Contador de dias restantes

### Calendário
- Vista mensal com tarefas
- Cores por prioridade
- Navegação entre meses
- Detalhes ao clicar no dia

### Estatísticas
- Total de tarefas criadas
- Taxa de conclusão no prazo
- Distribuição por disciplina
- Evolução mensal
- Métricas de produtividade

## 🔒 Segurança

- Senhas com hash bcrypt
- Autenticação JWT com tokens seguros
- Validação de entrada contra SQL Injection e XSS
- Rotas protegidas no backend
- HTTPS obrigatório em produção
- Conformidade com LGPD

## 📱 Responsividade

- Design mobile-first
- Compatível com dispositivos de 320px a 1920px
- Testado em Android e iOS
- Navegadores suportados: Chrome, Firefox, Safari, Edge

## 🧪 Testes

- Testes unitários de funções críticas
- Testes de integração de API
- Testes de usabilidade
- Validação de segurança

## 🌐 Deploy

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Configurar variáveis de ambiente no painel
# Deploy automático via Git
```

## 👥 Personas

**João Pedro (Estudante - Persona Principal)**
- 15 anos, 9º ano do ensino fundamental
- Dificuldades de organização
- Precisa de interface simples e lembretes automáticos

**Professora Ana (Persona Secundária)**
- Educadora que incentiva organização
- Interesse no desempenho dos alunos

## 📊 Critérios de Sucesso

- ✅ Sistema funcionando sem erros críticos
- ✅ Performance < 2s no carregamento
- ✅ Responsividade total
- ✅ Interface intuitiva
- ✅ Notificações funcionando
- ✅ Satisfação do usuário > 4/5

## 📄 Licença

Este projeto é um TCC (Trabalho de Conclusão de Curso) de Análise e Desenvolvimento de Sistemas.

## 👨‍💻 Desenvolvedor

Desenvolvido como projeto acadêmico para demonstrar conhecimentos em desenvolvimento full-stack web.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.

---

**TarefaFácil** - Organize suas tarefas, alcance seus objetivos! 🎓✨

# TarefaFácil

Sistema web full-stack para gerenciamento de tarefas escolares, com autenticação, dashboard, calendário, estatísticas e notificações para alunos e professores.

## Objetivo

O projeto foi desenvolvido como TCC para apoiar a organização de atividades escolares, permitindo que alunos acompanhem prazos e que professores distribuam e avaliem tarefas em um fluxo simples.

## Funcionalidades

- Cadastro e login com autenticação JWT
- Perfis de aluno e professor
- Criação, listagem, edição e exclusão de tarefas
- Marcação de tarefa como concluída pelo aluno
- Avaliação de tarefas pelo professor com nota e feedback
- Dashboard com resumo de pendentes, concluídas e atrasadas
- Calendário visual com tarefas por data
- Estatísticas de desempenho e conclusão
- Notificações automáticas por e-mail
- Central de notificações com ícone de sino no sistema
- Chat interno entre aluno e professor

## Stack Tecnológica

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- React Hot Toast
- React Hook Form
- React Datepicker

### Backend

- Node.js
- Express
- Prisma ORM
- JWT
- Bcrypt
- Nodemailer
- Node-cron
- Zod

### Banco de dados

- SQLite

Observação: o schema atual do Prisma em [backend/prisma/schema.prisma](c:/Users/Usuario/Desktop/tcc%20final/backend/prisma/schema.prisma) está configurado com `provider = "sqlite"`.

## Estrutura do Projeto

```text
tcc final/
├── backend/
│   ├── prisma/
│   ├── src/
│   └── package.json
├── docs/
│   └── screenshots/
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── start.py
└── README.md
```

## Como Executar

### Pré-requisitos

- Node.js 20 ou superior
- Python 3.11+ para usar o inicializador [start.py](c:/Users/Usuario/Desktop/tcc%20final/start.py)
- Git

### 1. Clonar o projeto

```bash
git clone <url-do-repositorio>
cd "tcc final"
```

### 2. Configurar o backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev
npm run seed
```

Por padrão, o banco local fica em `backend/prisma/dev.db`.

### 3. Configurar o frontend

```bash
cd frontend
npm install
copy .env.example .env
```

### 4. Iniciar a aplicação

#### Opção recomendada

Na raiz do projeto:

```bash
python start.py
```

O script inicia backend e frontend juntos e encerra ambos com `Ctrl+C`.

#### Opção manual

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### URLs padrão

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Observação: se a porta `5173` estiver ocupada, o Vite pode subir em outra porta, como `5174`.

## Usuários de Teste

Após executar `npm run seed` no backend:

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@test.com` | `Senha123@` |
| Professor | `professor@test.com` | `Senha123@` |

## Fluxo Principal

### Aluno

- Visualiza tarefas recebidas
- Marca tarefas como concluídas
- Acompanha feedback e nota do professor
- Recebe lembretes e notificações no sistema

### Professor

- Cria tarefas para os alunos
- Acompanha entregas no dashboard
- Avalia tarefas concluídas com nota e feedback
- Recebe notificações quando uma tarefa é concluída

## Funcionalidades Detalhadas

### Dashboard

- Resumo de tarefas pendentes, concluídas e atrasadas
- Contagem correta de tarefas concluídas e avaliadas
- Lista de tarefas recentes

### Tarefas

- Filtros por status, prioridade e disciplina
- Controle de conclusão e reabertura
- Avaliação com nota e comentário
- Valor de pontos por tarefa

### Notificações

- Lembrete por e-mail antes do prazo e no dia da entrega
- Avisos de tarefa concluída e tarefa avaliada
- Central de notificações com sino no cabeçalho

### Perfil

- Atualização de nome, endereço, biografia e foto de perfil
- Preferências de notificações no backend

### Chat

- Conversas entre aluno e professor dentro da plataforma
- Lista de conversas com última mensagem e contador de não lidas
- Envio e leitura de mensagens em tempo real por polling

## Prints das Telas

As capturas usadas na documentação ficam em [docs/screenshots](c:/Users/Usuario/Desktop/tcc%20final/docs/screenshots) (15 arquivos: login, cadastro, telas do professor, telas do aluno).

**Como regenerar (com backend e frontend rodando em `http://localhost:3000` e `http://localhost:5173`):**

```bash
cd frontend
npx playwright install chromium
npm run capturar-telas
```

As imagens são salvas em `docs/screenshots/`. Na primeira execução, o Playwright baixa o Chromium automaticamente.

## Segurança

- Senhas com hash bcrypt
- Autenticação JWT
- Rotas protegidas por perfil
- Validação de entrada no backend

## Scripts Úteis

### Backend

```bash
npm run dev
npm run seed
npm run prisma:migrate
npm run prisma:generate
npm run prisma:studio
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run capturar-telas
```

## Observações

- O README anterior tinha seções duplicadas e referências conflitantes a PostgreSQL; isso foi consolidado para refletir o estado atual do projeto.
- Se for necessário migrar o banco para PostgreSQL no futuro, será preciso ajustar [backend/prisma/schema.prisma](c:/Users/Usuario/Desktop/tcc%20final/backend/prisma/schema.prisma) e a documentação correspondente.

## Licença

Projeto acadêmico desenvolvido para Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas.

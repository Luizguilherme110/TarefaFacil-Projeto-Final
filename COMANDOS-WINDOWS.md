# 🪟 Comandos PowerShell para Windows - TarefaFácil

## ⚡ Script Completo de Instalação

### PASSO 1: Navegar até a pasta do projeto

```powershell
cd "C:\Users\Usuario\Desktop\tcc final"
```

### PASSO 2: Configurar Backend

```powershell
# Navegar para backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env a partir do exemplo
Copy-Item .env.example .env

# IMPORTANTE: Editar o arquivo .env
notepad .env
```

**No notepad, configure:**
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/tarefafacil?schema=public"
JWT_SECRET=sua_chave_secreta_unica_e_segura_aqui_123456
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ENABLE_NOTIFICATIONS=true
```

**Salve e feche o arquivo .env**

### PASSO 3: Criar Banco de Dados no PostgreSQL

```powershell
# Abrir psql (substitua 'postgres' pelo seu usuário se diferente)
psql -U postgres
```

**No psql, execute:**
```sql
CREATE DATABASE tarefafacil;
\q
```

**Ou use pgAdmin:**
1. Abra pgAdmin
2. Clique com botão direito em "Databases"
3. Create → Database
4. Nome: `tarefafacil`
5. Save

### PASSO 4: Executar Migrations do Prisma

```powershell
# Gerar Prisma Client
npx prisma generate

# Executar migrations (criar tabelas)
npx prisma migrate dev --name init

# OPCIONAL: Ver banco de dados no navegador
npx prisma studio
```

### PASSO 5: Iniciar Backend

```powershell
# Iniciar servidor em modo desenvolvimento
npm run dev
```

✅ **Backend rodando em http://localhost:3000**

**MANTENHA ESTE TERMINAL ABERTO**

---

### PASSO 6: Configurar Frontend (NOVO TERMINAL)

**Abra um NOVO PowerShell:**

```powershell
# Navegar para a pasta do frontend
cd "C:\Users\Usuario\Desktop\tcc final\frontend"

# Instalar dependências
npm install

# Criar arquivo .env
Copy-Item .env.example .env

# OPCIONAL: Ver conteúdo do .env (já está configurado)
cat .env
```

### PASSO 7: Iniciar Frontend

```powershell
# Iniciar aplicação React
npm run dev
```

✅ **Frontend rodando em http://localhost:5173**

---

## 🎯 Acessar o Sistema

1. Abra o navegador
2. Acesse: **http://localhost:5173**
3. Crie sua conta
4. Comece a usar!

---

## 🔄 Comandos para Reiniciar

### Reiniciar Backend:

```powershell
cd "C:\Users\Usuario\Desktop\tcc final\backend"
npm run dev
```

### Reiniciar Frontend:

```powershell
cd "C:\Users\Usuario\Desktop\tcc final\frontend"
npm run dev
```

---

## 🧹 Limpeza e Reinstalação (se necessário)

### Limpar cache do npm e reinstalar:

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# Frontend
cd ..\frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Resetar banco de dados:

```powershell
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🔍 Verificar se está tudo funcionando

### Testar Backend:

```powershell
# Em um novo PowerShell
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "mensagem": "API TarefaFácil está funcionando!",
  "timestamp": "..."
}
```

### Testar Frontend:

Abra o navegador em: **http://localhost:5173**

---

## 📝 Comandos Úteis do Prisma

```powershell
# Ver banco de dados visual
npx prisma studio

# Gerar novo Prisma Client
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate deploy

# Resetar banco (apaga TUDO!)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status
```

---

## 🐛 Solução de Problemas Windows

### Erro "Execution of scripts is disabled":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro de porta em uso:

```powershell
# Ver o que está usando a porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID numero_do_pid /F
```

### PostgreSQL não está rodando:

```powershell
# Iniciar serviço PostgreSQL
net start postgresql-x64-14
```

### Verificar versão do Node.js:

```powershell
node --version
# Deve ser v20 ou superior
```

### Verificar versão do npm:

```powershell
npm --version
```

---

## 📊 Estrutura de Pastas Criadas

```
C:\Users\Usuario\Desktop\tcc final\
│
├── backend\
│   ├── node_modules\      (criado após npm install)
│   ├── prisma\
│   │   ├── schema.prisma
│   │   └── migrations\    (criado após migrate)
│   ├── src\
│   ├── .env               (você criou)
│   ├── .env.example
│   └── package.json
│
├── frontend\
│   ├── node_modules\      (criado após npm install)
│   ├── src\
│   ├── .env               (você criou)
│   ├── .env.example
│   └── package.json
│
├── README.md
├── INSTALACAO.md
├── INICIO-RAPIDO.md
└── COMANDOS-WINDOWS.md (este arquivo)
```

---

## ✅ Checklist Final

- [ ] Node.js v20+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `tarefafacil` criado
- [ ] Backend: `npm install` executado
- [ ] Backend: `.env` configurado
- [ ] Backend: `npx prisma migrate dev` executado
- [ ] Backend: servidor rodando (porta 3000)
- [ ] Frontend: `npm install` executado
- [ ] Frontend: `.env` criado
- [ ] Frontend: servidor rodando (porta 5173)
- [ ] Sistema aberto no navegador
- [ ] Conta criada com sucesso

---

## 🎓 Sucesso!

Se chegou até aqui e tudo está funcionando, parabéns! 🎉

Seu sistema **TarefaFácil** está pronto para uso!

---

**Desenvolvido para TCC - Análise e Desenvolvimento de Sistemas**

Bons estudos e boa organização! 📚✨

# ⚠️ ERRO: Node.js NÃO INSTALADO

## 🔴 Problema Identificado

O comando `node` não foi reconhecido, o que significa que **o Node.js não está instalado** no seu computador.

---

## ✅ SOLUÇÃO: Instalar Node.js

### 📥 Passo 1: Baixar Node.js

1. **Abra o navegador** e acesse: https://nodejs.org/
2. Clique no botão verde **"20.11.0 LTS"** (ou versão mais recente LTS)
3. O download do arquivo `.msi` começará automaticamente
4. Aguarde o download concluir (arquivo ~30MB)

### 📦 Passo 2: Instalar Node.js

1. Localize o arquivo baixado (geralmente em `Downloads`)
2. **Dê duplo clique** no arquivo `.msi` para iniciar a instalação
3. Clique em **"Next"** (Avançar)
4. Aceite os termos → Marque **"I accept..."** → **"Next"**
5. Mantenha o caminho padrão → **"Next"**
6. Deixe todas as opções marcadas → **"Next"**
7. **IMPORTANTE:** Marque **"Automatically install the necessary tools"** → **"Next"**
8. Clique em **"Install"** (pode pedir senha de administrador)
9. Aguarde a instalação (2-5 minutos)
10. Clique em **"Finish"**

### 🔄 Passo 3: Reiniciar PowerShell

**MUITO IMPORTANTE:**

1. Feche **TODOS** os terminais PowerShell abertos
2. Feche o VS Code (se estiver aberto)
3. Abra um **NOVO PowerShell**

### ✅ Passo 4: Verificar Instalação

No novo PowerShell, execute:

```powershell
node --version
```

✅ Deve aparecer algo como: `v20.11.0`

```powershell
npm --version
```

✅ Deve aparecer algo como: `10.2.4`

**Se aparecer as versões, a instalação funcionou!** 🎉

---

## 🚀 PRÓXIMOS PASSOS

Após instalar o Node.js com sucesso, execute:

### 1. Instalar dependências do BACKEND:

```powershell
cd "C:\Users\Usuario\Desktop\tcc final\backend"
npm install
```

✅ Aguarde... pode demorar 2-5 minutos baixando pacotes.

### 2. Instalar dependências do FRONTEND:

```powershell
cd "C:\Users\Usuario\Desktop\tcc final\frontend"
npm install
```

✅ Aguarde... pode demorar 2-5 minutos baixando pacotes.

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Problema 1: "node não é reconhecido" mesmo após instalar

**Causa:** O caminho do Node.js não foi adicionado ao PATH.

**Solução:**

1. **Reinicie o computador** (solução mais fácil)
2. Abra um novo PowerShell
3. Teste: `node --version`

**OU**

Adicione manualmente ao PATH:

```powershell
# Verificar se Node.js está instalado
Test-Path "C:\Program Files\nodejs\node.exe"
```

Se retornar `True`, o Node.js está instalado. Adicione ao PATH:

1. Pressione `Win + Pause` (ou `Win + X` → Sistema)
2. Clique em **"Configurações avançadas do sistema"**
3. Clique em **"Variáveis de Ambiente"**
4. Em "Variáveis do sistema", selecione **Path**
5. Clique em **"Editar"**
6. Clique em **"Novo"**
7. Digite: `C:\Program Files\nodejs\`
8. Clique em **OK** em todas as janelas
9. **Feche e abra novo PowerShell**

### ❌ Problema 2: Erro de permissão durante npm install

**Solução:**

1. Feche o PowerShell
2. Clique com botão direito no ícone do PowerShell
3. Selecione **"Executar como administrador"**
4. Execute novamente: `npm install`

### ❌ Problema 3: "Execução de scripts foi desabilitada"

**Solução:**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Digite `S` (Sim) e pressione Enter.

### ❌ Problema 4: npm install muito lento ou travado

**Solução:**

```powershell
# Cancelar (Ctrl + C)
# Limpar cache
npm cache clean --force

# Tentar novamente
npm install
```

---

## 📋 CHECKLIST DE INSTALAÇÃO

- [ ] Node.js baixado de https://nodejs.org/
- [ ] Node.js instalado com instalador `.msi`
- [ ] PowerShell fechado e reaberto (ou computador reiniciado)
- [ ] Comando `node --version` funciona
- [ ] Comando `npm --version` funciona
- [ ] `npm install` executado no backend
- [ ] `npm install` executado no frontend
- [ ] PostgreSQL instalado (próximo passo)

---

## 🎯 RESUMO RÁPIDO

```powershell
# 1. Instalar Node.js de https://nodejs.org/
# 2. Reiniciar PowerShell
# 3. Verificar
node --version
npm --version

# 4. Instalar backend
cd "C:\Users\Usuario\Desktop\tcc final\backend"
npm install

# 5. Instalar frontend
cd "C:\Users\Usuario\Desktop\tcc final\frontend"
npm install
```

---

## 📞 INFORMAÇÕES IMPORTANTES

**Versões Recomendadas:**
- Node.js: v20.11.0 LTS ou superior
- npm: 10.2.4 ou superior
- Windows: 10 ou 11

**Links Úteis:**
- Download Node.js: https://nodejs.org/
- Documentação: https://nodejs.org/docs/

---

## ✅ APÓS RESOLVER

Quando o `npm install` funcionar, continue com:

1. Configurar PostgreSQL
2. Configurar arquivo `.env`
3. Executar migrations do Prisma
4. Iniciar o sistema

Siga: **[INSTALACAO.md](INSTALACAO.md)**

---

**🎓 Dica:** Sempre que instalar algo novo (Node.js, Python, etc), feche e abra um novo terminal para as mudanças no PATH terem efeito!

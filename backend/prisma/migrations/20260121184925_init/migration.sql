-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "notificacoesAtivas" BOOLEAN NOT NULL DEFAULT true,
    "horarioNotificacao" INTEGER NOT NULL DEFAULT 9,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "disciplina" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "dataEntrega" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataConclusao" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "tarefas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "enviada" BOOLEAN NOT NULL DEFAULT false,
    "dataEnvio" DATETIME,
    "tarefaId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "tarefas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "tarefas_usuarioId_idx" ON "tarefas"("usuarioId");

-- CreateIndex
CREATE INDEX "tarefas_dataEntrega_idx" ON "tarefas"("dataEntrega");

-- CreateIndex
CREATE INDEX "tarefas_status_idx" ON "tarefas"("status");

-- CreateIndex
CREATE INDEX "notificacoes_tarefaId_idx" ON "notificacoes"("tarefaId");

-- CreateIndex
CREATE INDEX "notificacoes_enviada_idx" ON "notificacoes"("enviada");

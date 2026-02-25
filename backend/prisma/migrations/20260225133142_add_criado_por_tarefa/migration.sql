-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tarefas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "disciplina" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "dataEntrega" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataConclusao" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "criadoPorId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "tarefas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tarefas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tarefas" ("atualizadoEm", "criadoEm", "dataConclusao", "dataEntrega", "descricao", "disciplina", "id", "prioridade", "status", "titulo", "usuarioId") SELECT "atualizadoEm", "criadoEm", "dataConclusao", "dataEntrega", "descricao", "disciplina", "id", "prioridade", "status", "titulo", "usuarioId" FROM "tarefas";
DROP TABLE "tarefas";
ALTER TABLE "new_tarefas" RENAME TO "tarefas";
CREATE INDEX "tarefas_usuarioId_idx" ON "tarefas"("usuarioId");
CREATE INDEX "tarefas_criadoPorId_idx" ON "tarefas"("criadoPorId");
CREATE INDEX "tarefas_dataEntrega_idx" ON "tarefas"("dataEntrega");
CREATE INDEX "tarefas_status_idx" ON "tarefas"("status");
CREATE TABLE "new_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ALUNO',
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "notificacoesAtivas" BOOLEAN NOT NULL DEFAULT true,
    "horarioNotificacao" INTEGER NOT NULL DEFAULT 9,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_usuarios" ("atualizadoEm", "criadoEm", "email", "horarioNotificacao", "id", "nome", "notificacoesAtivas", "resetToken", "resetTokenExpiry", "senha") SELECT "atualizadoEm", "criadoEm", "email", "horarioNotificacao", "id", "nome", "notificacoesAtivas", "resetToken", "resetTokenExpiry", "senha" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

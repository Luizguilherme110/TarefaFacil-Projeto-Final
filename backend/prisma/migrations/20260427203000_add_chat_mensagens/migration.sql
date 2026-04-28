-- CreateTable
CREATE TABLE "mensagens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conteudo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mensagens_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "mensagens_remetenteId_idx" ON "mensagens"("remetenteId");

-- CreateIndex
CREATE INDEX "mensagens_destinatarioId_idx" ON "mensagens"("destinatarioId");

-- CreateIndex
CREATE INDEX "mensagens_criadoEm_idx" ON "mensagens"("criadoEm");

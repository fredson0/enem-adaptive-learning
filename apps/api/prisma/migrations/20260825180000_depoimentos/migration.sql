-- CreateTable
CREATE TABLE "depoimentos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "texto" VARCHAR(600) NOT NULL,
    "papel" VARCHAR(120),
    "aprovado" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "depoimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "depoimentos_usuario_id_key" ON "depoimentos"("usuario_id");

-- CreateIndex
CREATE INDEX "depoimentos_aprovado_criado_em_idx" ON "depoimentos"("aprovado", "criado_em");

-- AddForeignKey
ALTER TABLE "depoimentos" ADD CONSTRAINT "depoimentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

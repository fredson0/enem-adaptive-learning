-- CreateEnum
CREATE TYPE "PapelMensagemTutor" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "conversas_tutor" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "titulo" VARCHAR(120) NOT NULL DEFAULT 'Nova conversa',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "conversas_tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_tutor" (
    "id" UUID NOT NULL,
    "conversa_id" UUID NOT NULL,
    "papel" "PapelMensagemTutor" NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_tutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversas_tutor_user_id_atualizado_em_idx" ON "conversas_tutor"("user_id", "atualizado_em" DESC);

-- CreateIndex
CREATE INDEX "mensagens_tutor_conversa_id_idx" ON "mensagens_tutor"("conversa_id");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_tutor_conversa_id_ordem_key" ON "mensagens_tutor"("conversa_id", "ordem");

-- AddForeignKey
ALTER TABLE "conversas_tutor" ADD CONSTRAINT "conversas_tutor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_tutor" ADD CONSTRAINT "mensagens_tutor_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas_tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

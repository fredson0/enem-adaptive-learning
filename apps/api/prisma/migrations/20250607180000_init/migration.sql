-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('ALUNO', 'PROFESSOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "NivelAluno" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');

-- CreateEnum
CREATE TYPE "PlanoTipo" AS ENUM ('GRATUITO', 'APOIO');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "foto_url" VARCHAR(500),
    "role" "RoleUsuario" NOT NULL DEFAULT 'ALUNO',
    "google_sub" VARCHAR(255),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_aluno" (
    "user_id" UUID NOT NULL,
    "curso_objetivo" VARCHAR(200),
    "tempo_diario_minutos" INTEGER NOT NULL DEFAULT 120,
    "nivel_atual" "NivelAluno" NOT NULL DEFAULT 'INICIANTE',
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "perfis_aluno_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "planos_assinatura" (
    "user_id" UUID NOT NULL,
    "tipo" "PlanoTipo" NOT NULL DEFAULT 'GRATUITO',
    "tokens_diarios" INTEGER NOT NULL DEFAULT 10,
    "mercado_pago_sub_id" VARCHAR(120),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "planos_assinatura_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "proficiencias_area" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "area" VARCHAR(80) NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_questoes" INTEGER NOT NULL DEFAULT 0,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "proficiencias_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uso_tokens_ia" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "consumo" INTEGER NOT NULL DEFAULT 0,
    "limite" INTEGER NOT NULL DEFAULT 10,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "uso_tokens_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "chave" VARCHAR(255) NOT NULL,
    "user_id" UUID,
    "endpoint" VARCHAR(120) NOT NULL,
    "request_hash" VARCHAR(64),
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
    "response" JSONB,
    "http_status" INTEGER,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_google_sub_key" ON "usuarios"("google_sub");

-- CreateIndex
CREATE INDEX "usuarios_role_idx" ON "usuarios"("role");

-- CreateIndex
CREATE INDEX "planos_assinatura_tipo_ativo_idx" ON "planos_assinatura"("tipo", "ativo");

-- CreateIndex
CREATE INDEX "proficiencias_area_user_id_idx" ON "proficiencias_area"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "proficiencias_area_user_id_area_key" ON "proficiencias_area"("user_id", "area");

-- CreateIndex
CREATE INDEX "uso_tokens_ia_user_id_data_idx" ON "uso_tokens_ia"("user_id", "data" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uso_tokens_ia_user_id_data_key" ON "uso_tokens_ia"("user_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_chave_key" ON "idempotency_keys"("chave");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE INDEX "idempotency_keys_user_id_endpoint_idx" ON "idempotency_keys"("user_id", "endpoint");

-- AddForeignKey
ALTER TABLE "perfis_aluno" ADD CONSTRAINT "perfis_aluno_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_assinatura" ADD CONSTRAINT "planos_assinatura_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proficiencias_area" ADD CONSTRAINT "proficiencias_area_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_tokens_ia" ADD CONSTRAINT "uso_tokens_ia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

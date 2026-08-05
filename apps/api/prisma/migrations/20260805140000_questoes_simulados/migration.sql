-- CreateEnum
CREATE TYPE "AreaEnem" AS ENUM ('LINGUAGENS', 'HUMANAS', 'NATUREZA', 'MATEMATICA');

-- CreateEnum
CREATE TYPE "StatusSimulado" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "questoes" (
    "id" UUID NOT NULL,
    "enem_dev_id" VARCHAR(120) NOT NULL,
    "ano" INTEGER NOT NULL,
    "area" "AreaEnem" NOT NULL,
    "indice" INTEGER NOT NULL,
    "disciplina" VARCHAR(80) NOT NULL,
    "contexto" TEXT NOT NULL,
    "introducao_alternativas" TEXT,
    "alternativas" JSONB NOT NULL,
    "gabarito" VARCHAR(1) NOT NULL,
    "imagem_url" VARCHAR(500),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulados" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "area" "AreaEnem",
    "total_questoes" INTEGER NOT NULL,
    "respondidas" INTEGER NOT NULL DEFAULT 0,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusSimulado" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "questao_atual_idx" INTEGER NOT NULL DEFAULT 0,
    "iniciado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" TIMESTAMPTZ(3),

    CONSTRAINT "simulados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulado_questoes" (
    "id" UUID NOT NULL,
    "simulado_id" UUID NOT NULL,
    "questao_id" UUID NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "simulado_questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_simulado" (
    "id" UUID NOT NULL,
    "simulado_id" UUID NOT NULL,
    "questao_id" UUID NOT NULL,
    "alternativa" VARCHAR(1) NOT NULL,
    "correto" BOOLEAN NOT NULL,
    "respondido_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_simulado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questoes_enem_dev_id_key" ON "questoes"("enem_dev_id");

-- CreateIndex
CREATE INDEX "questoes_area_ano_idx" ON "questoes"("area", "ano");

-- CreateIndex
CREATE INDEX "questoes_ano_idx" ON "questoes"("ano");

-- CreateIndex
CREATE INDEX "simulados_user_id_status_idx" ON "simulados"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "simulado_questoes_simulado_id_ordem_key" ON "simulado_questoes"("simulado_id", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "simulado_questoes_simulado_id_questao_id_key" ON "simulado_questoes"("simulado_id", "questao_id");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_simulado_simulado_id_questao_id_key" ON "respostas_simulado"("simulado_id", "questao_id");

-- AddForeignKey
ALTER TABLE "simulados" ADD CONSTRAINT "simulados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulado_questoes" ADD CONSTRAINT "simulado_questoes_simulado_id_fkey" FOREIGN KEY ("simulado_id") REFERENCES "simulados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulado_questoes" ADD CONSTRAINT "simulado_questoes_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_simulado" ADD CONSTRAINT "respostas_simulado_simulado_id_fkey" FOREIGN KEY ("simulado_id") REFERENCES "simulados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_simulado" ADD CONSTRAINT "respostas_simulado_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

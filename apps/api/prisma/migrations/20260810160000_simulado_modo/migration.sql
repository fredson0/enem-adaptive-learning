-- CreateEnum
CREATE TYPE "ModoSimulado" AS ENUM ('TREINO', 'MODALIDADE', 'CRONOMETRADO');

-- AlterTable
ALTER TABLE "simulados" ADD COLUMN "modo" "ModoSimulado" NOT NULL DEFAULT 'TREINO';
ALTER TABLE "simulados" ADD COLUMN "revelar_gabarito_imediato" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "simulados" ADD COLUMN "tempo_limite_segundos" INTEGER;

-- CreateIndex
CREATE INDEX "simulados_user_id_modo_status_idx" ON "simulados"("user_id", "modo", "status");

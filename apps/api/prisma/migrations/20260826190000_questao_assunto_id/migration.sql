-- AlterTable
ALTER TABLE "questoes" ADD COLUMN "assunto_id" VARCHAR(80);

-- CreateIndex
CREATE INDEX "questoes_assunto_id_idx" ON "questoes"("assunto_id");

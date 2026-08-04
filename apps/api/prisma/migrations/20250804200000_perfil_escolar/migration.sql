-- CreateEnum
CREATE TYPE "SerieEscolar" AS ENUM ('PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'NAO_ESTUDA');

-- CreateEnum
CREATE TYPE "TipoEnsinoMedio" AS ENUM ('PUBLICO', 'PRIVADO', 'MISTO');

-- AlterTable
ALTER TABLE "perfis_aluno" ADD COLUMN "serie_escolar" "SerieEscolar",
ADD COLUMN "tipo_ensino_medio" "TipoEnsinoMedio";

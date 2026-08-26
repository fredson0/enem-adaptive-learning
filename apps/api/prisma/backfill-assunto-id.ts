/**
 * Preenche assunto_id em questões que ainda não têm (inferência por palavras-chave).
 * Uso: npm run prisma:backfill-assunto -w apps/api
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { inferirAssuntoIdParaQuestao } from '../src/modules/metricas/core/application/helpers/cobertura-questoes.helper';

const BATCH_SIZE = 200;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL é obrigatório');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let atualizadas = 0;
  let semMatch = 0;
  let cursor: string | undefined;

  while (true) {
    const lote = await prisma.questao.findMany({
      where: { assuntoId: null },
      select: {
        id: true,
        area: true,
        disciplina: true,
        contexto: true,
        introducaoAlternativas: true,
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (lote.length === 0) break;

    for (const questao of lote) {
      const assuntoId = inferirAssuntoIdParaQuestao(questao);

      if (assuntoId) {
        await prisma.questao.update({
          where: { id: questao.id },
          data: { assuntoId },
        });
        atualizadas++;
      } else {
        semMatch++;
      }
    }

    cursor = lote[lote.length - 1]?.id;
    if (lote.length < BATCH_SIZE) break;
  }

  const comAssunto = await prisma.questao.count({
    where: { assuntoId: { not: null } },
  });
  const total = await prisma.questao.count();

  console.log(
    `\n✅ Backfill concluído: ${atualizadas} atualizadas, ${semMatch} sem match nesta execução`,
  );
  console.log(`   ${comAssunto}/${total} questões com assunto_id`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

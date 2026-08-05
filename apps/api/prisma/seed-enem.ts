/**
 * Seed de questões ENEM via api.enem.dev
 * Uso: npm run prisma:seed -w apps/api
 *
 * Variáveis opcionais:
 * - SEED_YEARS=2022,2023 (default)
 * - SEED_DISCIPLINES=matematica,linguagens,ciencias-humanas,ciencias-natureza
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AreaEnem, PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';

const API_BASE = 'https://api.enem.dev/v1';

const DISCIPLINE_TO_AREA: Record<string, AreaEnem> = {
  linguagens: AreaEnem.LINGUAGENS,
  'ciencias-humanas': AreaEnem.HUMANAS,
  'ciencias-natureza': AreaEnem.NATUREZA,
  matematica: AreaEnem.MATEMATICA,
};

type EnemAlternative = {
  letter: string;
  text: string;
  isCorrect: boolean;
};

type EnemQuestion = {
  index: number;
  discipline: string;
  year: number;
  context: string;
  alternativesIntroduction?: string;
  alternatives: EnemAlternative[];
  correctAlternative: string;
  files?: { src?: string }[];
};

function extractImageUrl(context: string, files?: EnemQuestion['files']): string | null {
  const fromFile = files?.find((f) => f.src)?.src;
  if (fromFile) return fromFile;

  const match = context.match(/!\[[^\]]*]\(([^)]+)\)/);
  return match?.[1] ?? null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchQuestions(year: number, discipline: string) {
  const all: EnemQuestion[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `${API_BASE}/exams/${year}/questions?discipline=${discipline}&limit=${limit}&offset=${offset}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`⚠️  ${year}/${discipline} offset ${offset}: HTTP ${res.status}`);
      break;
    }

    const data = (await res.json()) as {
      questions: EnemQuestion[];
      metadata?: { hasMore?: boolean; total?: number };
    };

    all.push(...(data.questions ?? []));

    if (!data.metadata?.hasMore || (data.questions?.length ?? 0) < limit) {
      break;
    }

    offset += limit;
    await sleep(300);
  }

  return all;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL é obrigatório');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const years = (process.env.SEED_YEARS ?? '2022,2023')
    .split(',')
    .map((y) => Number(y.trim()))
    .filter(Boolean);

  const disciplines = (
    process.env.SEED_DISCIPLINES ??
    'matematica,linguagens,ciencias-humanas,ciencias-natureza'
  )
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);

  let inseridas = 0;
  let ignoradas = 0;

  for (const year of years) {
    for (const discipline of disciplines) {
      const area = DISCIPLINE_TO_AREA[discipline];
      if (!area) {
        console.warn(`Disciplina desconhecida: ${discipline}`);
        continue;
      }

      console.log(`📥 Buscando ${discipline} ${year}...`);
      const questions = await fetchQuestions(year, discipline);
      console.log(`   ${questions.length} questões encontradas`);

      for (const q of questions) {
        const enemDevId = `${year}-${discipline}-${q.index}`;

        try {
          await prisma.questao.upsert({
            where: { enemDevId },
            create: {
              enemDevId,
              ano: year,
              area,
              indice: q.index,
              disciplina: discipline,
              contexto: q.context,
              introducaoAlternativas: q.alternativesIntroduction ?? null,
              alternativas: q.alternatives.map((alt) => ({
                letra: alt.letter,
                texto: alt.text,
              })),
              gabarito: q.correctAlternative,
              imagemUrl: extractImageUrl(q.context, q.files),
            },
            update: {},
          });
          inseridas++;
        } catch {
          ignoradas++;
        }
      }

      await sleep(400);
    }
  }

  const total = await prisma.questao.count();
  console.log(`\n✅ Seed concluído: ${inseridas} upserts, ${ignoradas} ignoradas, ${total} no banco`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

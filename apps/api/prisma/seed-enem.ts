/**
 * Seed de questões ENEM via api.enem.dev
 * Uso: npm run prisma:seed -w apps/api
 *
 * Variáveis opcionais:
 * - SEED_YEARS=2022,2023 (default)
 * - SEED_DISCIPLINES=matematica,linguagens,ciencias-humanas,ciencias-natureza
 *
 * Idempotente: enemDevId é único no banco — reexecutar não duplica.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AreaEnem, PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { inferirAssuntoIdParaQuestao } from '../src/modules/metricas/core/application/helpers/cobertura-questoes.helper';

const API_BASE = 'https://api.enem.dev/v1';
const PAGE_LIMIT = 50;
const PAGE_DELAY_MS = 900;
const BATCH_DELAY_MS = 700;
const MAX_RETRIES = 6;

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

type EnemPageResponse = {
  questions: EnemQuestion[];
  metadata?: { hasMore?: boolean; total?: number };
};

function buildEnemDevId(year: number, discipline: string, index: number) {
  return `${year}-${discipline}-${index}`;
}

function extractImageUrl(context: string | null | undefined, files?: EnemQuestion['files']): string | null {
  const fromFile = files?.find((f) => f.src)?.src;
  if (fromFile) return fromFile;

  if (!context) return null;

  const match = context.match(/!\[[^\]]*]\(([^)]+)\)/);
  return match?.[1] ?? null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<EnemPageResponse> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url);

    if (res.status === 429 || res.status >= 500) {
      const wait = 1500 * (attempt + 1);
      console.warn(`⏳ HTTP ${res.status} — nova tentativa em ${wait}ms...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return (await res.json()) as EnemPageResponse;
  }

  throw new Error(`HTTP 429/5xx após ${MAX_RETRIES} tentativas`);
}

async function fetchQuestions(year: number, discipline: string) {
  const byKey = new Map<string, EnemQuestion>();
  let offset = 0;

  while (true) {
    const url = `${API_BASE}/exams/${year}/questions?discipline=${discipline}&limit=${PAGE_LIMIT}&offset=${offset}`;

    try {
      const data = await fetchPage(url);
      const batch = data.questions ?? [];

      for (const q of batch) {
        byKey.set(buildEnemDevId(year, discipline, q.index), q);
      }

      if (!data.metadata?.hasMore || batch.length < PAGE_LIMIT) {
        break;
      }

      offset += PAGE_LIMIT;
      await sleep(PAGE_DELAY_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro desconhecido';
      console.warn(`⚠️  ${year}/${discipline} offset ${offset}: ${message}`);
      break;
    }
  }

  return [...byKey.values()];
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

  let novas = 0;
  let jaExistiam = 0;
  let erros = 0;

  for (const year of years) {
    for (const discipline of disciplines) {
      const area = DISCIPLINE_TO_AREA[discipline];
      if (!area) {
        console.warn(`Disciplina desconhecida: ${discipline}`);
        continue;
      }

      console.log(`📥 Buscando ${discipline} ${year}...`);
      const questions = await fetchQuestions(year, discipline);
      console.log(`   ${questions.length} questões únicas na API`);

      for (const q of questions) {
        const enemDevId = buildEnemDevId(year, discipline, q.index);

        try {
          const existente = await prisma.questao.findUnique({
            where: { enemDevId },
            select: { id: true, assuntoId: true },
          });

          const assuntoId = inferirAssuntoIdParaQuestao({
            area,
            disciplina: discipline,
            contexto: q.context ?? '',
            introducaoAlternativas: q.alternativesIntroduction ?? null,
          });

          if (existente) {
            if (!existente.assuntoId && assuntoId) {
              await prisma.questao.update({
                where: { id: existente.id },
                data: { assuntoId },
              });
            }
            jaExistiam++;
            continue;
          }

          await prisma.questao.create({
            data: {
              enemDevId,
              ano: year,
              area,
              assuntoId,
              indice: q.index,
              disciplina: discipline,
              contexto: q.context ?? '',
              introducaoAlternativas: q.alternativesIntroduction ?? null,
              alternativas: q.alternatives.map((alt) => ({
                letra: alt.letter,
                texto: alt.text,
              })),
              gabarito: q.correctAlternative,
              imagemUrl: extractImageUrl(q.context, q.files),
            },
          });
          novas++;
        } catch (error) {
          erros++;
          const message = error instanceof Error ? error.message : 'erro desconhecido';
          console.warn(`⚠️  Falha ao salvar ${enemDevId}: ${message}`);
        }
      }

      await sleep(BATCH_DELAY_MS);
    }
  }

  const total = await prisma.questao.count();
  console.log(
    `\n✅ Seed concluído: ${novas} novas, ${jaExistiam} já existiam (sem duplicar), ${erros} erros, ${total} no banco`,
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

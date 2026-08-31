import {
  ArrowLeftRight,
  Atom,
  AudioWaveform,
  Banknote,
  Beaker,
  Bird,
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  Box,
  Brain,
  Building2,
  ChartColumn,
  Cog,
  Dices,
  Divide,
  Dna,
  Drama,
  Earth,
  Factory,
  Feather,
  FileStack,
  FingerprintPattern,
  Flag,
  FlaskConical,
  FlaskRound,
  Gavel,
  GitBranch,
  Globe,
  Handshake,
  HeartPulse,
  Hexagon,
  Landmark,
  Languages,
  Leaf,
  ListChecks,
  Map,
  Megaphone,
  MessagesSquare,
  Microscope,
  Mountain,
  Network,
  Newspaper,
  Orbit,
  Palette,
  PenLine,
  PenTool,
  Percent,
  Quote,
  Repeat,
  Scale,
  ScanText,
  ScrollText,
  Ship,
  Shuffle,
  Sigma,
  SpellCheck,
  Spline,
  Swords,
  Thermometer,
  TrendingUp,
  Triangle,
  Type,
  Users,
  Waves,
  WholeWord,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Ícone por área, matéria e assunto da trilha.
 * Chave = `id` do catálogo (`trilha-catalogo.ts`) ou `areaSlug`.
 * A cor não vive aqui: o ícone herda `areaCor` via `currentColor`.
 */
const ICONES_TRILHA: Record<string, LucideIcon> = {
  // Áreas ENEM
  matematica: Sigma,
  linguagens: BookOpenText,
  humanas: Landmark,
  natureza: Atom,

  // Modalidades
  portugues: BookOpenText,
  ingles: Languages,
  espanhol: MessagesSquare,

  // Matemática
  "mat-funcoes": Spline,
  "mat-geometria-plana": Triangle,
  "mat-geometria-espacial": Box,
  "mat-trigonometria": Waves,
  "mat-probabilidade": Dices,
  "mat-estatistica": ChartColumn,
  "mat-porcentagem": Percent,
  "mat-razao": Divide,
  "mat-financeira": Banknote,
  "mat-combinatoria": Shuffle,
  "mat-progressoes": TrendingUp,

  // Língua Portuguesa
  "pt-interpretacao": ScanText,
  "pt-literatura": Feather,
  "pt-gramatica": SpellCheck,
  "pt-redacao": PenTool,
  "pt-generos": FileStack,
  "pt-figuras": Quote,
  "pt-artes": Palette,

  // Inglês
  "en-reading": BookOpenCheck,
  "en-vocabulary": Type,
  "en-grammar": ListChecks,
  "en-cognates": ArrowLeftRight,

  // Espanhol
  "es-comprension": BookOpen,
  "es-vocabulario": WholeWord,
  "es-gramatica": PenLine,
  "es-cognados": Repeat,

  // Ciências Humanas
  "hum-historia": ScrollText,
  "hum-hist-brasil-colonia": Ship,
  "hum-hist-brasil-republica": Flag,
  "hum-hist-mundo": Factory,
  "hum-hist-guerra-fria": Swords,
  "hum-geografia": Earth,
  "hum-geo-fisica": Mountain,
  "hum-geo-humana": Map,
  "hum-geo-urbanizacao": Building2,
  "hum-geo-geopolitica": Handshake,
  "hum-sociologia": Network,
  "hum-soc-cultura": Drama,
  "hum-soc-movimentos": Megaphone,
  "hum-filosofia": Brain,
  "hum-filo-etica": Scale,
  "hum-filo-politica": Gavel,
  "hum-atualidades": Newspaper,
  "hum-atual-mundo": Globe,
  "hum-antropologia": Users,
  "hum-antro-cultura": FingerprintPattern,

  // Ciências da Natureza
  "nat-fisica": Orbit,
  "nat-fis-mecanica": Cog,
  "nat-fis-termodinamica": Thermometer,
  "nat-fis-ondas": AudioWaveform,
  "nat-energia": Zap,
  "nat-quimica": FlaskConical,
  "nat-quim-geral": Beaker,
  "nat-quim-reacoes": FlaskRound,
  "nat-quim-organica": Hexagon,
  "nat-biologia": Dna,
  "nat-bio-celula": Microscope,
  "nat-ecologia": Leaf,
  "nat-genetica": GitBranch,
  "nat-corpo": HeartPulse,
  "nat-bio-evolucao": Bird,
};

/** Cor de cada área — mesma paleta usada em `areaCor` no catálogo. */
export const CORES_AREA: Record<string, string> = {
  matematica: "#60a5fa",
  linguagens: "#f472b6",
  humanas: "#fbbf24",
  natureza: "#34d399",
};

/** Ícone do item; cai para o da área quando o assunto não tem mapeamento próprio. */
export function obterIconeTrilha(id: string, areaSlug?: string): LucideIcon {
  const direto = ICONES_TRILHA[id];
  if (direto) return direto;

  const daArea = areaSlug ? ICONES_TRILHA[areaSlug] : undefined;
  return daArea ?? BookOpen;
}

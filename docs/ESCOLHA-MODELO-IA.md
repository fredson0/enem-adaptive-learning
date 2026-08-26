# Escolha do Modelo de IA — Tutor ENEM

> Qual API usar? Existe gratuito? O Gemini atende? Este documento responde e define a **estratégia oficial do TCC**.

---

## Resposta rápida (TL;DR)

| Pergunta | Resposta |
|----------|----------|
| **Texto (chat livre)?** | **NVIDIA NIM** `meta/llama-3.1-8b-instruct` → fallback Gemini |
| **Foto (vision)?** | **NVIDIA** `llama-3.2-11b-vision` → Groq → Gemini (último recurso) |
| **Existe API gratuita?** | **Sim** — NVIDIA NIM + Groq + Google AI Studio |
| **Gemini ainda é usado?** | **Sim** — fallback de texto e vision (não primário) |
| **Modelo antigo 1.5 / 2.0?** | **Não usar** — 2.0 Flash está em depreciação |

> **Estratégia atualizada (08/08/2026):** texto via NVIDIA; **fotos via NVIDIA Vision** para não esgotar cota Gemini. Gemini só entra se NVIDIA/Groq falharem.

---

## Roteamento por tipo de mensagem

| Tipo | Cadeia de fallback (`IaEngineRouter`) |
|------|----------------------------------------|
| **Só texto** | `IA_PROVIDER` (NVIDIA) → Gemini |
| **Texto exatas** (Matemática/Natureza) | Groq 70B* → NVIDIA exatas → Gemini exatas |
| **Com foto** | NVIDIA Vision → Groq Vision* → Gemini Vision |

\*Groq entra na cadeia se `GROQ_API_KEY` estiver configurada.

### Variáveis `.env`

```env
IA_PROVIDER=nvidia
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
NVIDIA_MODEL_EXATAS=meta/llama-3.3-70b-instruct
NVIDIA_VISION_MODEL=meta/llama-3.2-11b-vision-instruct

# Opcional — exatas via Groq (prioridade no router para Matemática/Natureza)
GROQ_API_KEY=sua_chave
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_EXATAS=llama-3.3-70b-versatile
GROQ_VISION_MODEL=llama-3.2-11b-vision-preview

# Fallback final
GEMINI_API_KEY=sua_chave
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_EXATAS=gemini-2.5-flash
```

## O que o tutor precisa fazer (requisitos)

| Tarefa | Dificuldade | Modelo mínimo |
|--------|-------------|---------------|
| Explicar por que alternativa B está errada | Média | Flash |
| Adaptar explicação ao nível (iniciante vs avançado) | Média | Flash |
| Responder em português brasileiro natural | Baixa | Flash |
| Resumir tema de questão ENEM | Média | Flash |
| **Interpretar foto de questão ou resolução (vision)** | Média | Llama 3.2 Vision (NVIDIA NIM) |
| Gerar trilha de estudo personalizada | Alta | Flash ou Pro |
| Corrigir redação ENEM (competências) | Muito alta | Pro (fase 2) |

**Conclusão:** Texto via **NVIDIA NIM**; fotos via **NVIDIA Llama 3.2 Vision** (Groq/Gemini como fallback). Erros de simulado continuam **sem vision** (enunciado já está no banco).

---

## Comparativo de APIs gratuitas (2026)

> Limites mudam — sempre confira a [página oficial de preços do Gemini](https://ai.google.dev/gemini-api/docs/pricing) antes do piloto.

| Provedor | Modelo free | Cartão? | Limite típico free | Português | Melhor para |
|----------|-------------|---------|-------------------|-----------|-------------|
| **NVIDIA NIM** ⭐ | `llama-3.1-8b-instruct` (texto) | Não | ~40 RPM | Bom | **Chat texto (primário)** |
| **NVIDIA NIM** ⭐ | `llama-3.2-11b-vision-instruct` | Não | ~40 RPM | Bom | **Foto no tutor (primário)** |
| **Groq** | `llama-3.2-11b-vision-preview` | Não | ~30 RPM | Bom | Fallback vision |
| **Google AI Studio** | `gemini-2.5-flash` | Não | ~250–1.500 req/dia* | Excelente | Fallback texto + vision |
| Google AI Studio | `gemini-2.5-flash-lite` | Não | ~1.000 req/dia* | Bom | Alto volume, respostas curtas |
| **Groq** | `llama-3.3-70b` | Não | ~1.000 req/dia | Bom | Velocidade extrema |
| OpenRouter | Vários free | Não | 50 req/dia (sem top-up) | Varia | Prototipagem multi-modelo |
| OpenAI | GPT (trial) | Sim | Créditos limitados | Excelente | Não recomendado para TCC free |
| Anthropic | Claude (trial) | Sim | Créditos limitados | Excelente | Não recomendado para TCC free |

\*Quotas variam por modelo e região. Monitore erros `429 Too Many Requests`.

---

## Por que Gemini 2.5 Flash é a escolha certa para este TCC

### ✅ Vantagens

1. **Free tier generoso** — desenvolvimento e piloto em escola sem cartão
2. **Português nativo** — crucial para alunos de escola pública
3. **Contexto longo** — cabe enunciado + alternativas + histórico do aluno
4. **Já está no stack** — `IaEnginePort` + adapter Gemini
5. **Custo pago baixo** se precisar escalar (~US$ 0,10/1M tokens input no Flash)
6. **Google AI Studio** — setup em 5 minutos, sem GCP complexo

### ⚠️ Limitações (e como mitigar)

| Limitação | Mitigação no projeto |
|-----------|---------------------|
| Cota free limitada | Rate limit por plano (`uso_tokens_ia`) |
| Pode "alucinar" em matemática | Prompt com gabarito + "não invente fórmulas" |
| Latência variável | Circuit breaker + loading no front |
| Dados usados p/ treino (free tier) | Não enviar PII; aviso na política de privacidade |
| Modelos antigos deprecados | Usar `gemini-2.5-flash`, nunca `2.0-flash` |
| Vision mais caro que texto | Mensagem com imagem = **2×** no rate limit; max 2 MB |

---

## Vision (upload de imagem no tutor)

**Primário:** NVIDIA `meta/llama-3.2-11b-vision-instruct` (mesma API key do texto).  
**Fallback:** Groq `llama-3.2-11b-vision-preview` → Gemini `gemini-2.5-flash`.

Casos de uso no ENEM+:

| Caso | Exemplo |
|------|---------|
| Foto de questão impressa | Aluno não achou no banco — tira foto do caderno |
| Foto da resolução | "Minha conta está certa?" |
| Print de atividade | Material de sala de aula |

**Storage:** imagens em **storage local (dev)** ou **Railway Bucket / R2 (prod)**. Ver [INFRAESTRUTURA-RAILWAY.md](./INFRAESTRUTURA-RAILWAY.md#object-storage-railway-bucket-produção-ou-r2-alternativa).

**Quando NÃO usar vision:** erro de simulado (enunciado já no Postgres), busca no banco de ~10k questões (futuro: OCR + match).

**Adapter:** `IaEngineRouter` detecta `imagem` no input e aciona a cadeia vision automaticamente.

---

## Estimativa de consumo (piloto em escola)

Cenário: **50 alunos**, cada um usa o tutor **3 vezes/dia**, ~800 tokens por explicação.

```
50 alunos × 3 explicações × 800 tokens = 120.000 tokens/dia
                                    ≈ 3,6M tokens/mês
```

| Modelo | Custo estimado/mês (pago) | Cabe no free tier? |
|--------|---------------------------|-------------------|
| gemini-2.5-flash | ~US$ 0,50–2,00 | Provavelmente sim com rate limit |
| gemini-2.5-pro | ~US$ 5–15 | Não para uso diário de 50 alunos |
| Groq Llama 3.3 | Grátis (com limites) | Sim, como fallback |

**Recomendação:** Rate limit de **5 explicações/dia** no plano gratuito + **30/dia** no plano apoio. Isso protege o orçamento e é coerente com o modelo freemium do TCC.

---

## Arquitetura hexagonal — trocar IA sem quebrar o core

```
ExplicarErroUseCase
       ↓
  IaEnginePort          ← interface no core (não sabe qual provedor)
       ↓
GeminiIaEngineAdapter   ← implementação primária (F3) — Google AI Studio
       ou
NvidiaIaEngineAdapter   ← alternativa (build.nvidia.com) — mesmo contrato
       ou
GroqIaEngineAdapter     ← fallback opcional (F3+)
```

**Variáveis de ambiente (F3):**

```env
IA_PROVIDER=nvidia          # nvidia | gemini (com fallback automático)
GEMINI_API_KEY=sua-chave
GEMINI_MODEL=gemini-2.5-flash

# NVIDIA NIM (build.nvidia.com) — free tier ~40 req/min
NVIDIA_API_KEY=sua-chave
NVIDIA_MODEL=meta/llama-3.1-8b-instruct

# Fallback opcional
GROQ_API_KEY=sua-chave
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Estratégia do projeto (atualizado 08/08/2026):** texto via **NVIDIA NIM**; **fotos via NVIDIA Llama 3.2 Vision** → Groq Vision → Gemini. Rate limit (`uso_tokens_ia`) no backend; mensagem com imagem = **2×** tokens.

O Use Case **nunca** importa SDK do Gemini. Só chama:

```typescript
// esqueleto — você implementará na F3
interface IaEnginePort {
  explicarErro(contexto: ContextoQuestao): Promise<string>;
}
```

---

## Roadmap de IA por fase

| Fase | Entrega IA | Modelo |
|------|-----------|--------|
| **F3** | Explicar erro pós-simulado | `gemini-2.5-flash` |
| **F3** | Chat com upload de imagem (vision) | NVIDIA Llama 3.2 Vision (+ fallback) |
| **F3** | Rate limit + contador tokens | — |
| **F4** | Resumo de tema fraco | `gemini-2.5-flash` |
| **F5+** | Correção de redação (opcional) | `gemini-2.5-pro` (pago) |

---

## Alternativas se Gemini não atender

| Cenário | Alternativa | Esforço |
|---------|-------------|---------|
| Free tier muito restrito | Groq (Llama 3.3) via segundo adapter | Baixo — só novo adapter |
| Qualidade insuficiente em exatas | Prompt engineering + few-shot com exemplos ENEM | Médio |
| Precisa raciocínio profundo | `gemini-2.5-pro` só para recurso premium | Baixo — trocar model string |
| Custo alto em produção | `gemini-2.5-flash-lite` para respostas curtas | Baixo |
| Privacidade total | Ollama local (Llama) — fora do escopo TCC cloud | Alto |

---

## Como obter a API key (grátis)

### Google AI Studio (recomendado)

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Login com conta Google
3. **Get API Key** → criar chave
4. Colar em `GEMINI_API_KEY` no `.env`

### Groq (fallback opcional)

1. Acesse [console.groq.com](https://console.groq.com)
2. Criar API key (sem cartão)
3. Colar em `GROQ_API_KEY`

---

## Prompt do tutor (diretriz para F3)

Estrutura sugerida para `ExplicarErroUseCase`:

```
Você é um tutor de ENEM paciente e didático.
Nível do aluno: {nivelAtual}
Área: {area}
Enunciado: {enunciado}
Alternativa marcada: {alternativaAluno}
Gabarito: {gabarito}

Explique por que a alternativa está errada em até 3 parágrafos.
Use linguagem simples. Não invente informações fora do enunciado.
```

---

## Veredito final

> **Use Gemini 2.5 Flash como motor principal.** É gratuito para desenvolvimento, excelente em português, barato se precisar pagar, e se encaixa perfeitamente na arquitetura hexagonal via `IaEnginePort`.

O Gemini **atende** o TCC. O que define sucesso não é o modelo — é o **rate limiting**, os **prompts bem feitos** e a **experiência pedagógica** ao redor da IA.

---

## Referências

- [Gemini API Pricing (oficial)](https://ai.google.dev/gemini-api/docs/pricing)
- [Google AI Studio](https://aistudio.google.com)
- [Groq Console](https://console.groq.com)
- [Cronograma F3 — IA](./CRONOGRAMA-IMPLEMENTACAO.md#fase-3--ia-e-monetização-semanas-10-13)
- [Conceitos — Rate Limiting](./CONCEITOS-SEGURANCA-E-PERFORMANCE.md#8-rate-limiting-dinâmico)

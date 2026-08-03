# Escolha do Modelo de IA — Tutor ENEM

> Qual API usar? Existe gratuito? O Gemini atende? Este documento responde e define a **estratégia oficial do TCC**.

---

## Resposta rápida (TL;DR)

| Pergunta | Resposta |
|----------|----------|
| **Qual modelo usar?** | **`gemini-2.5-flash`** (primário) |
| **Existe API gratuita?** | **Sim** — Google AI Studio, sem cartão |
| **Gemini atende o TCC?** | **Sim** — explicar erros, adaptar linguagem, português BR |
| **E se estourar o free tier?** | Rate limit no app + plano pago barato ou fallback Groq |
| **Modelo antigo 1.5 / 2.0?** | **Não usar** — 2.0 Flash está em depreciação |

---

## O que o tutor precisa fazer (requisitos)

| Tarefa | Dificuldade | Modelo mínimo |
|--------|-------------|---------------|
| Explicar por que alternativa B está errada | Média | Flash |
| Adaptar explicação ao nível (iniciante vs avançado) | Média | Flash |
| Responder em português brasileiro natural | Baixa | Flash |
| Resumir tema de questão ENEM | Média | Flash |
| **Interpretar foto de questão ou resolução (vision)** | Média | Flash (multimodal) |
| Gerar trilha de estudo personalizada | Alta | Flash ou Pro |
| Corrigir redação ENEM (competências) | Muito alta | Pro (fase 2) |

**Conclusão:** Para o MVP do TCC (explicar erro + resumo + **foto no chat**), **Gemini 2.5 Flash é suficiente e recomendado.**

---

## Comparativo de APIs gratuitas (2026)

> Limites mudam — sempre confira a [página oficial de preços do Gemini](https://ai.google.dev/gemini-api/docs/pricing) antes do piloto.

| Provedor | Modelo free | Cartão? | Limite típico free | Português | Melhor para |
|----------|-------------|---------|-------------------|-----------|-------------|
| **Google AI Studio** ⭐ | `gemini-2.5-flash` | Não | ~250–1.500 req/dia* | Excelente | **Tutor ENEM (escolha do projeto)** |
| Google AI Studio | `gemini-2.5-flash-lite` | Não | ~1.000 req/dia* | Bom | Alto volume, respostas curtas |
| Google AI Studio | `gemini-2.5-pro` | Não | ~50–100 req/dia* | Excelente | Raciocínio complexo (caro em escala) |
| **Groq** | `llama-3.3-70b` | Não | ~1.000 req/dia | Bom | Velocidade extrema (fallback) |
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

O Gemini 2.5 Flash aceita **texto + imagem** na mesma requisição. Casos de uso no ENEM+:

| Caso | Exemplo |
|------|---------|
| Foto de questão impressa | Aluno não achou no banco — tira foto do caderno |
| Foto da resolução | "Minha conta está certa?" |
| Print de atividade | Material de sala de aula |

**Storage:** imagens ficam no **Cloudflare R2** (não Railway). Ver [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md) e [INFRAESTRUTURA-RAILWAY.md](./INFRAESTRUTURA-RAILWAY.md#object-storage-cloudflare-r2).

**Adapter:**

```typescript
interface IaEnginePort {
  enviarMensagem(input: {
    texto: string;
    historico: Mensagem[];
    contextoQuestao?: ContextoQuestao;
    imagemUrl?: string; // URL assinada R2 → Gemini baixa e interpreta
  }): Promise<string>;
}
```

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
  IaEnginePort          ← interface no core (não sabe se é Gemini ou Groq)
       ↓
GeminiIaEngineAdapter   ← implementação primária (F3)
       ou
GroqIaEngineAdapter     ← fallback opcional (F3+)
```

**Variáveis de ambiente:**

```env
IA_PROVIDER=gemini          # gemini | groq
GEMINI_API_KEY=sua-chave
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=sua-chave      # opcional, fallback
GROQ_MODEL=llama-3.3-70b-versatile
```

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
| **F3** | Chat com upload de imagem (vision) | `gemini-2.5-flash` |
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

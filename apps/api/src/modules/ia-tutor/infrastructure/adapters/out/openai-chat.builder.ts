import {
  buildTutorSystemPrompt,
  buildVisionSystemPrompt,
} from '../../../core/application/helpers/tutor-prompts';
import type { EnviarMensagemIaInput } from '../../../core/application/ports/ia-engine.port';

export type OpenAiContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type OpenAiChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenAiContentPart[];
};

export function buildOpenAiChatMessages(
  input: EnviarMensagemIaInput,
): OpenAiChatMessage[] {
  const systemContent =
    input.systemPromptOverride ??
    (input.imagem
      ? buildVisionSystemPrompt(input.nivelAluno)
      : buildTutorSystemPrompt(
          input.nivelAluno,
          input.contextoMetricas,
          input.contextoTrilha,
          { areaEnem: input.areaEnem ?? null },
        ));

  const messages: OpenAiChatMessage[] = [
    {
      role: 'system',
      content: systemContent,
    },
  ];

  for (const msg of input.historico ?? []) {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.texto,
    });
  }

  if (input.imagem) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: input.texto },
        {
          type: 'image_url',
          image_url: {
            url: `data:${input.imagem.mimeType};base64,${input.imagem.base64}`,
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: input.texto });
  }

  return messages;
}

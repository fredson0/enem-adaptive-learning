import {
  parseOpenAiSseLine,
  stripThinkTags,
} from './openai-stream.helper';

describe('parseOpenAiSseLine', () => {
  it('extrai delta de chunk OpenAI', () => {
    const line =
      'data: {"choices":[{"delta":{"content":"Olá"}}]}';
    expect(parseOpenAiSseLine(line)).toEqual({ contentDelta: 'Olá' });
  });

  it('extrai reasoning_content de modelos gpt-oss / NVIDIA', () => {
    const line =
      'data: {"choices":[{"delta":{"reasoning_content":"Vou explicar seno"}}]}';
    expect(parseOpenAiSseLine(line)).toEqual({
      reasoningDelta: 'Vou explicar seno',
    });
  });

  it('ignora linhas vazias e heartbeat', () => {
    expect(parseOpenAiSseLine('')).toBeNull();
    expect(parseOpenAiSseLine(': ping')).toBeNull();
  });

  it('detecta fim [DONE]', () => {
    expect(parseOpenAiSseLine('data: [DONE]')).toEqual({ done: true });
  });
});

describe('stripThinkTags', () => {
  it('remove raciocínio entre tags think', () => {
    expect(stripThinkTags('<think>raciocínio</think>\nResposta ao aluno')).toBe(
      'Resposta ao aluno',
    );
  });
});

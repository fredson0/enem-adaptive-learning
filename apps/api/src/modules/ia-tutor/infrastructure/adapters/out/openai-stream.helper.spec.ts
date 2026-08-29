import {
  parseOpenAiSseLine,
} from './openai-stream.helper';

describe('parseOpenAiSseLine', () => {
  it('extrai delta de chunk OpenAI', () => {
    const line =
      'data: {"choices":[{"delta":{"content":"Olá"}}]}';
    expect(parseOpenAiSseLine(line)).toEqual({ delta: 'Olá' });
  });

  it('ignora linhas vazias e heartbeat', () => {
    expect(parseOpenAiSseLine('')).toBeNull();
    expect(parseOpenAiSseLine(': ping')).toBeNull();
  });

  it('detecta fim [DONE]', () => {
    expect(parseOpenAiSseLine('data: [DONE]')).toEqual({ done: true });
  });
});

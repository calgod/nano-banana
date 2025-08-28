import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src';

// Mock the @google/genai module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor() {}
      get models() {
        return {
          generateContent: async ({ contents }) => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        data: 'iVBORw0KGgoAAAANSUhEUgAAAAUA', // truncated Base64
                        mimeType: 'image/png',
                      },
                    },
                  ],
                },
                finishReason: 'STOP',
              },
            ],
            modelVersion: 'gemini-2.5-flash-image-preview',
          }),
        };
      }
    },
  };
});

describe('Nano Banana Worker (mocked)', () => {
  const prompt = "A nano banana dish in a fancy restaurant";

  it('responds with HTML containing the image', async () => {
    const request = new Request(`http://example.com/?q=${encodeURIComponent(prompt)}`);
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    const text = await response.text();
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(text).toContain('<img src="data:image/png;base64,');
  });
});

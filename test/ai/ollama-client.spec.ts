import { expect,test } from '@playwright/test';

import { OllamaClient } from '../../src/ai/ollama-client';

test.describe('Ollama Local LLM Client', () => {
    test('successfully generates completion from local ollama instance', async () => {
        const client = new OllamaClient({
            baseUrl: 'http://localhost:11434',
            model: 'llama3.2:3b'
        });

        const prompt = 'Respond with exact text: READY_FOR_TESTING';
        const response = await client.generate(prompt);
        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(0);
    });
});

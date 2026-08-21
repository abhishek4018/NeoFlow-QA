export interface OllamaConfig {
    baseUrl?: string;
    model?: string;
}

export class OllamaClient {
    private baseUrl: string;
    private model: string;

    constructor(config: OllamaConfig = {}) {
        this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = config.model || process.env.OLLAMA_MODEL || 'llama3.2:3b';
    }

    public async generate(prompt: string, systemPrompt?: string): Promise<string> {
        const endpoint = `${this.baseUrl.replace(/\/$/, '')}/api/generate`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
                system: systemPrompt,
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ollama generate failed (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as { response: string };
        return data.response;
    }
}

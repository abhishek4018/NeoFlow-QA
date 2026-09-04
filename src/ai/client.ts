import { VertexAI } from '@google-cloud/vertexai';
import OpenAI from 'openai';

import { AIProvider, CompletionOptions, HealedLocatorResult, VisionHealingOptions } from './types';

export function resolveAIProvider(): AIProvider {
  const envProvider = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (envProvider === 'hermes') {
    return 'hermes';
  }
  return 'vertex';
}

let vertexClientInstance: VertexAI | null = null;
let hermesClientInstance: OpenAI | null = null;

function getVertexClient(): VertexAI {
  if (!vertexClientInstance) {
    const project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'default-project';
    const location = process.env.GCP_REGION || 'us-central1';
    vertexClientInstance = new VertexAI({ project, location });
  }
  return vertexClientInstance;
}

function getHermesClient(): OpenAI {
  if (!hermesClientInstance) {
    const baseURL = process.env.HERMES_BASE_URL || 'http://localhost:8000/v1';
    const apiKey = process.env.HERMES_API_KEY || 'hermes';
    hermesClientInstance = new OpenAI({ baseURL, apiKey });
  }
  return hermesClientInstance;
}

/**
 * Universal text/code completion across Vertex AI and Hermes
 */
export async function generateCompletion(options: CompletionOptions): Promise<string> {
  const provider = resolveAIProvider();
  const temperature = options.temperature ?? 0.1;

  if (provider === 'vertex') {
    const vertex = getVertexClient();
    const modelName = options.modelType === 'reasoning'
      ? (process.env.VERTEX_REASONING_MODEL || 'gemini-1.5-pro-preview-0409')
      : (process.env.VERTEX_FAST_MODEL || 'gemini-1.5-flash-preview-0514');

    const model = vertex.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature }
    });

    const systemInstruction = options.systemPrompt ? { role: 'system', parts: [{ text: options.systemPrompt }] } : undefined;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: options.userPrompt }] }],
      ...(systemInstruction ? { systemInstruction } : {})
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  } else {
    const hermes = getHermesClient();
    const modelName = options.modelType === 'reasoning'
      ? (process.env.HERMES_REASONING_MODEL || 'NousResearch/Hermes-3-Llama-3.1-70B')
      : (process.env.HERMES_FAST_MODEL || 'NousResearch/Hermes-3-Llama-3.1-8B');

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.userPrompt });

    const completion = await hermes.chat.completions.create({
      model: modelName,
      messages,
      temperature
    });

    return completion.choices[0]?.message?.content || '';
  }
}

/**
 * Multimodal Visual & Semantic Failure Healer
 */
export async function healLocatorWithVision(options: VisionHealingOptions): Promise<HealedLocatorResult> {
  const provider = resolveAIProvider();
  const prompt = `
You are a Serenity/JS Screenplay Pattern Failure Healer.
A test step failed with the following error:
Error: ${options.errorMessage}
Current Broken Selector: ${options.currentSelector}

DOM Snapshot:
\`\`\`html
${options.domSnippet}
\`\`\`

Analyze the DOM tree (and screenshot if provided) to locate the intended interactive element.
Produce the most deterministic and stable selector (prefer ID, then role/aria-label, then semantic css).

Output ONLY valid JSON matching this schema without markdown code blocks:
{
  "pageElementName": "HealedElement",
  "selectorType": "id" | "role" | "css" | "xpath",
  "selectorValue": "selector string",
  "confidence": 0.95,
  "explanation": "why this selector was chosen"
}
`.trim();

  let responseText = '';

  try {
    if (provider === 'vertex' && options.screenshotBuffer) {
      const vertex = getVertexClient();
      const model = vertex.getGenerativeModel({
        model: process.env.VERTEX_REASONING_MODEL || 'gemini-1.5-pro-preview-0409',
        generationConfig: { temperature: 0.1 }
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: options.screenshotBuffer.toString('base64') } },
            { text: prompt }
          ]
        }]
      });

      responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      responseText = await generateCompletion({
        systemPrompt: 'You are an autonomous Serenity/JS BDD failure healer.',
        userPrompt: prompt,
        modelType: 'reasoning'
      });
    }

    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson) as HealedLocatorResult;
  } catch (err: any) {
    console.warn(`⚠️ [AI Client] Vision healing call failed: ${err.message}. Using heuristic fallback.`);

    // Heuristic DOM extraction fallback
    const idMatch = options.domSnippet.match(/id=["']([^"']+)["']/i);
    if (idMatch) {
      return {
        pageElementName: 'HealedElement',
        selectorType: 'id',
        selectorValue: idMatch[1],
        confidence: 0.8,
        explanation: 'Heuristic fallback: extracted element ID from DOM snapshot'
      };
    }

    return {
      pageElementName: 'HealedElement',
      selectorType: 'css',
      selectorValue: options.currentSelector,
      confidence: 0.5,
      explanation: 'Fallback locator due to API error'
    };
  }
}

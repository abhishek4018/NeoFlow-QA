export type AIProvider = 'vertex' | 'hermes';

export interface CompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  modelType?: 'fast' | 'reasoning';
}

export interface VisionHealingOptions {
  screenshotBuffer?: Buffer;
  domSnippet: string;
  errorMessage: string;
  currentSelector: string;
}

export interface HealedLocatorResult {
  pageElementName: string;
  selectorType: 'id' | 'role' | 'css' | 'xpath';
  selectorValue: string;
  confidence: number;
  explanation: string;
}

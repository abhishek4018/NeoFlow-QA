export interface CareConfig {
  targetUrl: string;
  allowedDomains: string[];
  depthLimit: number;
  safetyLevel: 'safe_read_only' | 'full_crud';
  maxActionsPerFlow?: number;
}

export interface DiscoveredAction {
  type: 'navigate' | 'click' | 'fill' | 'select';
  selector: string;
  role?: string;
  name?: string;
  value?: string;
  description: string;
}

export interface DiscoveredFlowTrace {
  flowName: string;
  entryUrl: string;
  pageTitle: string;
  actions: DiscoveredAction[];
  expectedOutcome: string;
}

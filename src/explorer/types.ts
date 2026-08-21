export interface InteractiveElementAction {
    elementTag: string;
    actionType: 'click' | 'fill' | 'select' | 'submit';
    selector: string;
    label: string;
    targetUrl?: string;
    inputType?: string;
}

export interface CrawlResult {
    url: string;
    title: string;
    routePath: string;
    actionsDiscovered: InteractiveElementAction[];
    internalLinks: string[];
}

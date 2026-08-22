export interface InteractiveElementAction {
    elementTag: string;
    actionType: 'click' | 'fill' | 'select' | 'submit';
    selector: string;
    label: string;
    targetUrl?: string;
    inputType?: string;
}

export interface PageInventoryItem {
    elementType: 'Heading' | 'Button' | 'Link' | 'Input' | 'Textarea';
    identifier: string;
    targetRole?: string;
    selector?: string;
}

export interface PageElementInventory {
    headings: string[];
    buttons: string[];
    links: string[];
    inputs: string[];
    items: PageInventoryItem[];
}

export interface CrawlResult {
    url: string;
    title: string;
    routePath: string;
    actionsDiscovered: InteractiveElementAction[];
    internalLinks: string[];
    inventory?: PageElementInventory;
}

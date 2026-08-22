import { Duration,Wait } from '@serenity-js/core';
import { By, isVisible, PageElement } from '@serenity-js/web';

/**
 * Waits for an element matching the given XPath to become visible on the page.
 * @param xpath The XPath expression to match the element
 * @param timeoutSeconds Optional timeout in seconds (default: 10)
 */
export function waitForElementWithXPath(xpath: string, timeoutSeconds = 10) {
    return Wait.upTo(Duration.ofSeconds(timeoutSeconds)).until(
        PageElement.located(By.xpath(xpath)),
        isVisible(),
    );
} 
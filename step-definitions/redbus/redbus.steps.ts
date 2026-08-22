import {When } from '@cucumber/cucumber';
import { actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

When('the user clicks the field with text {string}', async (param0: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    try {
        const pages = (playwright as any).browserContext?.pages() || [];
        if (pages.length > 0) {
            await pages[pages.length - 1].locator('div').filter({ hasText: new RegExp(`^${param0}$`) }).nth(1).click();
        }
    } catch {
        const page = (playwright as any).currentPage || (playwright as any).page;
        if (page) {
            await page.locator('div').filter({ hasText: new RegExp(`^${param0}$`) }).nth(1).click();
        }
    }
});

When('the user enters {string} into the combobox with name {string}', async (param0: string, param1: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    try {
        const pages = (playwright as any).browserContext?.pages() || [];
        if (pages.length > 0) {
            await pages[pages.length - 1].getByRole('combobox', { name: param1 }).fill(param0);
        }
    } catch {
        const page = (playwright as any).currentPage || (playwright as any).page;
        if (page) {
            await page.getByRole('combobox', { name: param1 }).fill(param0);
        }
    }
});

When('the user presses {string} in the combobox with name {string}', async (param0: string, param1: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    try {
        const pages = (playwright as any).browserContext?.pages() || [];
        if (pages.length > 0) {
            await pages[pages.length - 1].getByRole('combobox', { name: param1 }).press(param0);
        }
    } catch {
        const page = (playwright as any).currentPage || (playwright as any).page;
        if (page) {
            await page.getByRole('combobox', { name: param1 }).press(param0);
        }
    }
});

When('the user clicks the option with text {string}', async (param0: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    try {
        const pages = (playwright as any).browserContext?.pages() || [];
        if (pages.length > 0) {
            await pages[pages.length - 1].getByRole('option', { name: param0 }).click();
        }
    } catch {
        const page = (playwright as any).currentPage || (playwright as any).page;
        if (page) {
            await page.getByRole('option', { name: param0 }).click();
        }
    }
});

When('the user clicks the button with text {string}', async (param0: string) => {
    const actor = actorInTheSpotlight();
    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);
    try {
        const pages = (playwright as any).browserContext?.pages() || [];
        if (pages.length > 0) {
            await pages[pages.length - 1].getByRole('button', { name: param0 }).click();
        }
    } catch {
        const page = (playwright as any).currentPage || (playwright as any).page;
        if (page) {
            await page.getByRole('button', { name: param0 }).click();
        }
    }
});


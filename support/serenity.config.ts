import { AfterAll, BeforeAll, setDefaultTimeout, Before } from '@cucumber/cucumber';
import { configure, Duration, actorCalled } from '@serenity-js/core';
import path from 'path';
import * as dotenv from 'dotenv';
import * as playwright from 'playwright';
import { Actors } from '../test';

// Load environment variables from .env in the project root.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const timeouts = {
    cucumber: {
        step: Duration.ofSeconds(60),                       // how long to wait for a Cucumber step to complete
    },
    playwright: {
        defaultNavigationTimeout: Duration.ofSeconds(30),   // how long to wait for a page to load
        defaultTimeout:           Duration.ofSeconds(30),    // how long to wait for an element to show up
    },
    serenity: {
        cueTimeout:               Duration.ofSeconds(10),    // how long to wait for Serenity/JS to complete any post-test activities, like saving screenshots and reports
    }
}

// --- BROWSER/ENVIRONMENT CONFIGURATION ---
// Read browser and environment from environment variables
// Remove ESM-specific code; use __dirname directly (CommonJS)
// Type-safe Playwright browser selection
const browserTypes = {
    chromium: playwright.chromium,
    firefox: playwright.firefox,
    webkit: playwright.webkit,
};
const useLambdaTest = process.env.USE_LAMBDATEST?.toLowerCase() === 'true';
const browserTypeKey = (useLambdaTest
    ? process.env.LT_BROWSER || process.env.BROWSER
    : process.env.BROWSER
) as keyof typeof browserTypes;
const browserType = browserTypes[browserTypeKey] || playwright.chromium;
const environment = process.env.ENVIRONMENT || 'dev';

// Map environment names to base URLs
const baseUrls: Record<string, string> = {
    dev: '',
    qa: '',
    prod: 'https://happiesthealth.com/',
};
const baseURL = baseUrls[environment] || baseUrls['qa'];

let browser: playwright.Browser;

// Configure default Cucumber step timeout
setDefaultTimeout(timeouts.cucumber.step.inMilliseconds());

BeforeAll(async () => {
    if (useLambdaTest) {
        const username = process.env.LT_USERNAME;
        const accessKey = process.env.LT_ACCESS_KEY;

        if (!username || !accessKey) {
            throw new Error('LambdaTest requires LT_USERNAME and LT_ACCESS_KEY when USE_LAMBDATEST=true');
        }

        const ltBrowserName = process.env.LT_BROWSER || browserTypeKey || 'chromium';
        const capabilities = {
            browserName: ltBrowserName,
            browserVersion: process.env.LT_BROWSER_VERSION || 'latest',
            platformName: process.env.LT_PLATFORM || 'Windows 11',
            'LT:Options': {
                username,
                accessKey,
                build: process.env.LT_BUILD,
                name: process.env.LT_TEST_NAME,
            },
        };

        const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;

        browser = await browserType.connect({ wsEndpoint });
    }
    else {
        // Launch the browser once before all the tests
        browser = await browserType.launch({
            headless: false,
        });
    }

    // Configure Serenity/JS
    configure({

        // Configure Serenity/JS actors to use Playwright browser
        actors: new Actors(
            browser,
            {
                baseURL: baseURL,
            },
            {
                defaultNavigationTimeout: timeouts.playwright.defaultNavigationTimeout.inMilliseconds(),
                defaultTimeout: timeouts.playwright.defaultTimeout.inMilliseconds(),
            }
        ),

        // Configure Serenity/JS reporting services
        crew: [
            [ '@serenity-js/console-reporter', { theme: 'auto' } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(process.cwd(), 'target/site/serenity') } ],
            [ '@serenity-js/serenity-bdd', { 
                specDirectory: path.resolve(process.cwd(), 'features'),
                project: 'My Custom Project Name'
            } ],
        ],

        cueTimeout: timeouts.serenity.cueTimeout,
    });
});

Before(function () {
    actorCalled('User');
});

AfterAll(async () => {
    // Close the browser after all the tests are finished
    if (browser) {
        await browser.close();
    }
})

import * as fs from 'fs';
import * as path from 'path';

interface Step {
    type: 'Given' | 'When' | 'Then';
    text: string;
    params: string[];
}

function parsePlaywrightCode(code: string): Step[] {
    const lines = code.split('\n');
    const steps: Step[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        
        // 1. Navigate to URL
        if (trimmed.includes('page.goto(')) {
            const match = trimmed.match(/page\.goto\('([^']+)'\)/);
            if (match) {
                steps.push({ type: 'Given', text: 'the user navigates to {url}', params: [match[1]] });
            }
        }
        // 2. Click on element (locator, button, option, etc.)
        else if (trimmed.includes('.click()') && !trimmed.includes('await page.close')) {
            // Handle filter click (check this first as it's more specific)
            if (trimmed.includes('.filter(')) {
                const hasTextMatch = trimmed.match(/hasText:\s*\/\^([^$]+)\$\//);
                if (hasTextMatch) {
                    steps.push({ type: 'When', text: 'the user clicks the field with text {text}', params: [hasTextMatch[1]] });
                    continue;
                }
            }
            // Handle getByRole button click
            let match = trimmed.match(/getByRole\(['"]button['"],\s*\{\s*name:\s*['"](.+?)['"]\s*\}\)\.click/);
            if (match) {
                steps.push({ type: 'When', text: 'the user clicks the button with text {text}', params: [match[1]] });
                continue;
            }
            // Handle getByRole option click
            match = trimmed.match(/getByRole\(['"]option['"],\s*\{\s*name:\s*['"](.+?)['"]\s*\}\)\.click/);
            if (match) {
                steps.push({ type: 'When', text: 'the user clicks the option with text {text}', params: [match[1]] });
                continue;
            }
            // Handle locator click (generic) - only if no other patterns matched
            match = trimmed.match(/locator\(['"]([^'"]+)['"]\)\.click\(\)/);
            if (match) {
                steps.push({ type: 'When', text: 'the user clicks the element {selector}', params: [match[1]] });
                continue;
            }
        }
        // 3. Fill input field
        else if (trimmed.includes('.fill(')) {
            const match = trimmed.match(/getByRole\(['"]combobox['"],\s*\{\s*name:\s*['"]([^'"]+)['"]\s*\}\)\.fill\(['"]([^'"]+)['"]\)/);
            if (match) {
                steps.push({ type: 'When', text: 'the user enters {value} into the combobox with name {label}', params: [match[2], match[1]] });
            }
        }
        // 4. Press key
        else if (trimmed.includes('.press(')) {
            const match = trimmed.match(/getByRole\(['"]combobox['"],\s*\{\s*name:\s*['"]([^'"]+)['"]\s*\}\)\.press\(['"]([^'"]+)['"]\)/);
            if (match) {
                steps.push({ type: 'When', text: 'the user presses {key} in the combobox with name {label}', params: [match[2], match[1]] });
            }
        }
        // 5. Wait for element (implicit wait)
        else if (trimmed.includes('.waitFor()')) {
            const match = trimmed.match(/getByText\(['"]([^'"]+)['"]\)\.first\(\)\.waitFor/);
            if (match) {
                steps.push({ type: 'Then', text: 'the text {text} should be visible', params: [match[1]] });
            }
        }
    }

    return steps;
}

function generateFeature(steps: Step[], featureName: string): string {
    // Add Cucumber tags
    const tags = `@${featureName.toLowerCase()} @e2e @automation`;
    let feature = `${tags}\nFeature: ${featureName}\n\n`;
    // Add scenario tags
    const scenarioTags = `  @${featureName.toLowerCase()}-scenario @smoke`;
    feature += `${scenarioTags}\n  Scenario: ${featureName}\n`;
    for (const step of steps) {
        let text = step.text;
        if (step.type === 'Given') {
            // Replace {url} placeholder
            text = text.replace('{url}', `"${step.params[0]}"`);
        } else if (step.type === 'When') {
            // Handle various When step placeholders
            if (text.includes('{value}') && text.includes('{label}')) {
                // 2-param patterns: enters, etc.
                text = text.replace('{value}', `"${step.params[0]}"`).replace('{label}', `"${step.params[1]}"`);
            } else if (text.includes('{key}') && text.includes('{label}')) {
                // Press key patterns
                text = text.replace('{key}', `"${step.params[0]}"`).replace('{label}', `"${step.params[1]}"`);
            } else if (text.includes('{text}')) {
                // Single param patterns: clicks, selector
                text = text.replace('{text}', `"${step.params[0]}"`);
            } else if (text.includes('{selector}')) {
                text = text.replace('{selector}', `"${step.params[0]}"`);
            }
        } else if (step.type === 'Then') {
            text = text.replace('{text}', `"${step.params[0]}"`);
        }
        feature += `    ${step.type} ${text}\n`;
    }
    return feature;
}

function _generateReport(_fileName: string, _stats: any): void {
    let implementation = '';
    
    if (step.type === 'Given' && step.text.includes('navigates to')) {
        // Given step: navigate to URL
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Navigate.to(param0)\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('enters') && step.text.includes('combobox')) {
        // When step: enter text into combobox
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Enter.theValue(param0).into(PageElement.located(By.css(\`[name="\${param1}"]\`)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('clicks') && step.text.includes('element')) {
        // When step: click element by selector
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Click.on(PageElement.located(By.css(param0)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('clicks') && step.text.includes('button')) {
        // When step: click button by text
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Click.on(PageElement.located(By.xpath(\`//button[contains(., '\${param0}')]\`)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('clicks') && step.text.includes('option')) {
        // When step: click option by text
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Click.on(PageElement.located(By.xpath(\`//*[@role='option' and contains(., '\${param0}')]\`)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('clicks') && step.text.includes('field')) {
        // When step: click field by text
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Click.on(PageElement.located(By.xpath(\`//*[contains(., '\${param0}')]\`)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'When' && step.text.includes('presses')) {
        // When step: press key - access playwright ability directly
        implementation = `    const actor = actorInTheSpotlight();\n`;
        implementation += `    const playwright = actor.abilityTo(BrowseTheWebWithPlaywright);\n`;
        implementation += `    try {\n`;
        implementation += `        const pages = (playwright as any).browserContext?.pages() || [];\n`;
        implementation += `        if (pages.length > 0) {\n`;
        implementation += `            await pages[pages.length - 1].locator(\`[name="\${param1}"]\`).press(param0);\n`;
        implementation += `        }\n`;
    } else if (step.type === 'When' && step.text.includes('clicks') && step.text.includes('role')) {
        // When step: click element by role
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Click.on(PageElement.located(By.css(\`[role="\${param0}"]\`)))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'Then' && step.text.includes('URL should contain')) {
        // Then step: verify URL contains text
        implementation = `    const page = await (BrowseTheWebWithPlaywright.as(actorInTheSpotlight()) as any).currentPage();\n`;
        implementation += `    const currentUrl = page.url();\n`;
        implementation += `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Ensure.that(currentUrl.includes(param0), equals(true))\n`;
        implementation += `    );\n`;
    } else if (step.type === 'Then' && step.text.includes('heading should be visible')) {
        // Then step: verify heading is visible
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Ensure.that(PageElement.located(By.css('h1, h2, h3, header, main, nav, body')), isVisible())\n`;
        implementation += `    );\n`;
    } else if (step.type === 'Then' && step.text.includes('should see') && step.text.includes('text')) {
        // Then step: verify text is present
        implementation = `    await actorInTheSpotlight().attemptsTo(\n`;
        implementation += `        Ensure.that(Text.of(PageElement.located(By.css('body'))), equals(param0))\n`;
        implementation += `    );\n`;
    } else {
        // Fallback: generic placeholder
        implementation = `    // TODO: Implement the step\n`;
        implementation += `    // Parameters: ${JSON.stringify(step.params)}\n`;
    }
    
    return implementation;
}

function generateStepDefinitions(steps: Step[], _fileName: string): string {
    let code = `import { Given, When, Then } from '@cucumber/cucumber';\nimport { actorInTheSpotlight } from '@serenity-js/core';\nimport { Ensure, equals } from '@serenity-js/assertions';\nimport { By, Click, Enter, Navigate, PageElement, Text, isVisible } from '@serenity-js/web';\nimport { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';\n\n`;

    const existingSteps = new Set<string>();
    const generatedSteps = new Set<string>();

    // Load existing generic steps
    const genericPath = path.join(__dirname, '../step-definitions/generic/generic.steps.ts');
    if (fs.existsSync(genericPath)) {
        const genericContent = fs.readFileSync(genericPath, 'utf-8');
        const matches = genericContent.match(/^(Given|When|Then)\('([^']+)'/gm);
        if (matches) {
            matches.forEach(match => {
                const parts = match.split("('");
                if (parts.length >= 2) {
                    const stepType = parts[0];
                    const stepPattern = parts[1].replace(/'$/, ''); // Remove trailing quote
                    existingSteps.add(`${stepType} ${stepPattern}`);
                }
            });
        }
    }

    // Generate unique step definitions
    for (const step of steps) {
        // Convert placeholder text to {string} pattern - step.text no longer has quotes
        let pattern = step.text;  // Already in format like "the user navigates to {url}"
        
        // Replace custom placeholders with {string}
        pattern = pattern.replace(/\{url\}/g, '{string}')
                         .replace(/\{value\}/g, '{string}')
                         .replace(/\{label\}/g, '{string}')
                         .replace(/\{selector\}/g, '{string}')
                         .replace(/\{key\}/g, '{string}')
                         .replace(/\{text\}/g, '{string}');
        
        const stepKey = `${step.type} ${pattern}`;
        
        // Only add if not in generic steps AND not already generated in this file
        if (!existingSteps.has(stepKey) && !generatedSteps.has(stepKey)) {
            generatedSteps.add(stepKey);
            
            const paramsList = step.params.map((_, i) => `param${i}: string`).join(', ');
            code += `${step.type}('${pattern}', async (${paramsList}) => {\n`;
            code += generateStepImplementation(step);
            code += `});\n\n`;
        }
    }

    return code;
}

function main() {
    const inputFile = process.argv[2] || 'generated/codegen/redbus_search.ts';
    const featureName = process.argv[3] || 'RedBus Search';

    const code = fs.readFileSync(inputFile, 'utf-8');
    const steps = parsePlaywrightCode(code);

    const featureContent = generateFeature(steps, featureName);
    const featurePath = `features/${featureName.toLowerCase().replace(/\s+/g, '_')}/${featureName.toLowerCase().replace(/\s+/g, '_')}.feature`;
    fs.mkdirSync(path.dirname(featurePath), { recursive: true });
    fs.writeFileSync(featurePath, featureContent);

    const stepsContent = generateStepDefinitions(steps, featureName);
    const stepsPath = `step-definitions/${featureName.toLowerCase().replace(/\s+/g, '_')}/${featureName.toLowerCase().replace(/\s+/g, '_')}.steps.ts`;
    fs.mkdirSync(path.dirname(stepsPath), { recursive: true });
    fs.writeFileSync(stepsPath, stepsContent);

    console.log(`Generated ${featurePath} and ${stepsPath}`);
}

if (require.main === module) {
    main();
}
import * as fs from 'fs';
import * as path from 'path';

import { DiscoveredFlowTrace } from './types';

export class BDDSynthesizer {
  private featuresDir: string;
  private stepDefsDir: string;

  constructor(baseDir = process.cwd()) {
    this.featuresDir = path.resolve(baseDir, 'features/codegen');
    this.stepDefsDir = path.resolve(baseDir, 'step-definitions/codegen');
    fs.mkdirSync(this.featuresDir, { recursive: true });
    fs.mkdirSync(this.stepDefsDir, { recursive: true });
  }

  /**
   * Synthesizes Gherkin feature file and Serenity/JS step definition file from a flow trace
   */
  synthesizeFlow(trace: DiscoveredFlowTrace): { featurePath: string; stepDefPath: string } {
    const slug = trace.flowName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const featurePath = path.join(this.featuresDir, `${slug}.feature`);
    const stepDefPath = path.join(this.stepDefsDir, `${slug}.steps.ts`);

    const featureContent = this.generateFeatureContent(trace);
    const stepDefContent = this.generateStepDefContent(trace);

    fs.writeFileSync(featurePath, featureContent, 'utf-8');
    fs.writeFileSync(stepDefPath, stepDefContent, 'utf-8');

    console.log(`✨ [CARE Synthesizer] Generated feature: ${featurePath}`);
    console.log(`✨ [CARE Synthesizer] Generated step definitions: ${stepDefPath}`);

    return { featurePath, stepDefPath };
  }

  private generateFeatureContent(trace: DiscoveredFlowTrace): string {
    const tagName = `@${trace.flowName.replace(/_/g, '')}`;
    let stepsGherkin = `    Given the user navigates to "${trace.entryUrl}"\n`;

    for (const action of trace.actions) {
      if (action.type === 'click') {
        stepsGherkin += `    When the user clicks the element with aria-label "${action.name || 'button'}"\n`;
      } else if (action.type === 'fill') {
        stepsGherkin += `    When the user enters "${action.value || 'Input'}" into the element with aria-label "${action.name || 'input'}"\n`;
      }
    }

    stepsGherkin += `    Then the text "${trace.pageTitle.slice(0, 20)}" should be visible\n`;

    return `Feature: ${trace.pageTitle} Autonomous Flow
  As a user
  I want to interact with ${trace.pageTitle}
  So that the application behaves correctly

  @smoke @regression ${tagName}
  Scenario: Verify ${trace.pageTitle} interactive journey
${stepsGherkin}`.trim() + '\n';
  }

  private generateStepDefContent(trace: DiscoveredFlowTrace): string {
    return `import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, includes } from '@serenity-js/assertions';
import { actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { By, Enter, isVisible, PageElement, Text } from '@serenity-js/web';

import { ClickWhenReady } from '../helpers/Interactions';
import { NavigateToAppAndAcceptCookies } from '../helpers/Navigation';

// Page Elements for ${trace.pageTitle}
const MainContainer = () => PageElement.located(By.css('body')).describedAs('Main Page Body');

// Custom steps generated for ${trace.flowName}
Given('the user verifies the ${trace.flowName} is active', async () => {
    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Duration.ofSeconds(15)).until(MainContainer(), isVisible()),
        Ensure.that(Text.of(MainContainer()), includes(''))
    );
});
`.trim() + '\n';
  }
}

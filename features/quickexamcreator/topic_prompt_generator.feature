Feature: Topic Prompt Assessment Item Generation and Pedagogical Controls

  As an educator or test author
  I want to use Topic Prompt mode with Advanced Pedagogical Controls and sample topics
  So that I can synthesize assessment questions customized by target audience and Bloom's cognitive level

  @topic-prompt @codegen @regression
  Scenario: Generate assessment questions using Topic Prompt mode and pedagogical controls
    Given the user opens the Pariksha Public Page at "/public"
    When the user selects "Topic Prompt" mode
    And the user expands Advanced Pedagogical Controls
    And the user selects target audience "Undergraduate" and cognitive level "Apply"
    And the user selects or enters topic "Cell Biology Quiz"
    And the user switches to "Paste Text" mode
    And the user clicks sample material button "Abacus Math Paper"
    And the user clicks sample material button "Cell Biology Quiz"
    And the user clicks the "Extract & Generate Questions" button
    Then the generated questions results section should be displayed

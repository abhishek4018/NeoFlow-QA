Feature: Manual authoring flow on public page

  @manual-authoring @codegen @regression
  Scenario: User can open manual authoring and add a question
    Given the user navigates to "/public"
    When the user clicks the button "Manual Authoring"
    Then the authoring text "MANUAL QUESTION AUTHORING" should be visible
    Then the authoring text "1 QUESTION IN BLUEPRINT" should be visible

  @manual-authoring @codegen @regression
  Scenario: User can create a question and continue to the workspace dashboard
    Given the user navigates to "/public"
    When the user clicks the button "Manual Authoring"
    Then the authoring text "MANUAL QUESTION AUTHORING" should be visible
    Then the authoring text "1 QUESTION IN BLUEPRINT" should be visible
    When the user fills the question form with topic "General", stem "What is 2 + 2?", alternatives "3", "4", "5", "6", rationale "Because 2 + 2 equals 4"
    When the user clicks the button "Save to workspace"
    Then the authoring text "Save Your Assessment" should be visible
    And the button "Get Magic Link" should be visible

  @manual-authoring @codegen @e2e @regression
  Scenario: User can complete the end-to-end assessment lifecycle from question creation to result validation
    Given the user navigates to "/public"
    When the user clicks the button "Manual Authoring"
    Then the authoring text "MANUAL QUESTION AUTHORING" should be visible
    Then the authoring text "1 QUESTION IN BLUEPRINT" should be visible
    When the user fills the question form with topic "General", stem "What is 2 + 2?", alternatives "3", "4", "5", "6", rationale "Because 2 + 2 equals 4"
    When the user clicks the button "Save to workspace"
    Then the authoring text "Save Your Assessment" should be visible
    When the user enters "qa-e2e@example.com" into the email field
    And the user clicks the button "Get Magic Link"
    Then the authoring text "Magic Link Dispatched!" should be visible
    And the authoring text "Launch Creator Dashboard" should be visible
    When the user opens the creator dashboard from the magic link
    Then the authoring text "Assessment Dashboard" should be visible
    When the user approves the pending question from the dashboard
    Then the authoring text "QUESTION BANK" should be visible
    When the user creates an assessment from the approved question bank
    Then the authoring text "Question Bank" should be visible
    When the user takes the published assessment as a candidate
    Then the authoring text "Assessment Dashboard" should be visible
    When the user validates the result in the faculty dashboard
    Then the authoring text "Assessment Dashboard" should be visible

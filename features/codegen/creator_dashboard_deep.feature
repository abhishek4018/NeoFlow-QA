Feature: Deep Creator Dashboard Lifecycle and Export

  As an assessment author
  I want to leverage advanced dashboard capabilities like Explorer rendering, Claiming Permanent Accounts, and exporting analytics
  So that I have deep administrative control over my questions and performance data

  @dashboard-deep @codegen @regression @e2e
  Scenario: Validate Explorer rendering and Knowledge Graph
    Given the faculty opens the creator dashboard using a saved magic link token
    When the faculty navigates to the Explorer tab
    Then the DocumentExplorer list should display associated ingested files
    And the KnowledgeGraph should render without errors

  @dashboard-deep @codegen @regression @e2e
  Scenario: Validate Claim Permanent Account Modal
    Given the faculty opens the creator dashboard using a saved magic link token
    When the faculty clicks the Claim Permanent Account button
    And the faculty fills out the onboarding request form
    And the faculty submits the onboarding request
    Then a success message should confirm the onboarding request dispatch

  @dashboard-deep @codegen @regression @e2e @negative
  Scenario: Publish exam with strict configs and invalid email checks
    Given the faculty opens the creator dashboard using a saved magic link token
    And the faculty selects questions in the Question Bank tab
    When the faculty attempts to publish with invalid emails "bademail1, bademail2"
    Then an invalid email error should be displayed
    When the faculty attempts to publish with valid emails and strict time limits
    Then the publish modal should confirm success

  @dashboard-deep @codegen @regression @e2e
  Scenario: Export student results to CSV
    Given the faculty navigates to the results report for a published exam
    When the faculty clicks the Export CSV button
    Then a CSV file containing student analytics should be downloaded

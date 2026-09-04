Feature: Example Domain Autonomous Flow
  As a user
  I want to interact with Example Domain
  So that the application behaves correctly

  @smoke @regression @exampledomaininteractiveflow
  Scenario: Verify Example Domain interactive journey
    Given the user navigates to "https://example.com/"
    Then the text "Example Domain" should be visible

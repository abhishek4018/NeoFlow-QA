@contact @smoke @e2e
Feature: contact Flow

  Scenario: Validate contact Page
    Given the user navigates to the contact url
    When the main heading for contact should be visible
    And the contact element should be clickable
    Then the primary navigation link for contact should have the correct email address
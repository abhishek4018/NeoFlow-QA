@home @smoke @e2e
Feature: home Flow

  Scenario: Validate home Page
    Given the user navigates to the home url
    When the main heading for "Education Intelligence & Assessment" should be visible
    And the user clicks the primary navigation link for "Home"
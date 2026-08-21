@home @smoke @e2e
Feature: home Flow

  Scenario: Validate Home Page
    Given the user navigates to the home page
    Then the main hero heading should be visible
    When the user clicks on the Assess link
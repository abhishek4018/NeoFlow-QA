@privacy @quickexamcreator @vatra
Feature: privacy Flow

  Scenario: Validate privacy Page
    Given the user navigates to the privacy url
    When the main heading for privacy should be visible
    And the page title is "Privacy Policy & DPDP | Vatra Assess"
    Then the primary navigation link for privacy should be clickable
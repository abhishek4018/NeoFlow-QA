@terms @quickexamcreator @vatra
Feature: terms Flow

  Scenario: Validate terms Page
    Given the user navigates to the "Terms of Service | Vatra Assess" url
    When the main heading for "Terms of Service | Vatra Assess" is visible on the page
    Then the primary navigation link for "Vatra Assess" should be clickable and link to the correct URL
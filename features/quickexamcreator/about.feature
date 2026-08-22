@about @quickexamcreator @vatra
Feature: About Flow

  Scenario: Validate about Page
    Given the user navigates to the about url
    Then the main heading for about should be visible
    When the user clicks the primary navigation link for about
@home_guides @quickexamcreator @vatra
Feature: home_guides Flow

  Scenario: Validate home_guides Page
    Given the user navigates to "https://quickexamcreator.com"
    When the user clicks on "Guides"
    And the user clicks on "ASSESS"
    Then the page title should be "Vatra Assess | Education Intelligence & Assessment Platform"
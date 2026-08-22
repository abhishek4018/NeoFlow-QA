@home_assess @quickexamcreator @vatra
Feature: home_assess Flow

  Scenario: Validate home_assess Page
    Given the user navigates to "https://quickexamcreator.com"
    When the main heading for "Vatra Assess | Education Intelligence & Assessment" is displayed
    Then the primary navigation link for "ASSESS" should be clickable
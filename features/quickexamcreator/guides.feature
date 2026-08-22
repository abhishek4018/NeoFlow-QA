Feature: guides Flow

  Scenario Outline: Validate guides Page
    Given the user navigates to the guides url
    Then the main heading for guides should be visible with title "Vatra Assess | Intelligence Infrastructure for Education"
    When the user clicks the primary navigation link for guides
    Then the main heading for guides should be visible with title "Vatra Assess | Intelligence Infrastructure for Edu"
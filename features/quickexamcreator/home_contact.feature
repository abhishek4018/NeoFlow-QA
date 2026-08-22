Feature: home_contact Flow

  Scenario Outline: Validate home_contact User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for "Contact"
    Then the main heading should be visible with text containing "Vatra Assess | Education Intelligence & Assessment Platform"

  Examples:
    - "Contact"
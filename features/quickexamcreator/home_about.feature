Feature: home_about Flow

  Scenario Outline: Validate home_about User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for <LinkLabel>
    Then the main heading for <LinkLabel> should be visible

  Examples:
    - LinkLabel = About
    - LinkLabel = ASSESS
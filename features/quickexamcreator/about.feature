Feature: About Flow

  Scenario Outline: Validate about Page
    Given the user navigates to the about url
    Then the main heading for about should be visible
    When the user clicks the primary navigation link for about
    Examples:
      - label: ASSESS
        And then the user should click "ASSESS"
      - label: Home
        And then the user should skip "Home"
      - label: Guides
        And then the user should click "Guides"
      - label: About
        And then the user should click "About"
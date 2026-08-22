@home_about_us @quickexamcreator @vatra
Feature: home_about_us Flow

  Scenario: Validate home_about_us User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for About Us
    Then the main heading for About Us should be visible
    And the following key elements should be visible on the page:
      | Element Type | Identifier / Text                                   | Target Role |
      | Heading      | Infrastructure for Human Knowledge Evaluation       | h1          |
      | Heading      | Rooted in Psychometrics, Branching into Intelligence | h2          |
      | Heading      | The VATRA Modular Product Suite                     | h2          |
      | Heading      | Engineered for Every Educational Stakeholder        | h2          |
      | Heading      | Data Sovereignty & Encryption Standards             | h2          |
      | Heading      | For Educators                                       | h3          |
      | Heading      | For Students                                        | h3          |
      | Heading      | For Institutions                                    | h3          |
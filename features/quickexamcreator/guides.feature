@guides @quickexamcreator @vatra
Feature: Exam Guides Flow

  Scenario: Validate Exam Guides Structural Contract & Documentation
    Given the user navigates to the guides url
    Then the following key elements should be visible on the page:
      | Element Type | Identifier / Text                 | Target Role |
      | Heading      | Vatra Assess Master Documentation | h1          |
      | Navigation   | ASSESS                            | link        |
      | Navigation   | Contact                           | link        |
      | Navigation   | Privacy Policy                    | link        |
      | Navigation   | Terms of Service                  | link        |
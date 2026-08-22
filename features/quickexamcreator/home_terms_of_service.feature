@home_terms_of_service @quickexamcreator @vatra
Feature: home_terms_of_service Flow

  Scenario Outline: Validate home_terms_of_service User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for Terms of Service
    Then the main heading for Terms of Service should be visible
    And the following key elements should be visible on the page:
      | Element Type | Identifier / Text              | Target Role |
      | Heading      | Intelligence Infrastructurefor Education | h1         |
      | Heading      | The 3-Step Assessment Lifecycle | h2         |
      | Heading      | Ingest Syllabus or Notes       | h3         |
      | Heading      | Generate Bloom's Blueprints    | h3         |
      | Heading      | Score & Deliver Insights       | h3         |
      | Heading      | Everything You Need for Modern Assessment | h2         |
      | Heading      | Bloom's Taxonomy Blueprinting  | h3         |
      | Heading      | Automated Scoring Engine       | h3         |

    Examples:
      - "Terms of Service"
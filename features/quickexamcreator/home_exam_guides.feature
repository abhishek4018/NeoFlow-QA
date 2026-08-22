Feature: home_exam_guides Flow

  Scenario Outline: Validate home_exam_guides User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for <Element Type>
    Then the main heading for <Element Type> should be visible
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
      - Element Type = Exam Guides
      - Element Type = ASSESS
Feature: home_read_the_solo_founder_story_ro Flow

  Scenario Template: Validate home_read_the_solo_founder_story_ro User Journey
    Given the user navigates to the home url
    When the user clicks the primary navigation link for :string
    Then the main heading with text ":string" should be visible
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
      - actions: [ { label: 'Read the Solo Founder Story & Roadmap' }, { label: 'ASSESS' } ]
Feature: Vatra Assess | Education Intelligence & Assessment Flow

  @home @quickexamcreator @vatra
Scenario Outline: Validate home Page
    Given the user navigates to the home url
    Then the main heading for home should be visible
    When the user clicks the primary navigation link for home
    And the user confirms that they are on the correct page

  Scenario Outline: Click Primary Actions
    Given the user navigates to the home url
    And the following actions should be available:
      | elementTag | actionType | selector        |
      | a          | click       | //a[normalize-space()="ASSESS"] |
      | a          | click       | //a[normalize-space()="Guides"] |
    Then the user clicks on one of the primary actions
    And the main heading for home should be visible
@guides @smoke @e2e
Feature: guides Flow

  Scenario: Validate Guides Section
    Given I am on the guides homepage
    When I see "Vatra Assess | Intelligence Infrastructure for Education" on the page
    Then I should be able to click on "Guides"
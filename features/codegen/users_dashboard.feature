Feature: Users Dashboard
  As a user
  I want to access my dashboard using my email
  So that I can review and organize my assessment items

  @smoke @regression
  Scenario: Navigate to users dashboard with email
    Given I navigate to the quick exam creator homepage
    When I click on "Get Started"
    And I navigate to the "Dashboard"
    And I enter my email "ak@gm.com" and click "Open Dashboard"
    Then I should see the assessment dashboard loaded for "ak@gm.com"

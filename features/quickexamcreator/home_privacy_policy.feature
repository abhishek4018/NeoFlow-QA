Feature: home_privacy_policy Flow

  @home_privacy_policy @quickexamcreator @vatra
Scenario: Validate home_privacy_policy User Journey
  Given the user navigates to the home url
  When the user clicks the primary navigation link for Privacy Policy
  Then the main heading "Vatra Assess | Education Intelligence & Assessment" should be visible in title
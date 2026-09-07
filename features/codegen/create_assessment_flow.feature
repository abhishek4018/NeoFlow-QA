Feature: Vatra Assess | Education Intelligence & Assessment Platform Autonomous Flow
  As a user
  I want to interact with Vatra Assess | Education Intelligence & Assessment Platform
  So that the application behaves correctly

  @smoke @regression @createassessmentflow
  Scenario: Verify Vatra Assess | Education Intelligence & Assessment Platform interactive journey
    Given the user navigates to "https://quickexamcreator.com/"
    When the user enters "My First Automated Assessment" into the element with aria-label "Assessment Title"
    When the user clicks the element with aria-label "Create Assessment"
    Then the text "Vatra Assess | Educa" should be visible

Feature: Vatra Assess | Education Intelligence & Assessment Platform Autonomous Flow
  As a user
  I want to interact with Vatra Assess | Education Intelligence & Assessment Platform
  So that the application behaves correctly

  @smoke @regression @vatraassesseducationintelliinteractiveflow
  Scenario: Verify Vatra Assess | Education Intelligence & Assessment Platform interactive journey
    Given the user navigates to "https://quickexamcreator.com/"
    When the user enters "Sample Automated Input" into the element with aria-label "Your email address"
    When the user clicks the element with aria-label "Take the assessment"
    When the user clicks the element with aria-label "Flag"
    When the user clicks the element with aria-label "Mumbai"
    Then the text "Vatra Assess | Educa" should be visible

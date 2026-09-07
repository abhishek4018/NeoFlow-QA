Feature: QuickExamCreator Website Functionality

  @smoke
  Scenario: Verify homepage title
    Given the user navigates to "https://quickexamcreator.com/"
    Then the title should be "Vatra Assess | Education Intelligence & Assessment Platform"

Feature: Student Exam Edge Cases and Resilience

  As a student candidate
  I want my exam state to be preserved against accidental refreshes
  So that I do not lose my progress during a strict timed attempt

  @student-edge @codegen @regression @e2e
  Scenario: Student progress is preserved across page refreshes
    Given candidate navigates to the mock assessment link for edge cases
    When candidate registers for edge cases with first name "Neo Candidate"
    And candidate proceeds through guidelines
    And candidate answers 2 questions in the player
    And candidate reloads the page
    Then the previously selected 2 answers should remain pre-filled in the player
    And the time limit should continue correctly without resetting

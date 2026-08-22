Feature: Pariksha Assessment Scoring and Pedagogical Results

  As a student candidate taking an assessment in Pariksha
  I want to register, answer multiple question types, confirm pre-submission summary in the modal, and view my pedagogical results
  So that my assessment performance and scoring breakdown are recorded and displayed accurately

  @scoring @codegen
  Scenario: Student candidate registers, answers multi-type questions, confirms pre-submission decision modal, and views pedagogical results
    Given candidate navigates to the saved published assessment link
    When candidate registers with first name "Neo Candidate"
    And candidate proceeds through guidelines if prompted
    And candidate answers all questions of multiple types in the player
    And candidate confirms submission in the pre-submission decision modal
    Then candidate should see the student pedagogical results view

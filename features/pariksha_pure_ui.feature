Feature: Pariksha Assessment Engine Pure UI E2E Workflows

  As an assessment author and student candidate
  I want to generate questions, publish assessments, and complete test attempts via the UI
  So that the entire assessment lifecycle is validated end-to-end without backend injection

  @pure_ui @e2e @faculty
  Scenario: Faculty creates questions via AI Quick Generator and dispatches magic link
    Given Alex opens the Pariksha Public Landing page at "http://localhost:3000/public"
    When Alex enters source text into the Quick Generator textarea
    And Alex clicks the Generate Question Set button
    And Alex proceeds to the Workspace Dashboard
    And Alex requests a magic link for a fresh faculty email
    Then Alex extracts and saves the magic link token for the faculty session

  @pure_ui @e2e @faculty
  Scenario: Faculty opens creator dashboard via saved magic link token, approves question, and publishes assessment
    Given Alex opens the Faculty Creator Dashboard using the saved magic link token
    When Alex approves all generated questions in the Approval Queue
    And Alex opens the Publish Assessment modal from the Question Bank
    And Alex fills the assessment title "Algorithms Midterm Exam" and submits "Publish & Invite"
    Then Alex should extract and save the shareable public assessment link

  @pure_ui @e2e @student
  Scenario: Student candidate registers, completes newly created assessment attempt, and views pedagogical results
    Given a candidate navigates to the saved shareable exam link
    When the candidate enters first name "Alex Student" and clicks "Start Assessment"
    And the candidate agrees to the test guidelines
    And the candidate answers all questions in the player UI
    And the candidate confirms submission in the Pre-Submission Summary modal
    Then the candidate should see their final pedagogical score on the Results view

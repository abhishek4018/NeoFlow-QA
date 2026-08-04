Feature: Complete Pariksha Public Workflow Lifecycle

  As an assessment author and student candidate
  I want to generate questions via AI, approve and publish them via the creator dashboard, and complete the assessment as a candidate
  So that the entire public application lifecycle is verified end-to-end

  @public-complete-flow @codegen @e2e @scenario-1
  Scenario: Faculty generates questions via AI Quick Generator and dispatches magic link
    Given the faculty opens the Pariksha Public Workspace at "http://localhost:3000/public"
    When the user clicks sample material button "Cell Biology Quiz"
    And the faculty clicks the Generate Question Set button
    And the faculty proceeds to the Workspace Dashboard
    And the faculty requests a magic link for email "faculty-e2e@example.com"
    Then the faculty extracts and saves the magic link token

  @public-complete-flow @codegen @e2e @scenario-2
  Scenario: Faculty opens creator dashboard via saved magic link token, approves questions, and publishes assessment
    Given the faculty opens the creator dashboard using the saved magic link token
    Then the authoring text "Assessment Dashboard" should be visible
    When the faculty approves all pending questions in the Approval Queue
    And the faculty switches to the Question Bank tab
    And the faculty opens the Publish Assessment modal and submits title "Algorithms Midterm Exam"
    Then the faculty extracts and saves the shareable public assessment link

  @public-complete-flow @codegen @e2e @scenario-3
  Scenario: Student candidate completes newly published assessment attempt and views pedagogical results
    Given candidate navigates to the saved published assessment link
    When candidate registers with first name "Neo Candidate"
    And candidate proceeds through guidelines if prompted
    And candidate answers all questions of multiple types in the player
    And candidate confirms submission in the pre-submission decision modal
    Then candidate should see the student pedagogical results view

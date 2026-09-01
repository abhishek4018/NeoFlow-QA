Feature: Exam Admin Portal — Assessment Publishing, Monitoring & Psychometric Reports
  As an exam administrator
  I want to configure and publish assessments with marking profiles, monitor cohort attempts, and export psychometric reports
  So that the full exam administration lifecycle is validated end-to-end

  Background:
    Given an exam admin is logged in at "localhost:3000/login" with credentials "examadmin_01" / "adminpass"

  @examadmin @auth @smoke
  Scenario: Login with examadmin credentials shows EXAMADMIN role badge
    Given Alex navigates to the login page at "localhost:3000/login"
    When Alex enters username "examadmin_01" and password "adminpass" and submits
    Then Alex should see a role badge displaying "EXAMADMIN" in the navigation header

  @examadmin @publish @e2e
  Scenario: Publish assessment with time limit, pass threshold, and negative marking profile (+2/-0.5)
    Given Alex is on the Exam Admin assessment configuration page
    When Alex sets the assessment title to "Advanced Algorithms Certification"
    And Alex sets the duration to "60" minutes
    And Alex sets the pass threshold to "70" percent
    And Alex selects the negative marking profile with correct mark "+2" and incorrect penalty "-0.5"
    And Alex clicks "Publish & Invite"
    Then the assessment should be published successfully
    And a shareable candidate magic link should be generated and displayed

  @examadmin @access @regression
  Scenario: Generated candidate magic link is accessible and returns 200
    Given Alex has published an assessment and a candidate magic link has been generated
    When Alex navigates to the generated candidate magic link URL
    Then the page should respond with HTTP status 200
    And the candidate registration or assessment start screen should be visible

  @examadmin @monitoring @regression
  Scenario: Cohort monitoring — attempt statuses (In Progress, Completed) visible in dashboard
    Given Alex is on the Exam Admin cohort monitoring dashboard for an active assessment
    Then Alex should see a list of candidate attempt entries
    And at least one attempt should display status "In Progress"
    And at least one attempt should display status "Completed"

  @examadmin @reports @regression
  Scenario: Reports page loads with exam results and psychometric analytics (p-value, r-PBIS)
    Given Alex navigates to the reports page at "/reports"
    Then the reports page should load successfully
    And Alex should see exam result entries for the published assessment
    And each question row should display a p-value (difficulty index) column
    And each question row should display an r-PBIS (discrimination index) column

  @examadmin @export @regression
  Scenario: CSV export from results page — Export CSV button in top-right title area, no raw UUIDs in download
    Given Alex is on the exam results page for a completed assessment
    Then the "Export CSV" button should be visible in the top-right area of the title block
    When Alex clicks the "Export CSV" button
    Then a CSV file should be downloaded
    And the downloaded CSV should not contain raw UUID values in any column

  @examadmin @security @regression
  Scenario: ExamAdmin cannot access Reviewer-only approval queue (RBAC enforcement)
    Given Alex is authenticated as exam admin "examadmin_01"
    When Alex attempts to navigate to the Reviewer-only peer review approval queue route
    Then Alex should be redirected or shown an access-denied response
    And Alex should not see the "PublicApprovalQuestionCard" review queue content

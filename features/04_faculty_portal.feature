Feature: Faculty Portal — Vatra Assess Faculty Workspace

  As a faculty member on the Vatra Assess platform
  I want to log in, generate AI-powered questions, review and approve them, manage my library, and create assessments
  So that the complete faculty authoring lifecycle is validated end-to-end

  Background:
    Given Faculty member "faculty_01" navigates to the login page at "/login"
    And Faculty member "faculty_01" enters credentials username "faculty_01" and password "facultypass"
    And Faculty member "faculty_01" clicks the Sign In button
    Then Faculty member "faculty_01" is redirected to "/dashboard"

  # ---------------------------------------------------------------------------
  # Authentication & Session
  # ---------------------------------------------------------------------------

  @faculty @auth @smoke
  Scenario: Login with valid credentials redirects to Faculty Workspace dashboard
    Given Alex navigates to the login page at "/login"
    When Alex enters username "faculty_01" and password "facultypass"
    And Alex clicks the Sign In button
    Then Alex should be redirected to "/dashboard"
    And Alex should see the heading "Faculty Workspace"
    And Alex should see a welcome message containing "faculty_01"
    And the navigation bar should display links "Dashboard", "Review", "Create", and "Library"
    And the navigation bar should display the profile link "Faculty One FACULTY"
    And the navigation bar should display a "Logout" button
    And the Sign In button should not be visible in the navigation bar

  @faculty @auth @regression
  Scenario: Login with invalid credentials shows error message
    Given Alex navigates to the login page at "/login"
    When Alex enters username "faculty_01" and password "wrongpassword"
    And Alex clicks the Sign In button
    Then Alex should remain on the login page at "/login"
    And Alex should see a login error message indicating invalid credentials

  @faculty @auth @regression
  Scenario: Logout clears session and redirects to login page
    Given Alex is logged in and on the Faculty Workspace dashboard at "/dashboard"
    When Alex clicks the "Logout" button in the navigation bar
    Then Alex should be redirected to "/login"
    And the Sign In button should be visible on the login page

  @faculty @auth @security
  Scenario: Protected route /dashboard redirects to /login without auth token
    Given Alex is not authenticated and has no active session token
    When Alex navigates directly to the protected route "/dashboard"
    Then Alex should be redirected to "/login"
    And Alex should not see the "Faculty Workspace" heading

  # ---------------------------------------------------------------------------
  # Dashboard
  # ---------------------------------------------------------------------------

  @faculty @dashboard @regression
  Scenario: Faculty dashboard displays 5 quick-action cards as navigation links
    Given Alex is logged in and on the Faculty Workspace dashboard at "/dashboard"
    Then Alex should see 5 quick-action cards on the dashboard
    And the dashboard should contain a card "Review Center" linking to "/faculty/review"
    And the dashboard should contain a card "Upload Teaching Material" linking to "/faculty/upload"
    And the dashboard should contain a card "Create Assessment" linking to "/faculty/assessments/create"
    And the dashboard should contain a card "Assessment Library" linking to "/faculty/assessments"
    And the dashboard should contain a card "Knowledge Graph" linking to "/faculty/dashboard"
    And the dashboard should display a "Recent Activity" section labelled "LIVE UPDATES"
    And the "Recent Activity" section should show "No Recent Activity" for a fresh account

  # ---------------------------------------------------------------------------
  # Document Upload
  # ---------------------------------------------------------------------------

  @faculty @upload @e2e
  Scenario: Document upload — upload a PDF file and verify it appears in the generation scope selector
    Given Alex is logged in and navigates to the upload page at "/faculty/upload"
    When Alex uploads the PDF file "PNBApplication.pdf" via the document ingestion form
    And Alex waits for the upload confirmation message
    Then Alex navigates to the review page at "/faculty/review?tab=generate"
    And the document scope selector should contain the option "PNBApplication.pdf"

  # ---------------------------------------------------------------------------
  # AI Question Generation
  # ---------------------------------------------------------------------------

  @faculty @generation @e2e
  Scenario: AI generation from topic — enter topic, configure 5 question types, click Generate, verify pending queue populates
    Given Alex is logged in and navigates to the review page at "/faculty/review?tab=generate"
    When Alex enters the topic text "Banking Regulations in India" into the topic textarea
    And Alex selects "All Documents" from the document scope selector
    And Alex sets the number of questions spinbutton to "10"
    And Alex selects question type "MCQ_SINGLE" and clicks "ADD QUESTION TYPE"
    And Alex selects question type "MCQ_MULTIPLE" and clicks "ADD QUESTION TYPE"
    And Alex selects question type "TEXT_ENTRY" and clicks "ADD QUESTION TYPE"
    And Alex selects question type "INLINE_CHOICE" and clicks "ADD QUESTION TYPE"
    And Alex selects question type "NUMERIC_ENTRY" and clicks "ADD QUESTION TYPE"
    And Alex clicks the "GENERATE QUESTIONS" button
    Then Alex should see at least one question card appear in the Review tab pending queue
    And the Generate tab should still retain the topic text "Banking Regulations in India"

  @faculty @generation @regression
  Scenario Outline: All 5 question types available in the generation type selector
    Given Alex is logged in and navigates to the review page at "/faculty/review?tab=generate"
    Then the question type combobox should contain the option "<QuestionType>"

    Examples:
      | QuestionType  |
      | MCQ_SINGLE    |
      | MCQ_MULTIPLE  |
      | TEXT_ENTRY    |
      | INLINE_CHOICE |
      | NUMERIC_ENTRY |

  # ---------------------------------------------------------------------------
  # Review Center — Staging Queue
  # ---------------------------------------------------------------------------

  @faculty @review @regression
  Scenario: Review Center staging queue renders FacultyStagingQuestionCard with single-row metadata — no clipping
    Given Alex is logged in and navigates to the review page at "/faculty/review?tab=generate"
    And at least one question exists in the staging queue
    When Alex clicks the "Review" tab in the sidebar
    Then Alex should see at least one "FacultyStagingQuestionCard" in the staging queue
    And each card's metadata row should display the fields "QID", "Format", "Topic", "Difficulty", and "Cognitive" in a single flex row
    And no metadata field label or value should be visually clipped or overflow its container

  @faculty @review @e2e
  Scenario: Approve a question in staging queue — question moves to Library tab
    Given Alex is logged in and navigates to the review page at "/faculty/review?tab=generate"
    And at least one question exists in the staging queue on the Review tab
    When Alex clicks the "Review" tab in the sidebar
    And Alex clicks the approve action on the first question card in the staging queue
    Then the approved question should no longer appear in the staging queue
    When Alex clicks the "Library" tab in the sidebar
    Then the approved question should appear in the Library tab as a published question

  # ---------------------------------------------------------------------------
  # Library Tab
  # ---------------------------------------------------------------------------

  @faculty @library @regression
  Scenario: Library tab — topic filter input filters visible questions live
    Given Alex is logged in and navigates to the review page at "/faculty/review?tab=generate"
    And at least one published question exists in the Library
    When Alex clicks the "Library" tab in the sidebar
    Then Alex should see the "Filter by topic:" input field with a whitespace-nowrap pill style
    When Alex types a known topic keyword into the "Filter by topic:" input field
    Then only question cards matching the entered topic keyword should remain visible
    When Alex clears the "Filter by topic:" input field
    Then all published question cards should be visible again

  # ---------------------------------------------------------------------------
  # Assessment Creation
  # ---------------------------------------------------------------------------

  @faculty @create @e2e
  Scenario: Create Assessment — select questions, configure exam settings, publish successfully
    Given Alex is logged in and navigates to the assessment creation page at "/faculty/assessments/create"
    When Alex selects at least 3 questions from the master question bank
    And Alex fills in the assessment title "Banking Law Midterm 2026"
    And Alex configures the exam duration to "60" minutes
    And Alex clicks the publish or save assessment button
    Then Alex should be redirected to or see confirmation on the assessment library at "/faculty/assessments"
    And the newly created assessment "Banking Law Midterm 2026" should appear in the assessment library

  @faculty @library @regression
  Scenario: Assessment Library page lists existing assessments
    Given Alex is logged in and navigates to the assessment library at "/faculty/assessments"
    Then Alex should see a list of published assessments
    And each assessment entry should display a title and status

  # ---------------------------------------------------------------------------
  # Profile
  # ---------------------------------------------------------------------------

  @faculty @profile @regression
  Scenario: Profile page accessible from nav and shows faculty user data
    Given Alex is logged in and on the Faculty Workspace dashboard at "/dashboard"
    When Alex clicks the profile link "Faculty One FACULTY" in the navigation bar
    Then Alex should be navigated to "/profile"
    And the profile page should display the username "faculty_01"
    And the profile page should display the role "FACULTY"

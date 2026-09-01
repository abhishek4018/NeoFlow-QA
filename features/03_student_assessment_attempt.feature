Feature: Student Assessment Attempt — Vatra Assess Player
  As a student candidate
  I want to navigate, answer, flag, and submit a live assessment attempt via the Vatra Assess player
  So that my responses are recorded, scored, and results are delivered with export options

  Background:
    Given a student navigates to the homepage at "/"
    And the embedded India GK sandbox assessment player is visible
    And the player header shows "QUESTION 1 / 5"
    And the timer displays a countdown starting near "TIME LEFT: 29:59"

  # ---------------------------------------------------------------------------
  # MCQ_SINGLE — Q1: Capital of India
  # ---------------------------------------------------------------------------

  @student @mcq_single @smoke
  Scenario: MCQ_SINGLE — selecting one option highlights it and enables navigation to Q2
    Given the player is showing Q1 "Capital of India ?" as an MCQ_SINGLE question
    And the options "Mumbai", "New Delhi", "Kolkata", and "Bengaluru" are rendered as button cards
    When the student clicks the option button "New Delhi"
    Then the "New Delhi" button card should appear visually highlighted as selected
    And the "NEXT" button should be enabled
    When the student clicks the "NEXT" button
    Then the player header should show "QUESTION 2 / 5"

  @student @mcq_single @regression
  Scenario: MCQ_SINGLE — clicking a second option deselects the first (single-select exclusivity)
    Given the player is showing Q1 "Capital of India ?" as an MCQ_SINGLE question
    When the student clicks the option button "Mumbai"
    Then the "Mumbai" button card should appear visually highlighted as selected
    When the student clicks the option button "New Delhi"
    Then the "New Delhi" button card should appear visually highlighted as selected
    And the "Mumbai" button card should no longer appear highlighted

  # ---------------------------------------------------------------------------
  # MCQ_MULTIPLE — Q2: National Symbols of India
  # ---------------------------------------------------------------------------

  @student @mcq_multiple @regression
  Scenario: MCQ_MULTIPLE — multiple options can be selected and one can be deselected
    Given the student is on Q2 which is an MCQ_MULTIPLE question about India national symbols
    When the student clicks the first answer option button
    And the student clicks the second answer option button
    Then both selected option buttons should appear visually highlighted
    When the student clicks the first answer option button again
    Then the first option button should no longer appear highlighted
    And the second option button should remain highlighted

  # ---------------------------------------------------------------------------
  # INLINE_CHOICE — Q3: Currency of India
  # ---------------------------------------------------------------------------

  @student @inline_choice @regression
  Scenario: INLINE_CHOICE — embedded dropdown in stem allows selection with no duplicate answer list below
    Given the student is on Q3 which is an INLINE_CHOICE question about Indian currency
    And the question stem contains an embedded dropdown selector within the sentence
    When the student clicks the inline dropdown embedded in the question stem
    And the student selects the answer "Rupee" from the inline dropdown options
    Then the inline dropdown should display "Rupee" as the selected value
    And there should be NO separate duplicate answer list rendered below the question stem

  # ---------------------------------------------------------------------------
  # TEXT_ENTRY — Q4: Taj Mahal
  # ---------------------------------------------------------------------------

  @student @text_entry @regression
  Scenario: TEXT_ENTRY — answer typed in blank field is preserved after navigating away and back
    Given the student is on Q4 which is a TEXT_ENTRY question about the Taj Mahal
    And the question stem contains a blank represented by "__________" (10 underscores)
    And a free-text input field is visible below the stem
    When the student types "Taj Mahal" into the text entry input field
    And the student clicks the "NEXT" button to advance to Q5
    And the student clicks the "BACK" button to return to Q4
    Then the text entry input field should still contain "Taj Mahal"

  # ---------------------------------------------------------------------------
  # NUMERIC_ENTRY — Q5: Year of Independence
  # ---------------------------------------------------------------------------

  @student @numeric_entry @regression
  Scenario: NUMERIC_ENTRY — integer and float values are both accepted by the number input
    Given the student is on Q5 which is a NUMERIC_ENTRY question about India's year of independence
    And the question stem contains a blank represented by "__________" (10 underscores)
    And a number input field with type="number" and step="any" is visible
    When the student clears the number input and types "1947"
    Then the number input should display the value "1947" without validation errors
    When the student clears the number input and types "3.14"
    Then the number input should display the value "3.14" without validation errors

  # ---------------------------------------------------------------------------
  # Flagging
  # ---------------------------------------------------------------------------

  @student @flagging @regression
  Scenario: Question flagging state persists after navigating away and returning
    Given the student is on Q2 which is an MCQ_MULTIPLE question
    And the "FLAG" button is visible in the player header
    When the student clicks the "FLAG" button on Q2
    Then the "FLAG" button should appear in an active or toggled-on state
    When the student clicks the "NEXT" button to advance to Q3
    And the student clicks the "BACK" button to return to Q2
    Then the "FLAG" button should still appear in its active toggled-on state

  # ---------------------------------------------------------------------------
  # Navigation — BACK button state
  # ---------------------------------------------------------------------------

  @student @navigation @regression
  Scenario: BACK button is disabled on Q1 and becomes enabled from Q2 onwards
    Given the player is showing Q1 with the header "QUESTION 1 / 5"
    Then the "BACK" button should be disabled or non-interactive
    When the student clicks the "NEXT" button to advance to Q2
    Then the player header should show "QUESTION 2 / 5"
    And the "BACK" button should be enabled and interactive

  # ---------------------------------------------------------------------------
  # Timer countdown
  # ---------------------------------------------------------------------------

  @student @timer @regression
  Scenario: Timer value decreases after 5 seconds of elapsed time
    Given the player timer is visible showing a "TIME LEFT:" countdown
    And the student records the current timer value displayed
    When 5 seconds elapse without any user interaction
    Then the timer value displayed should be lower than the previously recorded value

  # ---------------------------------------------------------------------------
  # Full submission flow
  # ---------------------------------------------------------------------------

  @student @submission @e2e
  Scenario: Complete all 5 questions and submit — score is displayed with correct/total count
    Given the player is showing Q1 as an MCQ_SINGLE question
    When the student selects "New Delhi" on Q1 and clicks "NEXT"
    And the student selects at least one option on Q2 and clicks "NEXT"
    And the student selects an answer from the inline dropdown on Q3 and clicks "NEXT"
    And the student types "Taj Mahal" into the text entry field on Q4 and clicks "NEXT"
    And the student enters "1947" into the numeric entry field on Q5
    And the student clicks the "Submit" or final submission button
    Then the results view should be displayed
    And the results view should show a score in the format "X / 5" or "X out of 5"
    And the results view should show a topic mastery or breakdown section

  # ---------------------------------------------------------------------------
  # Results — email scorecard dispatch
  # ---------------------------------------------------------------------------

  @student @email @regression
  Scenario: Submitting with a valid email triggers scorecard dispatch attempt
    Given the student has completed all 5 questions and arrived at the results view
    And an email input field is visible on the results page
    When the student enters a valid email address "student@example.com" into the scorecard email field
    And the student submits the email scorecard request
    Then the UI should indicate a scorecard dispatch was attempted for "student@example.com"

  @student @email @regression
  Scenario: Submitting with SMTP failure shows graceful error message — not silent false success
    Given the student has completed all 5 questions and arrived at the results view
    And an email input field is visible on the results page
    And the backend SMTP delivery returns email_sent=false in the API response
    When the student enters a valid email address "student@example.com" and submits
    Then the UI should display a graceful error or warning message indicating scorecard delivery failed
    And the UI should NOT silently show a success confirmation when email_sent is false

  # ---------------------------------------------------------------------------
  # Results — CSV export (Issue 18: button placement & UUID redaction)
  # ---------------------------------------------------------------------------

  @student @results @regression
  Scenario: Export CSV button is located in the top-right of the results title block
    Given Alex navigates to an exam results page at "/public/exam/{examId}/results"
    Then the "Export CSV" button should be visible within the top-right area of the title block
    And the "Export CSV" button should NOT be located inside the filter or toolbar section

  @student @results @regression
  Scenario: Exported CSV does not contain raw Session ID UUIDs
    Given Alex navigates to an exam results page at "/public/exam/{examId}/results"
    When Alex clicks the "Export CSV" button in the title block
    Then the downloaded CSV file should not contain any raw UUID strings in the Session ID column

  # ---------------------------------------------------------------------------
  # Results — Word (.docx) export
  # ---------------------------------------------------------------------------

  @student @results @export
  Scenario: Download Word (.docx) button triggers document export
    Given Alex navigates to an exam results page at "/public/exam/{examId}/results"
    Then a "Download Word" or ".docx" export button should be visible on the results page
    When Alex clicks the "Download Word" export button
    Then a file download of type ".docx" should be triggered by the browser

Feature: Vatra Assess Public Creator Flow
  As an anonymous educator visiting the public creator workspace
  I want to auto-provision a session, author questions, publish assessments, and purchase export credits
  So that the full creator lifecycle from anonymous entry through payment-gated download is validated end-to-end

  Background:
    Given the Vatra Assess platform is accessible at "http://localhost:3000"
    And the payments API at "/api/public/payments/entitlements" is reachable

  # ---------------------------------------------------------------------------
  # 1. SESSION PROVISIONING
  # ---------------------------------------------------------------------------

  @creator @session @smoke
  Scenario: Navigating to /public auto-provisions a session and redirects to creator dashboard
    Given Alex navigates to the public creator entry point at "/public"
    Then Alex should be redirected to "/public/dashboard/{jwt_token}" with a provisioned JWT token
    And the page heading should read "Assessment Workspace"
    And the header should display an "Auto-Saved Session" badge
    And the header should display a "Verified Educator" badge
    And the header should display the creator's email address and question count

  # ---------------------------------------------------------------------------
  # 2. QUESTION BANK METADATA
  # ---------------------------------------------------------------------------

  @creator @questionbank @regression
  Scenario: Creator dashboard displays question bank with correct metadata
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex views the Question Bank Tab
    Then each question card should display a unique QID
    And each question card should display a TYPE badge from the set "MCQ_SINGLE, MCQ_MULTIPLE, TEXT_ENTRY, INLINE_CHOICE, NUMERIC_ENTRY"
    And each question card should display TOPIC, DIFFICULTY, and COGNITIVE LEVEL metadata
    And each question card should display a VALIDATED STEM, CORRECT RESOLUTION, and PEDAGOGICAL RATIONALE

  # ---------------------------------------------------------------------------
  # 3. AI QUESTION GENERATION
  # ---------------------------------------------------------------------------

  @creator @generation @e2e
  Scenario: AI question generation from topic text appends questions to the Question Bank
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex clicks the "+ Generate Questions" button
    And Alex enters a topic text in the generation input field
    And Alex selects question type "MCQ_SINGLE"
    And Alex submits the generation request
    Then Alex should see a loading indicator while questions are being generated
    And the Question Bank Tab should display the newly generated questions with correct metadata
    And the question count in the header should increment accordingly

  # ---------------------------------------------------------------------------
  # 4. MANUAL QUESTION AUTHORING
  # ---------------------------------------------------------------------------

  @creator @manual @regression
  Scenario: Manual question authoring saves a TEXT_ENTRY question with a blank placeholder to the workspace
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex toggles the mode switcher to "Manual" authoring mode
    Then the AI workflow stepper should be hidden
    When Alex adds a new question of type "TEXT_ENTRY"
    And Alex enters a stem containing exactly 10 underscores "The capital of India is __________."
    And Alex clicks "Save to Workspace"
    Then the question should appear in the Question Bank Tab with TYPE "TEXT_ENTRY"
    And the saved stem should contain the "__________" blank placeholder

  # ---------------------------------------------------------------------------
  # 5. TOPIC FILTER
  # ---------------------------------------------------------------------------

  @creator @filter @regression
  Scenario: Topic filter on Question Bank narrows visible question cards to matching topics
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And the Question Bank Tab contains questions across multiple topics
    When Alex types a topic keyword into the "FILTER BY TOPIC:" text input
    Then only question cards whose TOPIC matches the entered keyword should be visible
    And question cards with non-matching topics should not be displayed

  # ---------------------------------------------------------------------------
  # 6. SELECT ALL / DESELECT ALL
  # ---------------------------------------------------------------------------

  @creator @selection @regression
  Scenario: Select all then deselect all questions using the DESELECT ALL button
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And the Question Bank Tab contains at least two question cards
    When Alex selects all question cards via their checkboxes
    Then the "Download Selected (.docx) (N)" button label should reflect the total selected count
    When Alex clicks the "DESELECT ALL" button
    Then all question card checkboxes should be unchecked
    And the download button should reflect a count of zero selected questions

  # ---------------------------------------------------------------------------
  # 7. PUBLISH ASSESSMENT
  # ---------------------------------------------------------------------------

  @creator @publish @e2e
  Scenario: Publish assessment from selected questions creates a published assessment record
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And Alex has selected at least one question in the Question Bank Tab
    When Alex clicks the "PUBLISH ASSESSMENT" button
    Then a published assessment should appear in the Published Assessments Tab
    And the Published Assessments Tab should display the new exam card with a Quick Picker download option

  # ---------------------------------------------------------------------------
  # 8. EXPORT DOCX
  # ---------------------------------------------------------------------------

  @creator @export @regression
  Scenario: Exporting selected questions as a Word document triggers a .docx file download
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And Alex has at least one question selected in the Question Bank Tab
    And the entitlements API returns at least one available "paid_credits"
    When Alex clicks the "Download Selected (.docx) (N)" button
    Then a network request should be issued to "/api/public/payments/export/docx"
    And a ".docx" file download should be triggered in the browser

  # ---------------------------------------------------------------------------
  # 9. PRICING MODAL DISPLAY
  # ---------------------------------------------------------------------------

  @creator @payments @regression
  Scenario: Pricing modal opens showing Single Pass and Pro Monthly plan options
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex clicks the "Pricing & Export Plans" button
    Then the ExportPricingModal should open
    And the modal should display a "Single Pass" plan priced at "₹49"
    And the modal should display a "Pro Monthly" plan priced at "₹299"

  # ---------------------------------------------------------------------------
  # 10. SINGLE PASS PAYMENT FLOW
  # ---------------------------------------------------------------------------

  @creator @payments @e2e
  Scenario: Single Pass ₹49 Razorpay checkout increments paid_credits and triggers auto-download
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And Alex has at least one question selected in the Question Bank Tab
    When Alex clicks the "Pricing & Export Plans" button
    And the ExportPricingModal is open
    And Alex selects the "Single Pass ₹49" plan
    Then a POST request should be made to "/api/public/payments/create-order" returning a Razorpay order ID
    When the Razorpay payment completes successfully
    Then a POST request should be made to "/api/public/payments/verify" to confirm the payment
    And the entitlements API at "/api/public/payments/entitlements" should return an incremented "paid_credits"
    And a ".docx" file download should be automatically triggered

  # ---------------------------------------------------------------------------
  # 11. PRO MONTHLY PAYMENT FLOW
  # ---------------------------------------------------------------------------

  @creator @payments @e2e
  Scenario: Pro Monthly ₹299 checkout activates has_pro entitlement for the session
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex clicks the "Pricing & Export Plans" button
    And the ExportPricingModal is open
    And Alex selects the "Pro Monthly ₹299" plan
    Then a POST request should be made to "/api/public/payments/create-order" returning a Razorpay order ID
    When the Razorpay payment completes successfully
    Then a POST request should be made to "/api/public/payments/verify" to confirm the payment
    And the entitlements API at "/api/public/payments/entitlements" should return "has_pro" as true

  # ---------------------------------------------------------------------------
  # 12. PUBLISHED ASSESSMENTS TAB
  # ---------------------------------------------------------------------------

  @creator @publishedtab @regression
  Scenario: Published Assessments tab displays exam cards with Quick Picker download action
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And at least one assessment has previously been published in this session
    When Alex clicks the "Published Assessments Tab"
    Then Alex should see one or more exam cards in the Published Assessments Tab
    And each exam card should display the assessment title and associated question count
    And each exam card should display a "Quick Picker" download action

  # ---------------------------------------------------------------------------
  # 13. LOGOUT
  # ---------------------------------------------------------------------------

  @creator @auth @regression
  Scenario: Logout clears the creator session from the dashboard
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    When Alex clicks the "Log out of public workspace" button
    Then Alex should be redirected away from the creator dashboard
    And the session JWT token should no longer grant access to the dashboard

  # ---------------------------------------------------------------------------
  # 14. ALIGN BUTTON — SCENARIO OUTLINE
  # ---------------------------------------------------------------------------

  @creator @taxonomy @regression
  Scenario Outline: ALIGN button opens the taxonomy picker for each question type
    Given Alex is on the creator dashboard at "/public/dashboard/{jwt_token}"
    And the Question Bank Tab contains a question of type "<question_type>"
    When Alex clicks the "ALIGN" button on a question card of type "<question_type>"
    Then the Taxonomy Picker modal should open with the label "Align topic with Master Curriculum Framework"
    And Alex should be able to select a curriculum node for the question

    Examples:
      | question_type   |
      | MCQ_SINGLE      |
      | MCQ_MULTIPLE    |
      | TEXT_ENTRY      |
      | INLINE_CHOICE   |
      | NUMERIC_ENTRY   |

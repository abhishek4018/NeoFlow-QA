Feature: Reviewer Portal — Peer Review Queue & RBAC Enforcement
  As a question reviewer
  I want to access the peer review queue, evaluate PublicApprovalQuestionCard items, and action approval or rejection
  So that only validated questions advance through the publishing workflow

  Background:
    Given a reviewer is logged in at "localhost:3000/login" with credentials "reviewer_01" / "reviewerpass"

  @reviewer @auth @smoke
  Scenario: Login with reviewer credentials shows REVIEWER role badge
    Given Alex navigates to the login page at "localhost:3000/login"
    When Alex enters username "reviewer_01" and password "reviewerpass" and submits
    Then Alex should see a role badge displaying "REVIEWER" in the navigation header

  @reviewer @queue @regression
  Scenario: Peer review queue loads PublicApprovalQuestionCard components with metadata row
    Given Alex is on the Reviewer Dashboard peer review queue page
    Then the queue should render one or more "PublicApprovalQuestionCard" components
    And each card should display a metadata row containing QID, Format, Topic, Difficulty, and Cognitive fields

  @reviewer @ui @regression
  Scenario: Metadata row renders without double borders on selects (appearance-none applied)
    Given Alex is on the Reviewer Dashboard peer review queue page
    When Alex inspects the metadata row selects on a "PublicApprovalQuestionCard"
    Then each select element should have "appearance-none" applied
    And the selects should have strict width constraints with no double-border artefacts visible

  @reviewer @approve @e2e
  Scenario: Approve a question — workflow moves question forward
    Given Alex is on the Reviewer Dashboard peer review queue page
    And at least one question is visible in the approval queue
    When Alex clicks the "Approve" action on the first "PublicApprovalQuestionCard"
    Then the question should be removed from the pending review queue
    And the approval count or status indicator should reflect the updated state

  @reviewer @reject @e2e
  Scenario: Reject a question with a rejection comment — rejection recorded
    Given Alex is on the Reviewer Dashboard peer review queue page
    And at least one question is visible in the approval queue
    When Alex clicks the "Reject" action on the first "PublicApprovalQuestionCard"
    And Alex enters a rejection comment "Question stem is ambiguous — please rephrase"
    And Alex confirms the rejection
    Then the question should be removed from the pending review queue
    And the rejection with the submitted comment should be recorded

  @reviewer @security @regression
  Scenario: Reviewer cannot access Faculty-only routes (RBAC enforcement)
    Given Alex is authenticated as reviewer "reviewer_01"
    When Alex attempts to navigate to a Faculty-only route such as "/public/dashboard"
    Then Alex should be redirected or shown an access-denied response
    And Alex should not see Faculty creator dashboard content

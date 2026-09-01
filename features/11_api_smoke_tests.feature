Feature: Vatra Assess API Smoke & Contract Tests

  As a frontend developer, automated CI pipeline, and system integration agent
  I want all public and authenticated REST endpoints to respond with exact schemas and expected HTTP status codes
  So that microservice regressions, outbox relay issues, and contract mismatches are caught before UI deployment

  Background:
    Given the backend microservices are up and healthy

  @api @sandbox @smoke
  Scenario: Public sandbox session initialization returns 200 with session token and exam payload
    When Alex sends a GET request to "/api/public/sandbox/session"
    Then the API response status code should be 200
    And the response JSON body should contain "token"
    And the response JSON body should contain "exam"
    And the response JSON body should contain "questions"

  @api @auth @smoke
  Scenario: Magic link dispatch endpoint returns 200 with email_sent status
    When Alex sends a POST request to "/api/public/auth/magic-link" with payload:
      """
      {
        "email": "educator.candidate@institution.edu"
      }
      """
    Then the API response status code should be 200
    And the response JSON body should contain "token"
    And the response JSON body should contain "message"
    And the response JSON body should contain boolean field "email_sent"

  @api @auth @regression
  Scenario: Magic link endpoint returns email_sent false instead of false success when SMTP fails
    Given SMTP service is configured with non-deliverable test credentials
    When Alex sends a POST request to "/api/public/auth/magic-link" with payload:
      """
      {
        "email": "smtp.test.failure@institution.edu"
      }
      """
    Then the API response status code should be 200
    And the field "email_sent" in the response body should be false
    And the temporary session token should still be returned to preserve the creator workspace

  @api @payments @smoke
  Scenario: Public payments entitlements endpoint returns paid_credits and has_pro status
    When Alex sends a GET request to "/api/public/payments/entitlements?token=test_session_token"
    Then the API response status code should be 200
    And the response JSON body should contain "paid_credits"
    And the response JSON body should contain "has_pro"

  @api @payments @smoke
  Scenario: Create Razorpay payment order returns 200 with order ID
    When Alex sends a POST request to "/api/public/payments/create-order" with payload:
      """
      {
        "token": "test_session_token",
        "plan_type": "single"
      }
      """
    Then the API response status code should be 200
    And the response JSON body should contain "order_id"
    And the response JSON body should contain "amount"
    And the response JSON body should contain "currency"

  @api @export @smoke
  Scenario: Document export endpoint returns binary docx content type
    When Alex sends a GET request to "/api/public/payments/export/docx?token=test_session_token"
    Then the API response status code should be 200
    And the "content-type" header should contain "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  @api @contact @smoke
  Scenario: Public contact inquiry dispatch returns 200
    When Alex sends a POST request to "/api/public/contact" with payload:
      """
      {
        "name": "Prof. Homi Bhabha",
        "email": "homi.bhabha@tifr.res.in",
        "institution": "Tata Institute of Fundamental Research",
        "category": "pilot",
        "message": "We would like to pilot Vatra Assess for Department of Physics exams."
      }
      """
    Then the API response status code should be 200
    And the response JSON body should contain "status" with value "success"

  @api @auth @smoke
  Scenario: Faculty login with valid credentials returns 200 and JWT access token
    When Alex sends a POST request to "/api/auth/login" with form parameters:
      | username | faculty_01  |
      | password | facultypass |
    Then the API response status code should be 200
    And the response JSON body should contain "access_token"
    And the response JSON body should contain "token_type" with value "bearer"

  @api @auth @regression
  Scenario: Login with invalid credentials returns HTTP 401 Unauthorized
    When Alex sends a POST request to "/api/auth/login" with form parameters:
      | username | faculty_01   |
      | password | wrong_secret |
    Then the API response status code should be 401
    And the response JSON body should contain "detail" with value "Invalid credentials"

  @api @documents @smoke
  Scenario: Document listing endpoint with authenticated Faculty JWT returns 200
    Given Alex has a valid Faculty JWT authorization header
    When Alex sends an authenticated GET request to "/api/documents/list"
    Then the API response status code should be 200
    And the response JSON body should be a list of ingested curriculum documents

  @api @exams @smoke
  Scenario: Exam results endpoint with authenticated Faculty JWT returns 200 with psychometrics
    Given Alex has a valid Faculty JWT authorization header
    When Alex sends an authenticated GET request to "/api/exams/1/results"
    Then the API response status code should be 200
    And the response JSON body should contain "exam_id"
    And the response JSON body should contain "submissions"
    And the response JSON body should contain "psychometrics"

  @api @quota @regression
  Scenario: Onboarding request approval within seat quota returns HTTP 200
    Given Alex has a valid InstAdmin JWT authorization header with available quota
    When Alex sends an authenticated POST request to "/api/v1/access/onboarding-requests" with payload:
      """
      {
        "request_id": "00000000-0000-0000-0000-000000000001",
        "action": "approve",
        "assigned_role": "Faculty"
      }
      """
    Then the API response status code should be 200
    And the response JSON body should contain "status" with value "approved"

  @api @quota @regression
  Scenario: Onboarding request approval exceeding seat quota returns HTTP 403 Forbidden
    Given Alex has a valid InstAdmin JWT authorization header with 0 available seats
    When Alex sends an authenticated POST request to "/api/v1/access/onboarding-requests" with payload:
      """
      {
        "request_id": "00000000-0000-0000-0000-000000000002",
        "action": "approve",
        "assigned_role": "Faculty"
      }
      """
    Then the API response status code should be 403
    And the response JSON body should contain "detail" with value "Institution seat quota exceeded"

  @api @health @smoke
  Scenario: Assessment backend core health endpoint returns 200 OK
    When Alex sends a GET request to "http://localhost:8000/health"
    Then the API response status code should be 200
    And the response JSON body should contain "status" with value "healthy"

  @api @health @smoke
  Scenario: Control plane backend core health endpoint returns 200 OK
    When Alex sends a GET request to "http://localhost:8001/health"
    Then the API response status code should be 200
    And the response JSON body should contain "status" with value "healthy"

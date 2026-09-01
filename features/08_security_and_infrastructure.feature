Feature: Security & Infrastructure Hardening — Pariksha / Vatra Assess

  As a security engineer and platform operator
  I want all HTTP security headers, RBAC route protections, container health, and auth controls to be enforced
  So that the platform is hardened against injection, privilege escalation, and infrastructure compromise

  @security @headers @regression
  Scenario: HTTP security headers — CSP, X-Frame-Options, and HSTS are present on all pages
    Given Alex makes an HTTP HEAD request to the homepage "/"
    Then the response should include header "Content-Security-Policy"
    And the response should include header "X-Frame-Options" with value "DENY"
    And the response should include header "Strict-Transport-Security"

  @security @rbac @smoke
  Scenario: Protected route /dashboard redirects unauthenticated users to /login
    Given Alex navigates to "/dashboard" without an authentication token
    Then Alex should be redirected to "/login"

  @security @rbac @regression
  Scenario: Protected route /faculty/review redirects unauthenticated users to /login
    Given Alex navigates to "/faculty/review" without an authentication token
    Then Alex should be redirected to "/login"

  @security @rbac @regression
  Scenario: Faculty JWT cannot access Reviewer-only routes
    Given Alex holds a valid JWT for the "faculty" role
    When Alex attempts to navigate to a Reviewer-only route "/faculty/review"
    Then the platform should deny access with a 403 response or redirect to "/login"

  @security @rbac @regression
  Scenario: Reviewer JWT cannot access ExamAdmin-only routes
    Given Alex holds a valid JWT for the "reviewer" role
    When Alex attempts to navigate to an ExamAdmin-only route "/admin/exams"
    Then the platform should deny access with a 403 response or redirect to "/login"

  @security @healthcheck @smoke
  Scenario: All microservice containers respond healthy
    Given the Docker Compose stack is running
    When Alex checks the health of each service endpoint
    Then "localhost:3000" should return HTTP 200
    And "localhost:3001" should return HTTP 200
    And "localhost:8000/health" should return HTTP 200
    And "localhost:8001/health" should return HTTP 200

  @security @credentials @regression @known_issue
  Scenario: Dev login credentials (faculty_01) visible on /login page — must be removed before production
    Given Alex navigates to the login page "/login"
    Then Alex should see dev credential hints for "faculty_01" displayed on the page
    And this is flagged as a known issue — credentials must be removed before the production release

  @security @auth @regression
  Scenario: Magic link token is a JWT — expired token returns 401 Unauthorized
    Given Alex holds a magic link token that has expired
    When Alex uses the expired token to access "/public/dashboard"
    Then the platform should respond with HTTP 401 Unauthorized
    And Alex should be redirected to the login page

  @security @cors @regression
  Scenario: Cross-origin API request is blocked by the CORS policy
    Given Alex simulates a cross-origin fetch from "https://attacker.example.com"
    When Alex sends a POST request to "/api/auth/login" with a spoofed Origin header
    Then the response should be blocked by CORS policy
    And the response should not include "Access-Control-Allow-Origin: *"

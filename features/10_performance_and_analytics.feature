Feature: Vatra Assess Performance & Analytics Verification

  As an institutional auditor, platform engineer, and test candidate
  I want performance metrics, PostHog EU analytics tracking, Redis question caching, and AI quota resilience to function seamlessly
  So that platform latency complies with SLA targets and user telemetry is reliably captured under high load

  Background:
    Given Alex has network monitoring and telemetry inspection tools active

  @performance @analytics @regression
  Scenario: PostHog pageview event fires via /ingest proxy on homepage load
    Given Alex navigates to homepage "/"
    When the page initial load sequence completes
    Then Alex verifies a PostHog pageview event is dispatched
    And the telemetry request is routed through the "/ingest" reverse proxy path
    And the destination endpoint conforms to PostHog EU cloud infrastructure

  @performance @analytics @regression
  Scenario: PostHog identify call fires with user metadata upon faculty authentication
    Given Alex is on the login page "/login"
    When Alex signs in with username "faculty_01" and password "facultypass"
    Then Alex should be redirected to "/dashboard"
    And Alex verifies PostHog captures an "identify" event with the authenticated user ID and role "FACULTY"

  @performance @analytics @regression
  Scenario: PostHog reset call fires upon user sign out
    Given Alex is authenticated as a faculty member on "/dashboard"
    When Alex clicks the "Logout" button in the navigation header
    Then Alex should be redirected to the login page "/login"
    And Alex verifies PostHog executes a user session reset call to clear identified telemetry state

  @performance @analytics @smoke
  Scenario: Ingest reverse proxy route returns HTTP 200 for ad-blocker resilience
    When Alex sends a direct GET request to the local analytics proxy endpoint "/ingest/static/array.js"
    Then the response status code should be 200
    And the response headers should indicate successful reverse proxy delivery

  @performance @cwv @regression
  Scenario: Homepage Largest Contentful Paint (LCP) meets performance SLA
    When Alex performs a cold load of the public homepage "/"
    Then the Largest Contentful Paint metric should be recorded under 2500 milliseconds
    And the Cumulative Layout Shift metric should equal 0

  @performance @cwv @regression
  Scenario: Zero layout shift occurs during homepage initial render and interactive hydration
    When Alex navigates to the public landing page "/"
    Then no layout shift events should displace the primary viewport headers or the interactive sandbox player

  @performance @cache @regression
  Scenario: Redis question set caching accelerates subsequent identical generation requests
    Given Alex is authenticated on the Faculty Review portal "/faculty/review?tab=generate"
    When Alex submits an AI question generation request for topic "Thermodynamics and Heat Engines"
    And Alex records the initial generation response duration T1
    When Alex submits an identical AI question generation request for topic "Thermodynamics and Heat Engines"
    And Alex records the cached generation response duration T2
    Then response duration T2 should be significantly faster than T1 due to Redis question cache hit

  @performance @resilience @regression
  Scenario: 3-Tier AI Quota Resilience seamlessly fails over on rate limits
    Given the primary Gemini API key is configured with active quota limits
    When high concurrent question generation demands trigger an upstream HTTP 429 response on Key 1
    Then the AI Engine provider factory should automatically fail over to Secondary Key 2
    And the question generation job should complete successfully without raising a 500 error to the client

  @performance @player @smoke
  Scenario: Assessment player renders all 5 questions swiftly from session initialization
    When Alex navigates to the public sandbox assessment session
    Then the assessment player and all initial question options should render completely in under 3000 milliseconds

Feature: Public Marketing Pages — Vatra Assess Platform

  As a marketing visitor (Alex)
  I want all public-facing pages to load correctly with accurate content, navigation, and interactive elements
  So that prospective users can discover the platform, explore its features, and initiate assessments with confidence

  Background:
    Given the Vatra Assess application is running at "http://localhost:3000"
    And Alex is an unauthenticated visitor using a fresh browser session

  # ---------------------------------------------------------------------------
  # Scenario 1: Homepage loads with correct title, H1, nav, and CTAs
  # ---------------------------------------------------------------------------

  @public @homepage @smoke @regression
  Scenario: Homepage loads with correct title, H1, primary navigation, and call-to-action buttons
    Given Alex navigates to the homepage "/"
    Then the browser page title should be "Vatra Assess | Education Intelligence & Assessment Platform"
    And Alex should see the heading "Intelligence Infrastructure for Education"
    And the navigation bar should contain the link "Home"
    And the navigation bar should contain the link "Guides"
    And the navigation bar should contain the link "About"
    And the navigation bar should contain the link "Contact"
    And Alex should see a button labelled "Create Free Assessment"
    And Alex should see a button labelled "Explore Exam Guides"
    And Alex should see the hero badge "🇮🇳 100% Indian Data Sovereignty"
    And Alex should see the hero badge "🎯 Bloom's 6 Cognitive Tiers"
    And Alex should see the hero badge "⚡ Instant Automated Scoring"

  # ---------------------------------------------------------------------------
  # Scenario 2: Dark mode toggle — switches theme and persists on refresh
  # ---------------------------------------------------------------------------

  @public @theme @regression
  Scenario: Dark mode toggle switches the UI theme and persists the preference via localStorage on page refresh
    Given Alex navigates to the homepage "/"
    When Alex clicks the Dark Mode toggle button in the navigation bar
    Then the document element should carry the "dark" class attribute
    And the localStorage key "theme" should have the value "dark"
    When Alex refreshes the browser page
    Then the document element should still carry the "dark" class attribute
    And the dark mode toggle button should reflect the active dark state

  # ---------------------------------------------------------------------------
  # Scenario 3: "Create Free Assessment" CTA navigates to /public
  # ---------------------------------------------------------------------------

  @public @cta @smoke
  Scenario: Clicking the "Create Free Assessment" CTA navigates Alex to the public assessment creator page
    Given Alex navigates to the homepage "/"
    When Alex clicks the button labelled "Create Free Assessment"
    Then the browser URL should be "/public"
    And Alex should see the public assessment creation interface

  # ---------------------------------------------------------------------------
  # Scenario 4: Sign In button is NOT visible in the navigation bar
  # ---------------------------------------------------------------------------

  @public @nav @regression
  Scenario: The Sign In button is intentionally hidden from the public navigation bar
    Given Alex navigates to the homepage "/"
    Then Alex should not see any element with text "Sign In" in the navigation bar
    And no "Sign In" link or button should be rendered in the page DOM

  # ---------------------------------------------------------------------------
  # Scenario 5 (Outline): All public pages render without 404
  # ---------------------------------------------------------------------------

  @public @seo @regression
  Scenario Outline: Public page <path> renders a valid page without a 404 or error response
    Given Alex navigates to the public page "<path>"
    Then the HTTP response status for "<path>" should be 200
    And Alex should not see a "404" or "Page Not Found" error message on the page

    Examples:
      | path     |
      | /        |
      | /guides  |
      | /about   |
      | /contact |
      | /privacy |
      | /terms   |

  # ---------------------------------------------------------------------------
  # Scenario 6: Contact form submission fires POST /api/public/contact
  # ---------------------------------------------------------------------------

  @public @contact @regression
  Scenario: Submitting the contact form fires a POST request to /api/public/contact and receives a 200 response
    Given Alex navigates to the contact page "/contact"
    When Alex fills in the contact form field "name" with "Alex Tester"
    And Alex fills in the contact form field "email" with "alex@example.com"
    And Alex fills in the contact form field "message" with "I am interested in Vatra Assess for my institution."
    And Alex submits the contact form
    Then a POST request should have been made to "/api/public/contact"
    And the API response status for that request should be 200
    And Alex should see a success confirmation message on the contact page

  # ---------------------------------------------------------------------------
  # Scenario 7: Footer links all resolve correctly
  # ---------------------------------------------------------------------------

  @public @footer @regression
  Scenario: All footer navigation links are present and resolve to accessible pages without errors
    Given Alex navigates to the homepage "/"
    Then the page footer should contain the link "Home"
    And the page footer should contain the link "Exam Guides"
    And the page footer should contain the link "About Us"
    And the page footer should contain the link "Contact"
    And the page footer should contain the link "Privacy Policy"
    And the page footer should contain the link "Terms of Service"
    And clicking the footer link "Privacy Policy" should navigate to "/privacy" without a 404
    And clicking the footer link "Terms of Service" should navigate to "/terms" without a 404

  # ---------------------------------------------------------------------------
  # Scenario 8: Homepage sandbox assessment player renders correctly
  # ---------------------------------------------------------------------------

  @public @sandbox @smoke
  Scenario: The homepage LIVE EXPERIENCE sandbox renders with 5 India GK questions, a running 30-minute timer, and visible MCQ option buttons
    Given Alex navigates to the homepage "/"
    When Alex scrolls to the "LIVE EXPERIENCE" sandbox section
    Then Alex should see a sandbox assessment player on the page
    And the sandbox player should display exactly 5 questions in total
    And the sandbox timer should be counting down from 30 minutes
    And the sandbox timer should be actively running and not frozen
    And Alex should see at least 4 MCQ answer option buttons for the current question
    And the "Next" navigation button should be visible within the sandbox player

Feature: VATRA Master Branding, Stakeholder Pillars & DPDP Persistence
  As a site visitor and institution auditor
  I want the VATRA platform branding, 3 stakeholder pillars, and DPDP consent cookie persistence to function cleanly
  So that institutional trust and compliance are verified end-to-end

  @vatra @branding @e2e @regression
  Scenario: Public site displays VATRA master brand logo and tagline
    Given Alex navigates to homepage "/"
    Then Alex should see the VATRA logo mark and tagline "Intelligence Infrastructure"

  @vatra @pillars @e2e @regression
  Scenario: About page renders 3 Stakeholder Pillars grid
    Given Alex navigates to about page "/about"
    Then Alex should see stakeholder sections for Educators, Students, and Institutions

  @vatra @dpdp @e2e @regression
  Scenario: Candidate accepts DPDP consent and banner remains hidden on refresh
    Given Alex navigates to landing page "/public"
    When Alex clicks "Accept & Continue" on the DPDP consent banner
    Then the DPDP consent cookie "vatra_dpdp_consent" should be set
    And refreshing the page should keep the consent banner hidden

  @vatra @analytics @e2e @regression
  Scenario: Faculty dashboard displays live assessment statistics
    Given Alex navigates to faculty dashboard "/faculty/dashboard"
    Then Alex should see statistics cards for active exams, completed attempts, and average score

  @vatra @blooms_results @e2e @regression
  Scenario: Candidate results view displays Bloom's cognitive score breakdown
    Given Alex navigates to student results page "/public/exam/1/results"
    Then Alex should see pedagogical score results and Bloom's cognitive feedback

  @vatra @dpdp_audit_api @e2e @regression
  Scenario: DPDP consent API endpoint records consent with proxy IP extraction
    Given Alex posts DPDP consent payload to "/api/auth/consent"
    Then the API should respond with status "recorded" and client IP address


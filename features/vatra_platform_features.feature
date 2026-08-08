Feature: VATRA Master Branding, Stakeholder Pillars & DPDP Persistence
  As a site visitor and institution auditor
  I want the VATRA platform branding, 3 stakeholder pillars, and DPDP consent cookie persistence to function cleanly
  So that institutional trust and compliance are verified end-to-end

  @vatra @branding @e2e
  Scenario: Public site displays VATRA master brand logo and tagline
    Given Alex navigates to homepage "/"
    Then Alex should see the VATRA logo mark and tagline "Intelligence Infrastructure for Education"

  @vatra @pillars @e2e
  Scenario: About page renders 3 Stakeholder Pillars grid
    Given Alex navigates to about page "/about"
    Then Alex should see stakeholder sections for Educators, Students, and Institutions

  @vatra @dpdp @e2e
  Scenario: Candidate accepts DPDP consent and banner remains hidden on refresh
    Given Alex navigates to landing page "/public"
    When Alex clicks "Accept & Continue" on the DPDP consent banner
    Then the DPDP consent cookie "vatra_dpdp_consent" should be set
    And refreshing the page should keep the consent banner hidden

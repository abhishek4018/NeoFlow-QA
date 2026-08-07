Feature: Google AdSense & Technical SEO Verification

  As an site administrator and visitor
  I want all public SEO pages, ads.txt, robots.txt, sitemap.xml, and AdSense tags to be accessible and compliant
  So that Google Search indexes the site and Google AdSense approves the publisher account for monetization

  @seo @adsense @e2e
  Scenario: Public site presents valid AdSense verification file ads.txt
    Given an auditor navigates to "http://localhost:3000/ads.txt"
    Then the response should be HTTP 200 containing publisher ID "pub-8277548045149265"

  @seo @adsense @e2e
  Scenario: Public site root layout includes Google AdSense script tag
    Given an auditor navigates to "http://localhost:3000/"
    Then the page head should contain the Google AdSense script with client ID "ca-pub-8277548045149265"

  @seo @e2e
  Scenario: All public SEO content pages render with valid headings and footer links
    Given an auditor verifies public page "http://localhost:3000/"
    And an auditor verifies public page "http://localhost:3000/guides"
    And an auditor verifies public page "http://localhost:3000/about"
    And an auditor verifies public page "http://localhost:3000/contact"
    And an auditor verifies public page "http://localhost:3000/privacy"
    And an auditor verifies public page "http://localhost:3000/terms"
    Then all public pages should render successfully with non-empty headings and footer navigation

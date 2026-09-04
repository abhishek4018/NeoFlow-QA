Feature: Google AdSense & Technical SEO Verification

  As an auditor and site visitor
  I want all public SEO pages, ads.txt, robots.txt, sitemap.xml, and AdSense tags to be accessible and compliant
  So that Google Search indexes the site and Google AdSense approves the publisher account for monetization

  @seo @adsense @e2e
  Scenario: Public site presents valid AdSense verification file ads.txt
    Given Alex navigates to "/ads.txt"
    Then Alex should verify the text contains publisher ID "pub-8277548045149265"

  @seo @adsense @e2e
  Scenario: Public site root layout includes Google AdSense script tag
    Given Alex navigates to "/"
    Then Alex should verify the script element contains client ID "ca-pub-8277548045149265"

  @seo @e2e
  Scenario: All public SEO content pages render with valid headings and footer links
    Given Alex verifies public page "/"
    And Alex verifies public page "/guides"
    And Alex verifies public page "/about"
    And Alex verifies public page "/contact"
    And Alex verifies public page "/privacy"
    And Alex verifies public page "/terms"
    Then Alex should confirm all public pages rendered cleanly

@QuickExamCreator @NavigationFlow @smoke
Feature: Quick Exam Creator (Vatra Assess) Navigation and Components

  Scenario: Validate Home, Guides, About, and Contact pages
    Given the user navigates to "https://quickexamcreator.com/"
    Then the header with text "Intelligence Infrastructure" should be visible
    When the user navigates to the "Guides" page from navigation bar
    Then the page url should contain "guides"
    And the main heading should be visible
    When the user navigates to the "About" page from navigation bar
    Then the page url should contain "about"
    And the main heading should be visible
    When the user navigates to the "Contact" page from navigation bar
    Then the page url should contain "contact"
    And the contact content should be visible

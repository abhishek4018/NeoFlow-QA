@contact @quickexamcreator @vatra
Feature: Contact Flow

  Scenario: Validate Contact Page Structural Contract & Key Element Availability
    Given the user navigates to the contact url
    Then the following key elements should be visible on the page:
      | Element Type | Identifier / Text              | Target Role |
      | Heading      | Connect with VATRA             | h1          |
      | Heading      | Send an Inquiry                | h2          |
      | Button       | Dispatch Inquiry               | button      |
      | Support Link | support@quickexamcreator.com   | link        |
      | Support Link | grievance@quickexamcreator.com | link        |
      | Form Input   | Full Name                      | input       |
      | Form Input   | Email Address                  | input       |
      | Form Input   | Inquiry Details                | textarea    |
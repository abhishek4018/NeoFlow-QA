Feature: Control Plane Admin Portal — SuperAdmin Workflows
  As a SuperAdmin of the Vatra Assess platform
  I want to manage institutions, users, taxonomies, audit logs, and platform settings via the Control Plane
  So that the entire administrative lifecycle is verified end-to-end on the National Grid

  Background:
    Given the SuperAdmin is logged into the Control Plane at "http://localhost:3001"
    And the navigation header shows the "Vatra Assess ControlPlane" logo
    And the username "admin" is displayed with a "SUPERADMIN" badge

  # ---------------------------------------------------------------------------
  # Authentication
  # ---------------------------------------------------------------------------

  @controlplane @auth @smoke
  Scenario: SuperAdmin logs in and System Overview dashboard loads with SUPERADMIN badge
    Given the SuperAdmin navigates to the Control Plane login page at "http://localhost:3001/login"
    When the SuperAdmin enters credentials for username "admin" and submits the login form
    Then the SuperAdmin should be redirected to the Control Plane dashboard
    And the page heading "System Overview" should be visible
    And the tagline "Real-time monitoring of the Vatra Assess National Grid." should be visible
    And the navigation header should display the username "admin" with a "SUPERADMIN" badge

  # ---------------------------------------------------------------------------
  # Dashboard
  # ---------------------------------------------------------------------------

  @controlplane @dashboard @regression
  Scenario: System Overview shows ALL SYSTEMS OPERATIONAL and Refresh button works
    Given the SuperAdmin is on the Control Plane dashboard at "/dashboard"
    Then the status indicator "ALL SYSTEMS OPERATIONAL" should be visible
    And a Refresh button should be present on the dashboard
    When the SuperAdmin clicks the Refresh button
    Then the dashboard metrics should reload without a full page navigation

  # ---------------------------------------------------------------------------
  # Navigation
  # ---------------------------------------------------------------------------

  @controlplane @nav @regression
  Scenario: All sidebar navigation links are accessible
    Given the SuperAdmin is on the Control Plane dashboard at "/dashboard"
    Then the sidebar should contain the following navigation links in order:
      | Link Label   |
      | Dashboard    |
      | Institutions |
      | Users        |
      | Taxonomies   |
      | Audit Logs   |
      | Settings     |
    When the SuperAdmin clicks the "Institutions" sidebar link
    Then the page URL should contain "/institutions"
    When the SuperAdmin clicks the "Users" sidebar link
    Then the page URL should contain "/users"
    When the SuperAdmin clicks the "Taxonomies" sidebar link
    Then the page URL should contain "/taxonomies"
    When the SuperAdmin clicks the "Audit Logs" sidebar link
    Then the page URL should contain "/audit"
    When the SuperAdmin clicks the "Settings" sidebar link
    Then the page URL should contain "/settings"
    When the SuperAdmin clicks the "Dashboard" sidebar link
    Then the page URL should contain "/dashboard"

  # ---------------------------------------------------------------------------
  # Institutions
  # ---------------------------------------------------------------------------

  @controlplane @institutions @e2e
  Scenario: Manage Institutions — view institution list and add a new institution via modal
    Given the SuperAdmin navigates to the Institutions page at "/institutions"
    Then a list of existing institutions (universities and colleges) should be displayed
    When the SuperAdmin clicks the "Add Institution" button
    Then an institution creation modal should open
    When the SuperAdmin fills in the institution name "Vatra National University"
    And the SuperAdmin fills in the institution domain "vnu.edu.in"
    And the SuperAdmin submits the institution creation form
    Then the new institution "Vatra National University" should appear in the institutions list
    And the modal should close automatically

  # ---------------------------------------------------------------------------
  # User Management — Create User & ErrorSummary
  # ---------------------------------------------------------------------------

  @controlplane @users @regression
  Scenario: Create User form validation triggers ErrorSummary with role=alert, auto-focus, and anchor links to invalid fields
    Given the SuperAdmin navigates to the Users page at "/users"
    When the SuperAdmin clicks the "Create User" link
    Then the SuperAdmin should be on the Create User page at "/users/create"
    When the SuperAdmin submits the Create User form without filling any required fields
    Then an ErrorSummary component with role "alert" should appear at the top of the form
    And the ErrorSummary should auto-focus on mount
    And the ErrorSummary should contain anchor links to the following invalid field IDs:
      | Field ID        |
      | #username       |
      | #password       |
      | #institution_id |
      | #role           |
    And each anchor link in the ErrorSummary should scroll the page to the corresponding input field

  # ---------------------------------------------------------------------------
  # User Management — Live Search
  # ---------------------------------------------------------------------------

  @controlplane @users @regression
  Scenario: User search filters the user list live as the SuperAdmin types
    Given the SuperAdmin is on the Users page at "/users"
    And the user list displays multiple users with role badges
    When the SuperAdmin types "faculty" into the search input field
    Then the displayed user list should be filtered to show only users matching "faculty"
    And non-matching users should not be visible in the filtered list
    When the SuperAdmin clears the search input
    Then the full user list should be restored

  # ---------------------------------------------------------------------------
  # Inquiries & Pilots (Onboarding Tab)
  # ---------------------------------------------------------------------------

  @controlplane @inquiries @regression
  Scenario: Inquiries and Pilots tab shows inquiry list with category badges and a detail modal with mailto: link
    Given the SuperAdmin navigates to the Users page with the onboarding tab at "/users?tab=onboarding"
    Then the Inquiries & Pilots tab should be active
    And a list of inquiry entries should be visible
    And each inquiry entry should display a category pill badge
    When the SuperAdmin clicks on any inquiry entry to open its detail modal
    Then a detail modal should open for that inquiry
    And the detail modal should contain a "mailto:" reply link to the inquirer's email address
    And unread notification badges should be visible on new or unread inquiry entries

  # ---------------------------------------------------------------------------
  # Onboarding Approval — AccessibleSelect & role-specific email
  # ---------------------------------------------------------------------------

  @controlplane @onboarding @e2e
  Scenario: Approve onboarding request — AccessibleSelect dropdown is keyboard navigable and correct role-specific email is dispatched
    Given the SuperAdmin is on the Inquiries & Pilots tab at "/users?tab=onboarding"
    And at least one pending onboarding request is visible in the list
    When the SuperAdmin opens the approval modal for the first pending onboarding request
    Then the ApproveOnboardingModal should be displayed
    And the role selection should use an AccessibleSelect dropdown component
    When the SuperAdmin navigates the AccessibleSelect role dropdown using the keyboard arrow keys
    And the SuperAdmin selects the role "Faculty" using the keyboard
    And the SuperAdmin confirms the approval action
    Then the onboarding request should be marked as approved
    And the system should dispatch a role-specific approval email using the "Faculty" email template
    And the approval email should contain a dynamically resolved portal URL for the faculty portal

  # ---------------------------------------------------------------------------
  # Quota Enforcement
  # ---------------------------------------------------------------------------

  @controlplane @quota @regression
  Scenario: Quota enforcement — approving a user beyond the institution seat limit returns 403 Forbidden
    Given the SuperAdmin is on the Inquiries & Pilots tab at "/users?tab=onboarding"
    And the target institution has reached its maximum seat quota (used equals total)
    And a pending onboarding request exists for that institution
    When the SuperAdmin opens the approval modal for the quota-exceeded institution
    And the SuperAdmin confirms the approval action
    Then the system should return a "403 Forbidden" response
    And the seat quota meter should reflect the used and total seat counts
    And the SuperAdmin should see an error message indicating the institution seat limit has been reached

  # ---------------------------------------------------------------------------
  # Taxonomy CRUD
  # ---------------------------------------------------------------------------

  @controlplane @taxonomy @e2e
  Scenario: Taxonomy CRUD — add, edit, and delete a node; delete triggers ConfirmModal with focus trap; ESC key closes modal
    Given the SuperAdmin navigates to the Taxonomies page at "/taxonomies"
    Then a hierarchical ltree taxonomy tree should be displayed
    When the SuperAdmin clicks "Add Node" and enters the label "Engineering Sciences"
    And the SuperAdmin submits the Add Node form
    Then the node "Engineering Sciences" should appear in the taxonomy tree
    When the SuperAdmin selects the node "Engineering Sciences" and clicks "Edit Node"
    And the SuperAdmin updates the label to "Applied Engineering Sciences"
    And the SuperAdmin submits the Edit Node form
    Then the node label should be updated to "Applied Engineering Sciences" in the tree
    When the SuperAdmin selects the node "Applied Engineering Sciences" and clicks "Delete Node"
    Then the ConfirmModal should appear asking for deletion confirmation
    And focus should be trapped inside the ConfirmModal (focus trap active)
    And pressing the "Escape" key should close the ConfirmModal without deleting the node
    When the SuperAdmin reopens the delete ConfirmModal and confirms the deletion
    Then the node "Applied Engineering Sciences" should be removed from the taxonomy tree

  # ---------------------------------------------------------------------------
  # Audit Logs
  # ---------------------------------------------------------------------------

  @controlplane @audit @regression
  Scenario: Audit Logs — entries visible with timestamps and filter by action type works
    Given the SuperAdmin navigates to the Audit Logs page at "/audit"
    Then a list of tamper-proof audit log entries should be displayed
    And each audit log entry should display a timestamp
    And each audit log entry should display an action type label
    When the SuperAdmin filters the audit log by action type "USER_CREATED"
    Then only audit log entries of type "USER_CREATED" should be visible
    When the SuperAdmin filters the audit log by a date range
    Then only audit log entries within the selected date range should be visible
    When the SuperAdmin clears all filters
    Then the full unfiltered audit log list should be restored

  # ---------------------------------------------------------------------------
  # Dark Mode & Semantic Tokens
  # ---------------------------------------------------------------------------

  @controlplane @theme @regression
  Scenario: Dark mode — all components use semantic tokens, no hardcoded dark classes, and theme toggle persists
    Given the SuperAdmin is on the Control Plane dashboard at "/dashboard"
    And the dark mode toggle is visible in the navigation header
    When the SuperAdmin clicks the dark mode toggle to enable dark mode
    Then the Control Plane UI should switch to the dark theme
    And the MetadataEditor component should use only semantic token classes (bg-muted, bg-card, border-border) and not contain hardcoded dark-mode class overrides
    And the OnboardingWizard component should use only semantic token classes (bg-muted, bg-card, border-border) and not contain hardcoded dark-mode class overrides
    And the ApproveOnboardingModal component should use only semantic token classes (bg-muted, bg-card, border-border) and not contain hardcoded dark-mode class overrides
    When the SuperAdmin refreshes the page
    Then the dark mode preference should persist after page reload
    When the SuperAdmin clicks the dark mode toggle again to disable dark mode
    Then the Control Plane UI should revert to the light theme

  # ---------------------------------------------------------------------------
  # Logout
  # ---------------------------------------------------------------------------

  @controlplane @auth @regression
  Scenario: Logout — Sign out clears session and redirects to login page
    Given the SuperAdmin is logged into the Control Plane at "http://localhost:3001"
    When the SuperAdmin clicks the "Sign out" button in the navigation header
    Then the session should be cleared
    And the SuperAdmin should be redirected to the login page at "/login"
    And attempting to navigate back to the dashboard at "/dashboard" should redirect back to "/login"

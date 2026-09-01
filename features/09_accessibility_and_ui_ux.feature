Feature: Accessibility & UI/UX Quality — Pariksha / Vatra Assess

  As a faculty author, student candidate, and accessibility auditor
  I want all UI components to meet WCAG 2.1 AA standards, maintain zero layout shift, and render correctly across viewports
  So that every user — regardless of ability or device — has a consistent and accessible experience

  @a11y @forms @regression
  Scenario: ErrorSummary component has role=alert and auto-focuses on invalid form submission
    Given Alex navigates to the user creation form at "/users/create"
    When Alex submits the form with missing required fields
    Then the ErrorSummary component should have attribute "role" equal to "alert"
    And the ErrorSummary should receive keyboard focus automatically

  @a11y @forms @regression
  Scenario: ErrorSummary anchor links navigate to their respective invalid input fields
    Given Alex navigates to the user creation form at "/users/create"
    When Alex submits the form with all required fields empty
    Then the ErrorSummary should display anchor links to "#username", "#password", "#institution_id", and "#role"
    And clicking each anchor link should scroll to and focus the corresponding input field

  @a11y @modal @regression
  Scenario: ConfirmModal traps keyboard focus — Tab key does not exit the modal
    Given Alex triggers the ConfirmModal on the taxonomies page
    When Alex presses Tab repeatedly inside the open ConfirmModal
    Then focus should cycle only through interactive elements within the modal
    And focus should never move to elements outside the ConfirmModal

  @a11y @modal @regression
  Scenario: ConfirmModal closes when the ESC key is pressed
    Given Alex triggers the ConfirmModal on the taxonomies page
    When Alex presses the "Escape" key
    Then the ConfirmModal should close
    And focus should return to the triggering element

  @a11y @select @regression
  Scenario: AccessibleSelect allows keyboard navigation with arrow keys and Enter to select
    Given Alex navigates to a page containing an AccessibleSelect component
    When Alex focuses the AccessibleSelect and presses the "ArrowDown" key
    Then the next option should become highlighted
    When Alex presses the "ArrowUp" key
    Then the previous option should become highlighted
    When Alex presses "Enter"
    Then the highlighted option should be selected and the dropdown should close

  @a11y @focus @regression
  Scenario: All interactive elements display a visible focus ring on keyboard navigation
    Given Alex navigates to the public landing page "/"
    When Alex navigates through all interactive elements using only the Tab key
    Then every focused button, link, and input should have a visible focus ring outline

  @a11y @contrast @regression
  Scenario: Dark mode — H1 text is visible without gradient masking in both light and dark themes
    Given Alex navigates to the public landing page "/"
    When Alex toggles the theme to "dark" mode
    Then the H1 hero heading should be fully visible with adequate contrast
    And no CSS gradient mask should clip or fade the H1 text
    When Alex toggles the theme back to "light" mode
    Then the H1 hero heading should remain fully visible with adequate contrast

  @a11y @cls @regression
  Scenario: AI to Manual mode toggle produces zero Cumulative Layout Shift and constant hero height
    Given Alex navigates to the public landing page "/"
    And Alex is in "AI" generation mode
    When Alex toggles to "Manual" authoring mode
    Then the Cumulative Layout Shift score should be 0
    And the hero section height should remain constant before and after the toggle

  @a11y @cls @regression
  Scenario: 3-step stepper collapses and expands without displacing surrounding content
    Given Alex navigates to the public landing page "/"
    And the 3-step AI workflow stepper is visible
    When Alex toggles between AI and Manual modes causing the stepper to collapse
    Then no content below the stepper should shift position
    And the stepper should transition using CSS opacity and height only

  @a11y @ui @regression
  Scenario: Search icon does not overlap input placeholder text — pl-12 spacing applied
    Given Alex navigates to a page with a search input containing an absolute-positioned icon
    Then the search icon should be positioned within the first 48px of the input
    And the input placeholder text should begin at or after the "pl-12" left padding offset
    And no visual overlap between the icon and placeholder text should be present

  @a11y @ui @regression
  Scenario: Topic filter pill renders on a single line without text wrapping
    Given Alex navigates to the published questions view
    When the topic filter pill "Filter by topic:" is rendered
    Then the pill text should appear on exactly one line
    And the pill element should have CSS properties "whitespace-nowrap" and "shrink-0" applied

  @a11y @seo @regression
  Scenario Outline: Page titles follow the format "Vatra Assess | <page_name>" across all routes
    Given Alex navigates to "<route>"
    Then the page title should match the pattern "Vatra Assess | <page_name>"

    Examples:
      | route                   | page_name              |
      | /                       | Home                   |
      | /public                 | Quick Generator        |
      | /login                  | Login                  |
      | /faculty/dashboard      | Faculty Dashboard      |
      | /faculty/review         | Review Queue           |
      | /admin/exams            | Exam Administration    |
      | /users/create           | Create User            |

  @a11y @responsive @regression
  Scenario Outline: Mobile viewport (375px width) — no horizontal overflow on key pages
    Given Alex sets the browser viewport to 375px wide and 812px tall
    When Alex navigates to "<route>"
    Then the page body should not have horizontal scroll
    And no element should overflow outside the 375px viewport boundary

    Examples:
      | route                   |
      | /                       |
      | /public                 |
      | /login                  |
      | /faculty/dashboard      |
      | /users/create           |

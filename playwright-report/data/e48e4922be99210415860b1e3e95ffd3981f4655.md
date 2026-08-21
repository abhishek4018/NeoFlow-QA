# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: creator_dashboard_raw.spec.ts >> Creator can access dashboard and add a new question
- Location: codegen/creator_dashboard_raw.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "https://uat.quickexamcreator.com/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "https://uat.quickexamcreator.com/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - link "VATRA Intelligence Infrastructure ASSESS" [ref=e7] [cursor=pointer]:
            - /url: /public
            - img "VATRA Intelligence Infrastructure" [ref=e9]
            - generic [ref=e10]: ASSESS
          - paragraph [ref=e11]: The next generation of educational assessment. Harness the power of AI to generate, evaluate, and manage examinations instantly.
        - generic [ref=e12]:
          - generic [ref=e13]:
            - img [ref=e14]
            - heading "Adaptive Learning" [level=3] [ref=e17]
            - paragraph [ref=e18]: Tailored assessments that match student capabilities.
          - generic [ref=e19]:
            - img [ref=e20]
            - heading "Instant Generation" [level=3] [ref=e23]
            - paragraph [ref=e24]: Upload syllabus documents to instantly create robust question banks.
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img [ref=e29]
          - heading "Welcome Back" [level=2] [ref=e32]
          - paragraph [ref=e33]: Sign in to your assessment platform dashboard
        - generic [ref=e34]:
          - generic [ref=e35]:
            - text: Username
            - textbox "Enter username" [ref=e36]
          - generic [ref=e37]:
            - generic [ref=e38]:
              - generic [ref=e39]: Password
              - link "Forgot password?" [ref=e40] [cursor=pointer]:
                - /url: "#"
            - textbox "Enter password" [ref=e41]
          - button "Sign In" [ref=e42]
          - generic [ref=e43]:
            - text: 🇮🇳 By continuing, you agree to our
            - link "Terms of Service" [ref=e44] [cursor=pointer]:
              - /url: /terms
            - text: and
            - link "Privacy Policy" [ref=e45] [cursor=pointer]:
              - /url: /privacy
            - text: under India's DPDP Act 2023.
        - generic [ref=e46]:
          - paragraph [ref=e47]: Development Demo Users
          - generic [ref=e48]:
            - generic [ref=e49] [cursor=pointer]:
              - generic [ref=e50]: faculty_01
              - generic [ref=e51]: facultypass
            - generic [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: reviewer_01
              - generic [ref=e54]: reviewerpass
            - generic [ref=e55] [cursor=pointer]:
              - generic [ref=e56]: examadmin_01
              - generic [ref=e57]: adminpass
            - generic [ref=e58] [cursor=pointer]:
              - generic [ref=e59]: student_01
              - generic [ref=e60]: studentpass
  - contentinfo [ref=e61]:
    - generic [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]: VATRA ASSESS
          - generic [ref=e66]: 🇮🇳 DPDP Act 2023 Compliant
        - paragraph [ref=e67]: Powered by Vatra Education Intelligence Platform.
      - generic [ref=e68]:
        - link "Home" [ref=e69] [cursor=pointer]:
          - /url: /
        - link "Exam Guides" [ref=e70] [cursor=pointer]:
          - /url: /guides
        - link "About Us" [ref=e71] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=e72] [cursor=pointer]:
          - /url: /contact
        - link "Privacy Policy" [ref=e73] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e74] [cursor=pointer]:
          - /url: /terms
    - generic [ref=e75]: © 2026 Vatra Education Intelligence Platform. Digital Personal Data Protection Act, 2023 Compliant.
  - generic [ref=e76]:
    - generic [ref=e77]:
      - generic [ref=e78]: 🇮🇳
      - generic [ref=e79]:
        - heading "Digital Personal Data Protection (DPDP) Notice" [level=4] [ref=e80]
        - paragraph [ref=e81]: Vatra Assess uses essential cookies, local storage, and assessment logs strictly to remember your privacy choices, secure exam sessions, and deliver evaluation services under India's Digital Personal Data Protection Act 2023.
        - generic [ref=e82]:
          - generic [ref=e83]: Read our
          - link "Privacy Policy & Data Principal Rights" [ref=e84] [cursor=pointer]:
            - /url: /privacy
    - generic [ref=e85]:
      - button "Essential Only" [ref=e86]
      - button "Accept & Continue" [ref=e87]
  - region "Notifications alt+T"
  - alert [ref=e88]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Creator can access dashboard and add a new question', async ({ page }) => {
  4  |   test.setTimeout(60000);
  5  | 
  6  |   const baseUrl = 'https://uat.quickexamcreator.com';
  7  |   const dashboardUrl = `${baseUrl}/dashboard`;
  8  | 
  9  |   // Navigate to dashboard (assumes authentication via magic link token if present)
  10 |   await page.goto(dashboardUrl);
> 11 |   await expect(page).toHaveURL(/\/dashboard/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  12 | 
  13 |   // Click on Add Question button
  14 |   await page.getByRole('button', { name: /Add Question/i }).click();
  15 | 
  16 |   // Fill in the question form
  17 |   await page.getByLabel('Title').fill('Sample Question');
  18 |   await page.getByLabel('Description').fill('This is a sample question description.');
  19 | 
  20 |   // Submit the form
  21 |   await page.getByRole('button', { name: /Create/i }).click();
  22 | 
  23 |   // Verify the new question appears in the list
  24 |   const newQuestion = page.getByRole('listitem').filter({ hasText: 'Sample Question' });
  25 |   await expect(newQuestion).toBeVisible();
  26 | });
  27 | 
```
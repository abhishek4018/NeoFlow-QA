@negative
Feature: Negative Scenarios

  Scenario: Invalid File Uploads
    Given I am on the public page
    When I select the "Deep Scan" RAG mode
    And I upload an unsupported "malicious.exe" file 
  #add actual code to add the file upload step
    # Then I should see an invalid file type error message

  Scenario: Form Validation - Missing Mandatory Fields
    Given I am on the public page
    When I attempt to generate without providing a topic
    Then I should see a validation error for required fields

  Scenario: Authentication Edge Cases
    Given I attempt to access the protected dashboard route directly
    Then I should be redirected away from the dashboard

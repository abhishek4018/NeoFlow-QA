Feature: Search and add Dolo 360 to cart on 1mg

  @Dolo360 @codegen
  Scenario: Verify user can search and find then add to cart on 1mg
    Given the user navigates to "https://www.1mg.com/"
    When the user enters "Dolo 360" into the element with aria-label "Search for Medicines and Health Products"
    And the user presses "Enter" in the element with aria-label "Search for Medicines and Health Products"
    And the user adds the first search result to cart
    Then the cart icon should be visible

Feature: Search for Sony headphone on Amazon

  @SonyHeadphoneAmazon @codegen
  Scenario: Search for Sony headphone on Amazon
    Given the user opens the Amazon home page
    When the user enters "sony headphone" into the element with id "twotabsearchtextbox"
    And the user presses "Enter" in the element with id "twotabsearchtextbox"
    Then the search results should contain "sony headphone"

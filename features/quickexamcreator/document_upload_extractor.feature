Feature: Document Upload Assessment Question Extraction and File Management

  As an instructor or content creator
  I want to upload document notes, verify file preview badges, and manage file attachments
  So that questions are accurately extracted from source material

  @doc-upload @codegen @regression
  Scenario: Upload document notes, verify preview badge, test file removal, and extract questions
    Given candidate opens Pariksha Public Page at "/public"
    When candidate ensures "Paste Text / File" mode is active
    And candidate uploads document named "lecture_notes_biology.txt" with content "CELL BIOLOGY NOTES: Mitochondria is the powerhouse of the cell."
    Then file preview badge for "lecture_notes_biology.txt" should be visible with a Remove button
    When candidate removes the uploaded document "lecture_notes_biology.txt"
    Then file preview badge for "lecture_notes_biology.txt" should not be visible
    When candidate uploads document named "lecture_notes_biology.txt" with content "CELL BIOLOGY NOTES: Mitochondria is the powerhouse of the cell."
    And candidate clicks Extract & Generate Questions button
    Then extracted questions results view should be displayed

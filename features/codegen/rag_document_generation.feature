Feature: Upload RAG Document AI Question Extraction

  As an educator or test author
  I want to upload a PDF or DOCX file containing source material
  So that the AI engine extracts structural knowledge using RAG to generate assessment questions

  @rag-document @codegen @regression
  Scenario: Upload PDF document, extract knowledge via RAG, and generate questions
    Given the user opens the Pariksha Public Page for RAG at "/public"
    When the user selects the "Upload RAG Document" mode
    And the user expands Advanced Pedagogical Controls for RAG
    And the user selects target audience "Postgraduate" and cognitive level "Analyze" for RAG
    And the user uploads a test document "advanced_physics.pdf"
    And the user clicks the "Extract & Generate Questions" button for RAG
    Then the generated questions results section should be displayed with parsed RAG data

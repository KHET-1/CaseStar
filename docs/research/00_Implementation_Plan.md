# CaseStar Implementation Plan

## Phase 1: Critical Security & Infrastructure (Days 1-3)

**Goal:** Secure the application and ensure data integrity.

1. **Secure ID Generation**
    * [ ] Replace `len(text)` based IDs with `uuid.uuid4()` in `main.py`.
2. **File Upload Security**
    * [ ] Implement `MAX_FILE_SIZE` check (50MB).
    * [ ] Implement Magic Byte validation using `filetype`.
3. **Rate Limiting**
    * [ ] Install `slowapi`.
    * [ ] Configure rate limits on `/api/upload` and `/api/analyze`.
4. **CORS & Headers**
    * [ ] Restrict CORS to specific origins/methods.
    * [ ] Add security headers middleware.

## Phase 2: Core Functionality - Text Extraction (Days 4-6)

**Goal:** Make the "Upload" feature actually work for PDFs and Docs.

1. **Dependencies**
    * [ ] Add `pymupdf`, `python-docx`, `filetype` to `requirements.txt`.
2. **Extraction Logic**
    * [ ] Create `src/services/text_extractor.py`.
    * [ ] Implement PDF extraction (PyMuPDF).
    * [ ] Implement DOCX extraction (python-docx).
    * [ ] Update `main.py` to use this service.

## Phase 3: AI Analysis & Data Structure (Days 7-9)

**Goal:** Get meaningful data out of the LLM.

1. **Structured Output**
    * [ ] Define Pydantic models for `AnalysisResult`.
    * [ ] Update Ollama prompt to enforce JSON schema.
    * [ ] Implement parsing logic in `main.py`.
2. **Persistence**
    * [ ] Switch ChromaDB to `PersistentClient`.
    * [ ] Configure storage path.

## Phase 4: Frontend Integration & Polish (Days 10-12)

**Goal:** Connect the UI to the enhanced backend.

1. **Error Handling**
    * [ ] Implement Toast notifications for errors (413, 429, etc.).
2. **Progress UI**
    * [ ] Update `ProcessingStatus` to reflect real backend stages if possible (or keep simulated for V1).
3. **Results Display**
    * [ ] Update `ResultsPanel` to match new structured data schema.

---
*Generated based on Research Docs 01-05*

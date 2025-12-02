# Text Extraction Research - PDF, DOCX, and OCR

## Overview

This document outlines the implementation strategies for extracting text from various document formats (PDF, DOCX, Scanned Images) for the CaseStar application.

---

## 1. PDF Text Extraction (PyMuPDF)

### Current Status

- `pymupdf` is listed in `requirements.txt`.
- Code in `main.py` has a TODO placeholder.

### Implementation Strategy

Use `fitz` (PyMuPDF) for high-performance text extraction.

**Code Snippet:**

```python
import fitz  # PyMuPDF

def extract_text_from_pdf(file_content: bytes) -> str:
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    
    # Check if encrypted
    if doc.is_encrypted:
        # Attempt to decrypt with empty password (some PDFs have owner password but no user password)
        doc.authenticate("") 
        if doc.is_encrypted:
             raise ValueError("PDF is password protected")

    for page in doc:
        text += page.get_text()
    
    return text
```

### Handling Scanned PDFs

If `page.get_text()` returns empty strings or very little text, the PDF is likely a scanned image.
**Detection Logic:**

```python
def is_scanned_pdf(doc) -> bool:
    text_length = 0
    for page in doc:
        text_length += len(page.get_text())
    
    # Threshold: if average text per page is < 50 chars, assume scanned
    return (text_length / len(doc)) < 50
```

If detected as scanned, fall back to OCR (see Section 3).

---

## 2. DOCX Text Extraction (python-docx)

### Current Status

- Need to install `python-docx`.

### Implementation Strategy

Use `python-docx` to extract text from paragraphs and tables.

**Installation:**

```bash
pip install python-docx
```

**Code Snippet:**

```python
from docx import Document
import io

def extract_text_from_docx(file_content: bytes) -> str:
    doc = Document(io.BytesIO(file_content))
    full_text = []
    
    # Extract paragraphs
    for para in doc.paragraphs:
        full_text.append(para.text)
        
    # Extract tables
    for table in doc.tables:
        for row in table.rows:
            row_text = [cell.text for cell in row.cells]
            full_text.append(" | ".join(row_text))
            
    return "\n".join(full_text)
```

---

## 3. OCR for Scanned Documents (pytesseract)

### Current Status

- `pytesseract` is in `requirements.txt`.
- Requires Tesseract engine installed on the host system.

### Prerequisites

- Install Tesseract OS dependency:
  - Windows: Download installer from UB-Mannheim
  - Linux: `sudo apt-get install tesseract-ocr`
- Python deps: `pdf2image`, `Pillow`, `pytesseract`

### Implementation Strategy

Convert PDF pages to images, then run OCR.

**Code Snippet:**

```python
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image

def extract_text_via_ocr(file_content: bytes) -> str:
    # Convert PDF to images
    images = convert_from_bytes(file_content)
    text = ""
    
    for image in images:
        # Optional: Preprocessing with OpenCV could go here (grayscale, threshold)
        page_text = pytesseract.image_to_string(image)
        text += page_text + "\n"
        
    return text
```

### Hybrid Workflow

1. Attempt direct extraction via PyMuPDF.
2. Check if text density is low (`is_scanned_pdf`).
3. If low, trigger OCR pipeline.

---

## 4. Unified Extraction Service

Create a utility module `text_extractor.py` to handle routing based on file type.

```python
async def process_document(file: UploadFile) -> str:
    content = await file.read()
    
    if file.filename.endswith('.pdf'):
        try:
            text = extract_text_from_pdf(content)
            if len(text.strip()) < 100:  # Heuristic for scanned
                text = extract_text_via_ocr(content)
            return text
        except Exception as e:
            # Log error
            raise e
            
    elif file.filename.endswith('.docx'):
        return extract_text_from_docx(content)
        
    elif file.filename.endswith('.txt'):
        return content.decode('utf-8')
        
    else:
        raise ValueError("Unsupported file format")
```

---

## References

- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/en/latest/)
- [python-docx Documentation](https://python-docx.readthedocs.io/en/latest/)
- [pytesseract PyPI](https://pypi.org/project/pytesseract/)

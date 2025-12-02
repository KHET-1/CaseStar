# File Upload Validation (Magic Bytes) Research

## Overview

Relying solely on file extensions or `Content-Type` headers is insecure. "Magic bytes" (file signatures) allow us to verify the actual content type of uploaded files.

---

## 1. Magic Bytes Explained

Every file format typically starts with a specific sequence of bytes.

- **PDF**: `%PDF` (Hex: `25 50 44 46`)
- **JPEG**: `FF D8 FF`
- **PNG**: `89 50 4E 47 0D 0A 1A 0A`
- **DOCX**: `PK` (Hex: `50 4B 03 04`) - Same as ZIP, since DOCX is a zipped XML.

---

## 2. Implementation with `python-magic`

### Library

`python-magic` is the standard wrapper for libmagic.
*Note: On Windows, this requires DLLs (`python-magic-bin`).*

**Alternative:** `filetype` library (pure Python, easier dependency management).

### Recommended: `filetype` Library

It is lightweight and doesn't require system-level dependencies like libmagic.

**Installation:**

```bash
pip install filetype
```

**Code Implementation:**

```python
import filetype
from fastapi import HTTPException, UploadFile

async def validate_file_signature(file: UploadFile):
    # Read first 2KB to detect type
    header = await file.read(2048)
    await file.seek(0)  # Reset cursor
    
    kind = filetype.guess(header)
    
    if kind is None:
        raise HTTPException(400, "Cannot determine file type")
        
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
    allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
    
    # Special handling for DOCX (detected as zip)
    if kind.extension == 'zip':
        # Further check if it's a DOCX structure if needed, 
        # or trust it if extension matches .docx
        pass 
    elif kind.mime not in allowed_types:
        raise HTTPException(400, f"Unsupported file type: {kind.mime}")
```

---

## 3. Security Considerations

### Zip Bombs (DOCX)

Since DOCX files are ZIPs, they are vulnerable to Zip Bomb attacks.
*Mitigation:* The file size limit (50MB) implemented in the Security module helps here.

### Polyglot Files

Files that are valid in multiple formats (e.g., a GIF that is also valid JS).
*Mitigation:* Content-Security-Policy (CSP) on frontend, and ensure backend never executes uploaded files, only reads them.

---

## References

- [Filetype PyPI](https://pypi.org/project/filetype/)
- [Magic Numbers (Gary Kessler)](https://www.garykessler.net/library/file_sigs.html)

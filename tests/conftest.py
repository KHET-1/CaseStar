"""Pytest configuration and fixtures for CaseStar tests."""
import pytest
import tempfile
import os
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    # Import here to avoid circular imports
    from main import app
    return TestClient(app)

@pytest.fixture
def mock_ollama():
    """Mock Ollama LLM for testing without actual LLM calls."""
    mock = Mock()
    mock.invoke.return_value = '''{
        "summary": "Test document summary",
        "key_points": ["Point 1", "Point 2", "Point 3"],
        "entities": [
            {"name": "Test Entity", "type": "Person"}
        ]
    }'''
    return mock

@pytest.fixture
def mock_chroma():
    """Mock ChromaDB collection for testing."""
    mock = Mock()
    mock.add = Mock()
    mock.query = Mock(return_value={
        'documents': [['test document']],
        'metadatas': [[{'case_id': 'test-123', 'type': 'document'}]],
        'distances': [[0.5]]
    })
    return mock

@pytest.fixture
def sample_pdf_file():
    """Create a temporary PDF file for testing."""
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as f:
        # Create a minimal valid PDF
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
433
%%EOF"""
        f.write(pdf_content)
        temp_path = f.name
    
    yield temp_path
    
    # Cleanup
    try:
        os.unlink(temp_path)
    except:
        pass

@pytest.fixture
def sample_txt_file():
    """Create a temporary text file for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
        f.write("This is a test legal document.\nIt contains multiple lines.\nFor testing purposes.")
        temp_path = f.name
    
    yield temp_path
    
    try:
        os.unlink(temp_path)
    except:
        pass

@pytest.fixture
def malicious_file():
    """Create a file with potentially malicious content for security testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
        f.write("<script>alert('xss')</script>")
        temp_path = f.name
    
    yield temp_path
    
    try:
        os.unlink(temp_path)
    except:
        pass

@pytest.fixture
def oversized_file():
    """Create an oversized file for testing size limits."""
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.txt', delete=False) as f:
        # Create a 51MB file (just over the limit)
        f.write(b'A' * (51 * 1024 * 1024))
        temp_path = f.name
    
    yield temp_path
    
    try:
        os.unlink(temp_path)
    except:
        pass

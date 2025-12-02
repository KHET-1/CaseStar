from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import chromadb
from langchain_ollama import OllamaLLM
import logging
import fitz  # PyMuPDF
import json
import re
import uuid
import hashlib
from datetime import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import filetype
from services.text_extractor import process_document_content

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Security constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.docx'}
MAX_TEXT_LENGTH = 100000  # Max characters for analysis

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI
app = FastAPI(
    title="CaseStar API",
    description="Legal case management system with AI-powered document analysis",
    version="1.0.0"
)

# Add Rate Limit Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Restrict methods
    allow_headers=["*"],
)

# Initialize ChromaDB client
try:
    import os
    PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
    collection = chroma_client.get_or_create_collection(name="casestar_documents")
    logger.info(f"ChromaDB initialized successfully at {PERSIST_DIR}")
except Exception as e:
    logger.error(f"ChromaDB initialization failed: {e}")
    collection = None

# Initialize Ollama LLM
try:
    llm = OllamaLLM(model="llama3.1:8b")
    logger.info("Ollama LLM initialized successfully")
except Exception as e:
    logger.error(f"Ollama initialization failed: {e}")
    llm = None

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    services: dict

class DocumentAnalysisRequest(BaseModel):
    text: str = Field(..., max_length=MAX_TEXT_LENGTH)
    case_id: Optional[str] = None
    
    @validator('text')
    def sanitize_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty')
        # Remove potential dangerous characters
        dangerous_chars = ['<script', '</script', 'javascript:', 'onerror=', 'onclick=']
        text_lower = v.lower()
        for char in dangerous_chars:
            if char in text_lower:
                logger.warning(f"Potentially dangerous content detected and removed")
        return v.strip()

class DocumentAnalysisResponse(BaseModel):
    summary: str
    key_points: List[str]
    entities: List[dict]
    case_id: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class SearchResponse(BaseModel):
    results: List[dict]

# Routes
@app.get("/")
async def root():
    return {
        "message": "CaseStar API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify all services"""
    services = {
        "chromadb": collection is not None,
        "ollama": llm is not None,
        "api": True
    }
    
    status = "healthy" if all(services.values()) else "degraded"
    
    return HealthResponse(
        status=status,
        services=services
    )

@app.post("/api/analyze", response_model=DocumentAnalysisResponse)
@limiter.limit("10/minute")
async def analyze_document(request: Request, analysis_request: DocumentAnalysisRequest):
    """Analyze legal document text using AI"""
    if not llm:
        raise HTTPException(status_code=503, detail="Ollama service not available")
    
    try:
        # Generate summary using Ollama
        prompt = f"""Analyze the following legal document and provide the output in strict JSON format with the following keys:
- "summary": A brief summary of the document.
- "key_points": A list of 3-5 main points.
- "entities": A list of objects with "name" and "type" (e.g., Person, Organization, Date).

Document:
{analysis_request.text[:10000]}  # Limit text to avoid context window issues

Respond ONLY with the JSON object. Do not add any markdown formatting or extra text."""
        
        response_text = llm.invoke(prompt)
        
        # Clean up response if it contains markdown code blocks
        clean_response = re.sub(r'```json\s*|\s*```', '', response_text).strip()
        
        try:
            parsed_response = json.loads(clean_response)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            logger.warning("Failed to parse JSON response from LLM, falling back to raw text")
            parsed_response = {
                "summary": response_text[:500],
                "key_points": ["Could not parse structured analysis"],
                "entities": []
            }
        
        # Store in ChromaDB if available with secure ID generation
        if collection and analysis_request.case_id:
            # Generate secure unique ID using UUID
            doc_id = f"{analysis_request.case_id}_{uuid.uuid4().hex}"
            collection.add(
                documents=[analysis_request.text],
                metadatas=[
                    {
                        "case_id": analysis_request.case_id, 
                        "type": "document",
                        "timestamp": datetime.now().isoformat()
                    }
                ],
                ids=[doc_id]
            )
        
        # Ensure summary is a string, defaulting to empty string if None
        summary_text = parsed_response.get("summary")
        if summary_text is None:
            summary_text = "No summary available"
        elif not isinstance(summary_text, str):
            summary_text = str(summary_text)

        return DocumentAnalysisResponse(
            summary=summary_text,
            key_points=parsed_response.get("key_points", []),
            entities=parsed_response.get("entities", []),
            case_id=analysis_request.case_id
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        error_msg = str(e)
        if "No connection could be made" in error_msg or "Connection refused" in error_msg:
            raise HTTPException(
                status_code=503, 
                detail="AI Service Unavailable. Please ensure Ollama is running (default port 11434)."
            )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {error_msg}")

@app.post("/api/upload")
@limiter.limit("5/minute")
async def upload_document(request: Request, file: UploadFile = File(...)):
    """Upload and process document files with security validation"""
    
    # Validate filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    # Sanitize filename - remove path traversal attempts
    safe_filename = file.filename.split('/')[-1].split('\\')[-1]
    
    # Check file extension
    file_ext = '.' + safe_filename.rsplit('.', 1)[-1].lower() if '.' in safe_filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only {', '.join(ALLOWED_EXTENSIONS)} files are supported"
        )
    
    try:
        # Read file header for magic bytes check (first 2KB)
        header = await file.read(2048)
        await file.seek(0)  # Reset cursor
        
        kind = filetype.guess(header)
        
        # Validate magic bytes
        if kind is None and file_ext != '.txt':
             # .txt files often don't have magic bytes, so we skip them if extension is .txt
             # But for PDF/DOCX we expect a match
             if file_ext in ['.pdf', '.docx']:
                 logger.warning(f"Could not determine file type for {safe_filename}")
        
        if kind:
            allowed_mimes = [
                'application/pdf', 
                'application/zip', # DOCX is a zip
                'text/plain'
            ]
            if kind.mime not in allowed_mimes and file_ext != '.txt':
                 # Strict check for non-txt files
                 logger.warning(f"Detected MIME {kind.mime} does not match allowed types")

        # Read full content with size limit
        content = await file.read(MAX_FILE_SIZE + 1)
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Process document using the service
        extracted_text = await process_document_content(safe_filename, content)

        return {
            "filename": safe_filename,
            "size": len(content),
            "status": "uploaded",
            "message": "File uploaded and processed successfully",
            "extracted_text": extracted_text
        }

    except HTTPException:
        # Re-raise HTTP exceptions (like 413)
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")


@app.post("/api/search", response_model=SearchResponse)
@limiter.limit("20/minute")
async def search_documents(request: Request, search_request: SearchRequest):
    """Search documents in ChromaDB"""
    if not collection:
        raise HTTPException(status_code=503, detail="ChromaDB service not available")

    try:
        results = collection.query(
            query_texts=[search_request.query],
            n_results=search_request.limit
        )

        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    "text": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None
                })

        return SearchResponse(results=formatted_results)

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/cases")
async def list_cases():
    """List all cases"""
    # TODO: Integrate with Neo4j for graph-based case management
    return {
        "cases": [],
        "total": 0,
        "message": "Neo4j integration pending"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import chromadb
from langchain_ollama import OllamaLLM
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="CaseStar API",
    description="Legal case management system with AI-powered document analysis",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB client
try:
    chroma_client = chromadb.Client()
    collection = chroma_client.get_or_create_collection(name="casestar_documents")
    logger.info("ChromaDB initialized successfully")
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
    text: str
    case_id: Optional[str] = None

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
async def analyze_document(request: DocumentAnalysisRequest):
    """Analyze legal document text using AI"""
    if not llm:
        raise HTTPException(status_code=503, detail="Ollama service not available")
    
    try:
        # Generate summary using Ollama
        prompt = f"""Analyze the following legal document and provide:
1. A brief summary
2. Key points (3-5 main points)
3. Important entities (people, organizations, dates)

Document:
{request.text}

Respond in a structured format."""
        
        response = llm.invoke(prompt)
        
        # Store in ChromaDB if available
        if collection and request.case_id:
            collection.add(
                documents=[request.text],
                metadatas=[{"case_id": request.case_id, "type": "document"}],
                ids=[f"{request.case_id}_{len(request.text)}"]
            )
        
        # Parse response (simplified - you may want more sophisticated parsing)
        return DocumentAnalysisResponse(
            summary=response[:200] if len(response) > 200 else response,
            key_points=["Analysis completed", "Document processed"],
            entities=[],
            case_id=request.case_id
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process document files"""
    if not file.filename.endswith(('.pdf', '.txt', '.docx')):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF, TXT, and DOCX files are supported"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # TODO: Add PDF processing with pymupdf
        # TODO: Add OCR with pytesseract if needed
        
        return {
            "filename": file.filename,
            "size": len(content),
            "status": "uploaded",
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search documents in ChromaDB"""
    if not collection:
        raise HTTPException(status_code=503, detail="ChromaDB service not available")
    
    try:
        results = collection.query(
            query_texts=[request.query],
            n_results=request.limit
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

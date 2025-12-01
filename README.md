# CaseStar 🌟

AI-powered legal case management system with document analysis capabilities.

## Architecture

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.x
- **Vector Database**: ChromaDB
- **LLM**: Ollama (llama3.1:8b)
- **Graph Database**: Neo4j (planned)

## Prerequisites

- Node.js 20+
- Python 3.10+
- Ollama installed with llama3.1:8b model
- (Optional) Neo4j for graph-based case management

## Quick Start

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### 2. Start Development Servers

**Option A: Use the launcher script (Recommended)**
```powershell
.\start-dev.ps1
```

**Option B: Manual start**
```bash
# Terminal 1 - Start FastAPI backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Start Next.js frontend
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Core Endpoints

- `GET /` - API information
- `GET /health` - Service health check
- `POST /api/analyze` - Analyze legal documents with AI
- `POST /api/upload` - Upload document files (PDF, TXT, DOCX)
- `POST /api/search` - Search documents in vector database
- `GET /api/cases` - List all cases

### Example: Analyze Document

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your legal document text here",
    "case_id": "case-123"
  }'
```

## Features

- ✅ AI-powered document analysis using Ollama
- ✅ Vector database storage with ChromaDB
- ✅ RESTful API with FastAPI
- ✅ CORS-enabled for Next.js integration
- ✅ Health monitoring endpoints
- 🚧 Neo4j graph database integration (planned)
- 🚧 Advanced OCR with pytesseract (planned)
- 🚧 PDF processing with pymupdf (planned)

## Project Structure

```
CaseStar/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── start-dev.ps1          # Development launcher script
├── package.json           # Node.js dependencies
├── src/                   # Next.js frontend source
├── public/                # Static assets
└── README.md             # This file
```

## Development

### Backend Development

The FastAPI backend includes:
- Automatic API documentation (Swagger UI)
- Hot reload on code changes
- Structured logging
- Error handling and validation
- CORS middleware for frontend integration

### Frontend Development

The Next.js frontend provides:
- TypeScript support
- Tailwind CSS styling
- Hot module replacement
- Server-side rendering
- Modern React 19 features

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using the port
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 8000

# Kill process by PID
Stop-Process -Id <PID>
```

### Ollama Not Available
```bash
# Install Ollama
# Visit: https://ollama.ai/

# Pull the model
ollama pull llama3.1:8b

# Verify installation
ollama list
```

### ChromaDB Issues
```bash
# Reinstall ChromaDB
pip install --upgrade chromadb
```

## Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

## License

MIT

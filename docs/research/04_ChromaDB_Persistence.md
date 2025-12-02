# ChromaDB Persistence & Backup Research

## Overview

This document covers configuration for persistent vector storage and backup strategies for ChromaDB in the CaseStar application.

---

## 1. Persistence Configuration

### Current State

`main.py` currently initializes ChromaDB with `chromadb.Client()`, which is often ephemeral (in-memory) depending on defaults.

### Implementation

To ensure data survives restarts, we must specify a `persist_directory`.

**Code Update:**

```python
import chromadb
import os

# Configuration
PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Initialize
chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
collection = chroma_client.get_or_create_collection(name="casestar_documents")
```

*Note: `chromadb.Client()` in newer versions acts as a factory. Explicitly using `PersistentClient` is safer for clarity.*

---

## 2. Docker Configuration

When we containerize the app, the persist directory must be mounted as a volume.

**docker-compose.yml snippet:**

```yaml
services:
  backend:
    volumes:
      - ./chroma_data:/app/chroma_db
```

---

## 3. Backup Strategies

### Strategy A: Filesystem Backup (Cold Backup)

Since ChromaDB (SQLite + Parquet) relies on files, the safest backup is copying the directory when the process is stopped.

**Script (`scripts/backup_chroma.ps1`):**

```powershell
$Source = "./chroma_db"
$Dest = "./backups/chroma_$(Get-Date -Format 'yyyyMMdd_HHmm')"
Copy-Item -Path $Source -Destination $Dest -Recurse
```

### Strategy B: Hot Backup (Riskier)

Copying SQLite files while the database is active can lead to corruption (WAL file issues).
*Recommendation: Use Strategy A during maintenance windows.*

### Strategy C: Data Export (Logical Backup)

Query all data and dump to JSON.

```python
all_data = collection.get()
# Serialize all_data to JSON
```

*Pros:* Portable.
*Cons:* Slow for large datasets; vectors might need re-computation if not exported raw.

---

## 4. Collection Management

### Schema Evolution

ChromaDB is schema-less regarding metadata, but if we change embedding models, we must re-index.
*Best Practice:* Store the embedding model name in the collection metadata.

```python
collection = chroma_client.get_or_create_collection(
    name="casestar_documents",
    metadata={"hnsw:space": "cosine", "model": "nomic-embed-text"}
)
```

---

## References

- [ChromaDB Usage Guide](https://docs.trychroma.com/usage-guide)
- [ChromaDB Persistence](https://docs.trychroma.com/usage-guide#saving-to-disk)

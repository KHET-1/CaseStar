# LLM Structured Output & Parsing Research

## Overview

This document details how to force Ollama (llama3.1) to return structured JSON data and how to parse it effectively for the CaseStar application.

---

## 1. Ollama JSON Mode

### Concept

Ollama supports a `format='json'` parameter in API calls. This constrains the model output to valid JSON. However, the model still needs a schema definition in the prompt to know *what* JSON structure to generate.

### Implementation

**Prompt Engineering:**

```python
system_prompt = """
You are a legal AI assistant. Analyze the document and return a JSON object with the following structure:
{
    "summary": "string",
    "key_points": ["string", "string"],
    "entities": [
        {"name": "string", "type": "PERSON|ORG|DATE", "context": "string"}
    ],
    "risk_level": "LOW|MEDIUM|HIGH"
}
"""
```

**LangChain Integration:**
Using `ChatOllama` with `format="json"`.

```python
from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from typing import List

# Define Pydantic Model
class Entity(BaseModel):
    name: str
    type: str
    context: str

class AnalysisResult(BaseModel):
    summary: str
    key_points: List[str]
    entities: List[Entity]
    risk_level: str

# Setup Parser
parser = JsonOutputParser(pydantic_object=AnalysisResult)

# Setup LLM
llm = ChatOllama(
    model="llama3.1:8b",
    format="json",
    temperature=0
)

# Setup Prompt
prompt = PromptTemplate(
    template="Analyze the following legal text.\n{format_instructions}\n\nText:\n{text}",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# Chain
chain = prompt | llm | parser

# Execution
result = chain.invoke({"text": document_text})
```

---

## 2. Entity Extraction Strategy

### Challenges

- Llama 3.1 8b is capable but may hallucinate JSON syntax if context is too long.
- "Entities" definition needs to be strict for legal context (Plaintiff, Defendant, Judge, etc., vs just "Person").

### Refined Schema for Legal Context

Instead of generic types, use specific legal roles:

```json
"entities": [
    {"name": "John Doe", "role": "PLAINTIFF"},
    {"name": "Acme Corp", "role": "DEFENDANT"},
    {"name": "2023-01-01", "role": "CONTRACT_DATE"}
]
```

---

## 3. Streaming Structured Data

### Problem

Waiting for full JSON generation creates latency.

### Solution

Use `PartialJsonOutputParser` (if available) or stream raw tokens and attempt partial parsing on the frontend.
*Note: For V1, standard request/response is safer to ensure valid JSON.*

---

## 4. Fallback & Validation

### Validation

Since `JsonOutputParser` uses Pydantic, it will raise validation errors if the LLM output doesn't match the schema.

### Retry Logic

If validation fails, use an "OutputFixingParser" or a simple retry loop that feeds the error back to the LLM.

```python
try:
    result = chain.invoke(...)
except OutputParserException:
    # Retry logic here
    pass
```

---

## References

- [Ollama JSON Mode Docs](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion)
- [LangChain JsonOutputParser](https://python.langchain.com/docs/modules/model_io/output_parsers/types/json)

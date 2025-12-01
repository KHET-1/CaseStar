// API client for CaseStar backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Entity {
  name: string;
  type?: string;
  [key: string]: unknown;
}

export interface AnalysisResult {
  summary: string;
  key_points: string[];
  entities: Entity[];
  case_id?: string;
}

export interface UploadResult {
  filename: string;
  size: number;
  status: string;
  message: string;
  extracted_text?: string;
}

export interface SearchResult {
  text: string;
  metadata: Record<string, unknown>;
  distance: number | null;
}

/**
 * Upload a document file to the backend
 */
export async function uploadDocument(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Analyze document text with AI
 */
export async function analyzeDocument(
  text: string,
  caseId?: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      case_id: caseId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
}

/**
 * Search for similar documents
 */
export async function searchDocuments(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Search failed');
  }

  const data = await response.json();
  return data.results;
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{
  status: string;
  services: Record<string, boolean>;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

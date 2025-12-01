"""API endpoint tests for CaseStar."""
import pytest
from unittest.mock import patch, Mock
import io

@pytest.mark.api
class TestHealthEndpoint:
    """Test the health check endpoint."""
    
    def test_health_check_returns_200(self, client):
        """Test that health check returns 200."""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_health_check_structure(self, client):
        """Test health check response structure."""
        response = client.get("/health")
        data = response.json()
        
        assert "status" in data
        assert "services" in data
        assert isinstance(data["services"], dict)
    
    def test_health_check_services(self, client):
        """Test that health check reports service status."""
        response = client.get("/health")
        data = response.json()
        services = data["services"]
        
        # Should have these services
        assert "chromadb" in services
        assert "ollama" in services
        assert "api" in services
        
        # API should always be true if we got a response
        assert services["api"] is True


@pytest.mark.api
class TestRootEndpoint:
    """Test the root endpoint."""
    
    def test_root_returns_200(self, client):
        """Test that root endpoint returns 200."""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_root_response_structure(self, client):
        """Test root response has expected structure."""
        response = client.get("/")
        data = response.json()
        
        assert "message" in data
        assert "version" in data
        assert "docs" in data


@pytest.mark.api
class TestAnalyzeEndpoint:
    """Test the /api/analyze endpoint."""
    
    @patch('main.llm')
    @patch('main.collection')
    def test_analyze_success(self, mock_collection, mock_llm, client):
        """Test successful document analysis."""
        mock_llm.invoke.return_value = '''{
            "summary": "This is a test summary",
            "key_points": ["Point 1", "Point 2"],
            "entities": [{"name": "Test", "type": "Person"}]
        }'''
        
        response = client.post(
            "/api/analyze",
            json={"text": "Test legal document content"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "summary" in data
        assert "key_points" in data
        assert "entities" in data
    
    @patch('main.llm')
    def test_analyze_with_case_id(self, mock_llm, client):
        """Test analysis with case_id."""
        mock_llm.invoke.return_value = '{"summary": "test", "key_points": [], "entities": []}'
        
        response = client.post(
            "/api/analyze",
            json={"text": "Test document", "case_id": "case-123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("case_id") == "case-123"
    
    def test_analyze_missing_text(self, client):
        """Test analysis without text field."""
        response = client.post(
            "/api/analyze",
            json={}
        )
        assert response.status_code == 422
    
    def test_analyze_empty_text(self, client):
        """Test analysis with empty text."""
        response = client.post(
            "/api/analyze",
            json={"text": ""}
        )
        assert response.status_code == 422
    
    @patch('main.llm')
    def test_analyze_llm_unavailable(self, mock_llm, client):
        """Test analysis when LLM is unavailable."""
        # Simulate LLM being None
        with patch('main.llm', None):
            response = client.post(
                "/api/analyze",
                json={"text": "Test document"}
            )
            assert response.status_code == 503
    
    @patch('main.llm')
    def test_analyze_llm_error(self, mock_llm, client):
        """Test analysis when LLM throws error."""
        mock_llm.invoke.side_effect = Exception("LLM error")
        
        response = client.post(
            "/api/analyze",
            json={"text": "Test document"}
        )
        assert response.status_code == 500
    
    @patch('main.llm')
    def test_analyze_invalid_json_response(self, mock_llm, client):
        """Test handling of invalid JSON from LLM."""
        mock_llm.invoke.return_value = "This is not valid JSON"
        
        response = client.post(
            "/api/analyze",
            json={"text": "Test document"}
        )
        
        # Should handle gracefully with fallback
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data


@pytest.mark.api
class TestUploadEndpoint:
    """Test the /api/upload endpoint."""
    
    def test_upload_text_file(self, client, sample_txt_file):
        """Test uploading a text file."""
        with open(sample_txt_file, 'rb') as f:
            response = client.post(
                "/api/upload",
                files={"file": ("test.txt", f, "text/plain")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "filename" in data
        assert "size" in data
        assert "status" in data
        assert "message" in data
        assert data["status"] == "uploaded"
    
    def test_upload_pdf_file(self, client, sample_pdf_file):
        """Test uploading a PDF file."""
        with open(sample_pdf_file, 'rb') as f:
            response = client.post(
                "/api/upload",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "uploaded"
    
    def test_upload_missing_file(self, client):
        """Test upload without file."""
        response = client.post("/api/upload")
        assert response.status_code == 422
    
    def test_upload_invalid_extension(self, client):
        """Test upload with invalid file extension."""
        fake_file = io.BytesIO(b"test content")
        response = client.post(
            "/api/upload",
            files={"file": ("test.exe", fake_file, "application/x-msdownload")}
        )
        assert response.status_code == 400
    
    def test_upload_extracted_text_returned(self, client, sample_txt_file):
        """Test that extracted text is returned."""
        with open(sample_txt_file, 'rb') as f:
            response = client.post(
                "/api/upload",
                files={"file": ("test.txt", f, "text/plain")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "extracted_text" in data
        assert len(data["extracted_text"]) > 0
    
    def test_upload_file_size_reported(self, client, sample_txt_file):
        """Test that file size is correctly reported."""
        with open(sample_txt_file, 'rb') as f:
            file_content = f.read()
            expected_size = len(file_content)
            f.seek(0)
            
            response = client.post(
                "/api/upload",
                files={"file": ("test.txt", f, "text/plain")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["size"] == expected_size


@pytest.mark.api
class TestSearchEndpoint:
    """Test the /api/search endpoint."""
    
    @patch('main.collection')
    def test_search_success(self, mock_collection, client):
        """Test successful search."""
        mock_collection.query.return_value = {
            'documents': [['test document']],
            'metadatas': [[{'case_id': 'test-123', 'type': 'document'}]],
            'distances': [[0.5]]
        }
        
        response = client.post(
            "/api/search",
            json={"query": "test query"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
    
    @patch('main.collection')
    def test_search_with_limit(self, mock_collection, client):
        """Test search with custom limit."""
        mock_collection.query.return_value = {
            'documents': [[]],
            'metadatas': [[]],
            'distances': [[]]
        }
        
        response = client.post(
            "/api/search",
            json={"query": "test", "limit": 10}
        )
        
        assert response.status_code == 200
        # Verify limit was passed to collection.query
        mock_collection.query.assert_called_once()
        call_kwargs = mock_collection.query.call_args[1]
        assert call_kwargs['n_results'] == 10
    
    def test_search_missing_query(self, client):
        """Test search without query."""
        response = client.post(
            "/api/search",
            json={}
        )
        assert response.status_code == 422
    
    def test_search_chromadb_unavailable(self, client):
        """Test search when ChromaDB is unavailable."""
        with patch('main.collection', None):
            response = client.post(
                "/api/search",
                json={"query": "test"}
            )
            assert response.status_code == 503
    
    @patch('main.collection')
    def test_search_error_handling(self, mock_collection, client):
        """Test search error handling."""
        mock_collection.query.side_effect = Exception("Search error")
        
        response = client.post(
            "/api/search",
            json={"query": "test"}
        )
        assert response.status_code == 500


@pytest.mark.api
class TestCasesEndpoint:
    """Test the /api/cases endpoint."""
    
    def test_cases_endpoint_exists(self, client):
        """Test that cases endpoint exists."""
        response = client.get("/api/cases")
        assert response.status_code == 200
    
    def test_cases_response_structure(self, client):
        """Test cases response structure."""
        response = client.get("/api/cases")
        data = response.json()
        
        assert "cases" in data
        assert "total" in data
        assert isinstance(data["cases"], list)
    
    def test_cases_neo4j_pending(self, client):
        """Test that Neo4j integration is noted as pending."""
        response = client.get("/api/cases")
        data = response.json()
        
        # Should indicate Neo4j is pending
        assert "message" in data
        assert "neo4j" in data["message"].lower() or "pending" in data["message"].lower()


@pytest.mark.api
class TestCORSConfiguration:
    """Test CORS configuration."""
    
    def test_cors_allows_localhost_3000(self, client):
        """Test that CORS allows localhost:3000."""
        # Note: TestClient may not fully simulate CORS, but we test what we can
        response = client.options(
            "/api/analyze",
            headers={"Origin": "http://localhost:3000"}
        )
        # Should not return 403
        assert response.status_code != 403
    
    def test_cors_methods_configured(self, client):
        """Test that CORS methods are configured."""
        response = client.options("/api/upload")
        # Should allow OPTIONS
        assert response.status_code in [200, 405]  # 405 if endpoint doesn't handle OPTIONS


@pytest.mark.api
class TestEndpointValidation:
    """Test general endpoint validation."""
    
    def test_404_on_nonexistent_endpoint(self, client):
        """Test that nonexistent endpoints return 404."""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404
    
    def test_method_not_allowed(self, client):
        """Test that wrong HTTP methods are rejected."""
        # Try GET on POST endpoint
        response = client.get("/api/analyze")
        assert response.status_code in [405, 422]
    
    def test_trailing_slash_handling(self, client):
        """Test handling of trailing slashes."""
        response1 = client.get("/health")
        response2 = client.get("/health/")
        
        # Both should work or redirect
        assert response1.status_code in [200, 307, 308]
        assert response2.status_code in [200, 307, 308, 404]

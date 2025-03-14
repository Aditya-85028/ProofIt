import pytest
from fastapi.testclient import TestClient
from main import app
import json
import os
from typing import Generator, Dict, Any

@pytest.fixture
def api_client() -> TestClient:
    """Fixture for FastAPI test client"""
    return TestClient(app)

@pytest.fixture
def lambda_context():
    """Mock AWS Lambda context"""
    class LambdaContext:
        def __init__(self):
            self.function_name = "test-function"
            self.function_version = "1"
            self.invoked_function_arn = "arn:aws:lambda:us-east-1:123456789012:function:test-function"
            self.memory_limit_in_mb = 128
            self.aws_request_id = "test-request-id"
            self.log_group_name = "/aws/lambda/test-function"
            self.log_stream_name = "2023/03/14/[$LATEST]123456789"

    return LambdaContext()

@pytest.fixture
def lambda_event() -> Dict[Any, Any]:
    """Mock API Gateway Lambda event"""
    return {
        "version": "2.0",
        "routeKey": "GET /habits",
        "rawPath": "/habits",
        "rawQueryString": "",
        "headers": {
            "accept": "*/*",
            "content-length": "0",
            "host": "api.example.com",
            "user-agent": "curl/7.64.1",
            "x-amzn-trace-id": "Root=1-123456789-123456789",
            "x-forwarded-for": "127.0.0.1",
            "x-forwarded-port": "443",
            "x-forwarded-proto": "https"
        },
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "domainName": "api.example.com",
            "domainPrefix": "api",
            "http": {
                "method": "GET",
                "path": "/habits",
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "curl/7.64.1"
            },
            "requestId": "request-id",
            "routeKey": "GET /habits",
            "stage": "$default",
            "time": "14/Mar/2023:05:31:23 +0000",
            "timeEpoch": 1678774283
        },
        "isBase64Encoded": False
    }

@pytest.fixture
def mock_aws_credentials():
    """Mock AWS credentials for testing"""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    yield
    del os.environ["AWS_ACCESS_KEY_ID"]
    del os.environ["AWS_SECRET_ACCESS_KEY"]
    del os.environ["AWS_DEFAULT_REGION"] 
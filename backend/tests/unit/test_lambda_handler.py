import pytest
from main import handler
import json

def test_lambda_handler_habits_endpoint(lambda_event, lambda_context, mock_aws_credentials):
    """Test the Lambda handler with the /habits endpoint"""
    # Call the handler with our test event
    response = handler(lambda_event, lambda_context)
    
    # Check the response structure
    assert response["statusCode"] == 200
    assert "body" in response
    
    # Parse the JSON body
    body = json.loads(response["body"])
    assert "Hello" in body
    assert body["Hello"] == "World"

def test_lambda_handler_invalid_route(lambda_event, lambda_context, mock_aws_credentials):
    """Test the Lambda handler with an invalid route"""
    # Modify the event to use an invalid route
    lambda_event["routeKey"] = "GET /invalid"
    lambda_event["rawPath"] = "/invalid"
    
    # Call the handler
    response = handler(lambda_event, lambda_context)
    
    # Check that we get a 404 response
    assert response["statusCode"] == 404

def test_lambda_handler_headers(lambda_event, lambda_context, mock_aws_credentials):
    """Test that the Lambda handler sets appropriate headers"""
    response = handler(lambda_event, lambda_context)
    
    # Check for CORS and content type headers
    assert "headers" in response
    assert response["headers"]["Content-Type"] == "application/json"
    assert "Access-Control-Allow-Origin" in response["headers"] 
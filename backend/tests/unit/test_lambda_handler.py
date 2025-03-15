import pytest
from main import handler,app
import json

def test_lambda_handler_habits_endpoint(lambda_event, lambda_context, mock_aws_credentials):
    """Test the Lambda handler with the /habits endpoint"""
    # Add user_id to the query string
    lambda_event["rawQueryString"] = "user_id=1"
    
    # Call the handler with our test event
    response = handler(lambda_event, lambda_context)
    
    # Check the response structure
    assert response["statusCode"] == 200
    assert "body" in response
    
    # Parse the JSON body
    body = json.loads(response["body"])
    assert "habits" in body
    assert isinstance(body["habits"], list)

#Will add later :) 
# def test_lambda_handler_invalid_route(lambda_event, lambda_context, mock_aws_credentials):
#     """Test the Lambda handler with an invalid route"""
#     # Modify the event to use an invalid route
#     lambda_event["routeKey"] = "GET /invalid"
#     lambda_event["rawPath"] = "/invalid"
    
#     # Call the handler
#     response = handler(lambda_event, lambda_context)
    
#     # Check that we get a 404 response
#     assert response["statusCode"] == 404

def test_lambda_handler_headers(lambda_event, lambda_context, mock_aws_credentials):
    """Test that the Lambda handler sets appropriate headers"""
    # Add user_id to the query string
    lambda_event["rawQueryString"] = "user_id=1"
    
    response = handler(lambda_event, lambda_context)
    print(response)
    
    # Check for CORS and content type headers
    assert "headers" in response
    assert response["headers"]["content-type"] == "application/json"

def test_lambda_handler_missing_user_id(lambda_event, lambda_context, mock_aws_credentials):
    """Test the Lambda handler when user_id is missing"""
    # Call the handler without user_id
    response = handler(lambda_event, lambda_context)
    
    # Should return 422 Unprocessable Entity
    assert response["statusCode"] == 422 
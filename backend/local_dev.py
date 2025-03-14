import uvicorn
from main import app
import os
import boto3
import aioboto3
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

def setup_local_aws():
    """Setup local AWS credentials if needed"""
    if not os.getenv('AWS_ACCESS_KEY_ID'):
        print("⚠️  No AWS credentials found. Using dummy values for local development.")
        os.environ['AWS_ACCESS_KEY_ID'] = 'dummy'
        os.environ['AWS_SECRET_ACCESS_KEY'] = 'dummy'
        os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'

def main():
    """Run the FastAPI application locally"""
    setup_local_aws()
    
    # Print helpful information
    print("🚀 Starting local development server...")
    print("📝 API Documentation available at:")
    print("   - http://localhost:8000/docs (Swagger UI)")
    print("   - http://localhost:8000/redoc (ReDoc)")
    print("\n💡 The API will behave similarly to when deployed on Lambda")
    print("   but you can now debug and test changes instantly!")
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Enable auto-reload on code changes
    )

if __name__ == "__main__":
    main() 
import uvicorn
from main import app
import boto3
import subprocess
import json
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

def setup_local_aws():
    """Ensure AWS SSO credentials are available before running the app"""
    profile = "default"

    try:
        # Check if the profile is logged in
        session = boto3.Session(profile_name=profile)
        sts_client = session.client("sts")

        # Verify if credentials are valid
        identity = sts_client.get_caller_identity()
        print(f"✅ Using AWS SSO credentials for account: {identity['Account']} (User: {identity['Arn']})")

    except Exception as e:
        print(f"⚠️  AWS SSO session expired or invalid. Attempting to refresh...\nError: {e}")

        # Run AWS SSO login if needed
        try:
            subprocess.run(["aws", "sso", "login", "--profile", profile], check=True)
            print("✅ AWS SSO session refreshed successfully!")
        except subprocess.CalledProcessError:
            print("❌ AWS SSO login failed. Please run `aws sso login --profile default` manually.")

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

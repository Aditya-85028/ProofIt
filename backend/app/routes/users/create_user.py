from fastapi import APIRouter, Query, HTTPException
import boto3
from datetime import datetime
import botocore

router = APIRouter()

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("hb-user-table")

# Initialize S3 client
s3_client = boto3.client("s3")
BUCKET_NAME = "hb-user-posts"

@router.post("/create_user")
def create_user(
    user_id: str = Query(..., description="User's unique Cognito ID"),
    phone_number: str = Query(..., description="User's phone number (email used temporarily)")
):
    try:
        print(f"🔍 Checking for user: {user_id}, {phone_number}")

        # Check if the user already exists
        response = table.get_item(Key={"user_id": user_id})
        
        # Create user folder in S3 if it doesn't exist
        try:
            # Check if the user folder exists in S3
            s3_client.head_object(Bucket=BUCKET_NAME, Key=f"{user_id}/")
            print(f"✅ User folder already exists in S3 for user: {user_id}")
        except botocore.exceptions.ClientError as e:
            if e.response['Error']['Code'] == '404':
                # Create an empty object with a trailing slash to create a folder
                s3_client.put_object(Bucket=BUCKET_NAME, Key=f"{user_id}/")
                print(f"✅ Created user folder in S3 for user: {user_id}")
            else:
                print(f"❌ S3 error: {e}")

        if "Item" in response:
            return {"message": "User already exists", "user": response["Item"]}

        # Create a new user entry
        table.put_item(Item={
            "user_id": user_id,
            "phone_number": phone_number,
            "created_at": datetime.utcnow().isoformat(),
            "habits": [],
            "display_name": "Adi",
            "color_preference": "green"
        })

        return {"message": "User created successfully", "user_id": user_id, "s3_folder": f"{BUCKET_NAME}/{user_id}/"}

    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
from fastapi import APIRouter, Query, HTTPException
import boto3
from datetime import datetime

router = APIRouter()

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("hb-user-table")

@router.post("/create_user")
def create_user(
    user_id: str = Query(..., description="User's unique Cognito ID"),
    phone_number: str = Query(..., description="User's phone number (email used temporarily)")
):
    try:
        print(f"🔍 Checking for user: {user_id}, {phone_number}")

        # Check if the user already exists
        response = table.get_item(Key={"user_id": user_id, "phone_number": phone_number})

        if "Item" in response:
            return {"message": "User already exists", "user": response["Item"]}

        # Create a new user entry
        table.put_item(Item={
            "user_id": user_id,
            "phone_number": phone_number,
            "created_at": datetime.utcnow().isoformat()
        })

        return {"message": "User created successfully", "user_id": user_id}

    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

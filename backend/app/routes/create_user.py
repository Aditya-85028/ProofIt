from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

router = APIRouter()

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("hb-user-table")

@router.post("/create_user")
def create_user(
    user_id: str = Query(..., description="User's unique Cognito ID"),
    email: str = Query(..., description="User's email address")
):
    try:
        print(f"🔍 Checking for user: {user_id}, {email}")

        # ✅ Use plain strings, not {"S": "value"}
        response = table.get_item(Key={"user_id": user_id, "email": email})


        if "Item" in response:
            return {"message": "User already exists", "user": response["Item"]}

        # ✅ Create new user
        table.put_item(Item={
            "user_id": user_id,
            "email": email,
            "created_at": datetime.utcnow().isoformat()
        })

        return {"message": "User created successfully", "user_id": user_id}

    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

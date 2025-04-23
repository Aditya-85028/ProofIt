from fastapi import APIRouter, Query, HTTPException
import boto3
from datetime import datetime

router = APIRouter()

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("hb-user-table")

@router.get("/get_user")
def get_user(
    user_id: str = Query(..., description="User's unique Cognito ID")
):
    try:
        print(f"🔍 Getting user data for: {user_id}")
        
        # Get the user from DynamoDB
        response = table.get_item(Key={"user_id": user_id})
        
        # Check if user exists
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_data = response["Item"]
        
        return {
            "user_id": user_data["user_id"],
            "phone_number": user_data["phone_number"],
            "created_at": user_data["created_at"],
            "habits": user_data.get("habits", []),
            "display_name": user_data.get("display_name", "User"),
            "color_preference": user_data.get("color_preference", "green"),
            "error": None
        }

    except Exception as e:
        print(f"❌ Error getting user: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting user: {str(e)}") 
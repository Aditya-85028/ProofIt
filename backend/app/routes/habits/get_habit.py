from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key

router = APIRouter()

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")

@router.get("/get_habit")
def get_user_habits(
    user_id: str = Query(..., description="User's unique ID")
):
    """Fetch all habits for a specific user from DynamoDB."""
    try:
        # Query the habits table for all habits with the given user_id
        response = habit_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        
        habits = response.get("Items", [])
        
        if not habits:
            return {"message": "No habits found for this user", "habits": []}
        
        return {"habits": habits}
        
    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")
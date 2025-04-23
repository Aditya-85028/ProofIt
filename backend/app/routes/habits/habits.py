from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key

router = APIRouter()

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")

@router.get("/habits")
def get_all_habits():
    """Fetch all habits from DynamoDB (admin endpoint)."""
    try:
        # Scan the habits table for all habits
        response = habit_table.scan()
        
        habits = response.get("Items", [])
        
        if not habits:
            return {"message": "No habits found", "habits": []}
        
        return {"habits": habits}
        
    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")
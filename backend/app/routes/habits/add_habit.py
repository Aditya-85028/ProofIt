from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime
import uuid

router = APIRouter()

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")
user_table = dynamodb.Table("hb-user-table")

@router.post("/add_habit")
def add_habit(
    user_id: str = Query(..., description="User's unique ID"),
    habit_name: str = Query(..., description="Name of the habit"),
    cadence: int = Query(..., description="Frequency in days (1-7)", ge=1, le=7),
    color: str = Query(..., description="Color for the habit")
):
    """Add a new habit for a user in DynamoDB."""
    try:
        # Validate cadence
        if not 1 <= cadence <= 7:
            raise HTTPException(status_code=400, detail="Cadence must be between 1 and 7 days")
            
        # Generate a unique habit_id
        habit_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        
        # Add the habit to habit table in DynamoDB with new fields
        habit_table.put_item(Item={
            "user_id": user_id,
            "habit_id": habit_id,
            "habit_name": habit_name,
            "color": color,
            "cadence": cadence,
            "completed_dates": {},  # Empty list for completed dates
            "reminder": True,  # Default reminder setting
            "streak": 0,  # Initial streak count
            "created_at": created_at
        })
        # Update the user's habits list in the user table
        try:
            # Use update_item with list_append to add the habit_id to the user's habits list
            print("Fetched user before update:")
            user_table.update_item(
                Key={"user_id": user_id},
                UpdateExpression="SET habits = list_append(habits, :habit_id)",
                ExpressionAttributeValues={
                    ":habit_id": [habit_id]
                },
                ReturnValues="UPDATED_NEW"
            )
            print(f"✅ Added habit_id {habit_id} to user's habits list")
        except Exception as e:
            print(f"❌ Error updating user's habits list: {e}")
            # If updating the user table fails, we should still return success for the habit creation
            # but log the error for debugging
            pass
        
        return {
            "message": "Habit added successfully",
            "habit_id": habit_id,
            "habit_name": habit_name,
            "color": color,
            "cadence": cadence,
            "created_at": created_at
        }
        
    except Exception as e:
        print(f"❌ DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail=f"Error adding habit: {str(e)}")
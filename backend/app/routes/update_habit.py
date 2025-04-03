from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import boto3
from boto3.dynamodb.conditions import Key
import os
import uuid
from datetime import datetime

router = APIRouter()

# Initialize DynamoDB resource

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
habit_table = dynamodb.Table("hb-habits-table")

@router.put("/update_habit")
async def update_habit(
    user_id: str = Query(..., description="User ID"),
    habit_id: str = Query(..., description="Habit ID to update"),
    habit_name: str = Query(..., description="Updated habit name"),
    cadence: str = Query("1", description="How often the habit should be performed (1-7 days)"),
    color: Optional[str] = Query("#4CAF50", description="Color for the habit")
):
    """Update an existing habit for a user"""
    try:
        # Validate cadence
        try:
            cadence_int = int(cadence)
            if cadence_int < 1 or cadence_int > 7:
                raise HTTPException(status_code=400, detail="Cadence must be between 1 and 7 days")
        except ValueError:
            raise HTTPException(status_code=400, detail="Cadence must be a number between 1 and 7")
        
        # Check if the habit exists
        response = habit_table.query(
            KeyConditionExpression=Key('user_id').eq(user_id) & Key('habit_id').eq(habit_id)
        )
        
        if not response['Items']:
            raise HTTPException(status_code=404, detail=f"Habit with ID {habit_id} not found for user {user_id}")
        
        # Update the habit
        update_response = habit_table.update_item(
            Key={
                'user_id': user_id,
                'habit_id': habit_id
            },
            UpdateExpression="set habit_name = :name, cadence = :cadence, color = :color, updated_at = :updated_at",
            ExpressionAttributeValues={
                ':name': habit_name,
                ':cadence': cadence,
                ':color': color,
                ':updated_at': datetime.now().isoformat()
            },
            ReturnValues="UPDATED_NEW"
        )
        
        return {
            "status": "success",
            "message": "Habit updated successfully",
            "updated_habit": {
                "habit_id": habit_id,
                "habit_name": habit_name,
                "cadence": cadence,
                "color": color
            }
        }
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error updating habit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update habit: {str(e)}")
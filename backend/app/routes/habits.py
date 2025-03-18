import boto3
from fastapi import APIRouter, HTTPException, Query
from boto3.dynamodb.conditions import Key


router = APIRouter(prefix="habits", tags=["Habits"])
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")  # Ensure correct region
table = dynamodb.Table("HabbitUserTable")  # Ensure the correct table name

@router.get("/")
async def get_user_habits(user_id: str = Query(..., description="User ID to fetch habits")):
    try:

        # Query DynamoDB for user's habits
        response = table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )

        # Extract habits from response
        habits = response.get("Items", [])

        if not habits:
            return {"message": "No habits found for this user.", "habits": []}


        return {"habits": habits}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")
from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key

router = APIRouter()

@router.get("/habits")
def get_habits(phone_number: str = Query(..., description="User's phone number")):
    """Fetch habits from DynamoDB based on phone number."""
    try:
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.Table("hb-user-table")

        response = table.query(
            KeyConditionExpression=Key("phone_number").eq(phone_number)
        )

        habits = response.get("Items", [])
        if not habits:
            return {"message": "User not found", "habits": []}

        return {"habits": habits}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")

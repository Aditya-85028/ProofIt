import boto3
from boto3.dynamodb.conditions import Key
from fastapi import HTTPException

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
HABIT_TABLE = "HabbitHabits"  # Change this to your actual DynamoDB table name
table = dynamodb.Table(HABIT_TABLE)

def create_habit(user_id: str, habit_name: str):
    """ Adds a new habit to the DynamoDB table. """
    try:
        table.put_item(
            Item={
                "user_id": user_id,
                "habit_name": habit_name,
                "streak": 0,
                "last_completed": None,
            }
        )
        return {"message": "Habit created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_habits(user_id: str):
    """ Retrieves all habits for a given user. """
    try:
        response = table.query(KeyConditionExpression=Key("user_id").eq(user_id))
        return response.get("Items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_streak(user_id: str, habit_name: str):
    """ Updates the streak for a user's habit. """
    try:
        response = table.update_item(
            Key={"user_id": user_id, "habit_name": habit_name},
            UpdateExpression="SET streak = streak + :inc",
            ExpressionAttributeValues={":inc": 1},
            ReturnValues="UPDATED_NEW"
        )
        return response.get("Attributes", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

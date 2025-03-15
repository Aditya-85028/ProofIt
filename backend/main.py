from fastapi import FastAPI, Request, Query, HTTPException
import logging
import boto3
from boto3.dynamodb.conditions import Key
from mangum import Mangum


#from app.routes import users, habits, upload

app = FastAPI()


# Include API routes
@app.get("/habits")
def hello(user_id):
    try:
        dynamodb = boto3.resource("dynamodb", region_name="us-west-1")  # Ensure correct region
        table = dynamodb.Table("HabbitUserTable")  # Ensure the correct table name

        # Query DynamoDB for user's habits
        response = table.query(
            KeyConditionExpression=Key("user_id").eq(str(user_id))
        )

        # Extract habits from response
        habits = response.get("Items", [])

        if not habits:
            return {"message": "No habits found for this user.", "habits": []}


        return {"habits": habits}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")


# AWS Lambda handler
handler = Mangum(app)

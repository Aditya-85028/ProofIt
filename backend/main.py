from fastapi import FastAPI, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key
from mangum import Mangum

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Lambda!"}

@app.get("/habits")
def get_habits(phone_number: str = Query(..., description="User's phone number")):
    """Fetch habits from DynamoDB based on phone number."""
    try:
        
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.Table("hb-user-table")

        # Query DynamoDB
        response = table.query(
            KeyConditionExpression=Key("phone_number").eq(phone_number)
        )

        habits = response.get("Items", [])
        if not habits:
            return {"message": "User not found", "habits": []}

        return {"habits": habits}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")

# AWS Lambda handler
handler = Mangum(app)

from fastapi import APIRouter, Query, HTTPException
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

router = APIRouter()

# Initialize DynamoDB resource
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
posts_table = dynamodb.Table("hb-posts-table")

@router.get("/get_posts")
async def get_user_posts(
    user_id: str = Query(..., description="User's unique ID"),
    habit_id: str = Query(None, description="Optional habit ID to filter posts")
):
    """Fetch all posts for a specific user, optionally filtered by habit_id"""
    try:
        # Base query expression for userId (new primary key)
        key_condition = Key("user_id").eq(user_id)
        
        # Query the posts table
        response = posts_table.query(
            KeyConditionExpression=key_condition,
            ScanIndexForward=False  # Sort by most recent first based on post_id (sort key)
        )
        
        posts = response.get("Items", [])
        
        # If habit_id is provided, filter the results using habitId field
        if habit_id and posts:
            posts = [post for post in posts if post.get('habitId') == habit_id]
        
        if not posts:
            return {"message": "No posts found", "posts": []}
        
        return {"posts": posts}
        
    except Exception as e:
        print(f"❌ DynamoDB error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching posts: {str(e)}")
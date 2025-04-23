from fastapi import APIRouter, HTTPException, Query, File, UploadFile
from typing import Optional
import boto3
from boto3.dynamodb.conditions import Key
import os
import uuid
from app.utils.streak_manager import increment_habit_streak
from datetime import datetime, timezone
import re  # ✅ Added for filename sanitization

router = APIRouter()

# Initialize DynamoDB resource
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
posts_table = dynamodb.Table("hb-posts-table")
habit_table = dynamodb.Table("hb-habits-table")

# Initialize S3 client
s3_client = boto3.client("s3")
BUCKET_NAME = "hb-user-posts"

@router.post("/create_post")
async def create_post(
    user_id: str = Query(..., description="User ID"),
    habit_id: str = Query(..., description="Habit ID to link the post to"),
    comments: str = Query("", description="User comments for the post"),
    file: UploadFile = File(...)
):
    """Create a new post with an image and required habit link"""
    try:
        # Generate timestamp in ISO format
        timestamp = datetime.now(timezone.utc)
        timestamp_str = timestamp.strftime("%Y%m%dT%H%M%S")
        timestamp_iso = timestamp.isoformat()
        
        # Generate post_id
        post_id = f"post-{habit_id}-{timestamp_str}"
        
        # Create the S3 path structure
        date_folder = timestamp.strftime("%Y-%m-%d")
        habit_folder_key = f"{user_id}/{habit_id}/"
        date_folder_key = f"{user_id}/{habit_id}/{date_folder}/"
        
        # Sanitize filename to avoid URL-breaking characters
        safe_filename = re.sub(r"[^\w.\-]", "_", file.filename)

        # Full key path for S3
        file_key = f"{date_folder_key}{post_id}_{safe_filename}"
        print(f"📂 Uploading to S3 with key: {file_key}")

        # Create folders if they don't exist
        for folder_key in [habit_folder_key, date_folder_key]:
            try:
                s3_client.head_object(Bucket=BUCKET_NAME, Key=folder_key)
            except Exception as e:
                if hasattr(e, 'response') and e.response.get('Error', {}).get('Code') == '404':
                    s3_client.put_object(Bucket=BUCKET_NAME, Key=folder_key)
                    print(f"✅ Created folder: {folder_key}")
        
        # Upload the image
        s3_client.upload_fileobj(file.file, BUCKET_NAME, file_key)
        
        # Create the post item
        post_item = {
            'user_id': user_id,
            'post_id': post_id,
            'habitId': habit_id,
            'caption': comments,
            'timestamp': timestamp_iso,
            's3Key': f"{BUCKET_NAME}/{file_key}",
        }
        
        # Save post to DynamoDB
        posts_table.put_item(Item=post_item)
        
        # Update the habit streak
        increment_habit_streak(user_id, habit_id)
        
        return {
            "message": "Post created successfully",
            "post_id": post_id,
        }
        
    except Exception as e:
        print(f"❌ Error creating post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")

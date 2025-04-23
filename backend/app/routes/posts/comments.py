from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import boto3
from datetime import datetime
import uuid

router = APIRouter()

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
comments_table = dynamodb.Table('hb-comments-table')

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    text: str
    parent_id: Optional[str] = None

@router.post("/create_comment")
async def create_comment(comment: CommentCreate):
    try:
        timestamp = datetime.utcnow().isoformat()
        comment_id = str(uuid.uuid4())
        
        # Create sort_key based on whether it's a reply or top-level comment
        sort_key = f"COMMENT#{timestamp}" if not comment.parent_id else f"REPLY#{comment.parent_id}#{timestamp}"
        
        item = {
            "post_id": comment.post_id,
            "sort_key": sort_key,
            "comment_id": comment_id,
            "user_id": comment.user_id,
            "text": comment.text,
            "timestamp": timestamp,
            "likes": 0
        }
        
        if comment.parent_id:
            item["parent_id"] = comment.parent_id
            
        comments_table.put_item(Item=item)
        
        return {
            "message": "Comment created successfully",
            "comment_id": comment_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_comments/{post_id}")
async def get_comments(post_id: str):
    try:
        response = comments_table.query(
            KeyConditionExpression="post_id = :pid",
            ExpressionAttributeValues={
                ":pid": post_id
            }
        )
        
        # Organize comments and replies
        comments = []
        replies_map = {}
        
        for item in response.get('Items', []):
            comment = {
                "id": item["comment_id"],
                "user_id": item["user_id"],
                "text": item["text"],
                "timestamp": item["timestamp"],
                "likes": item.get("likes", 0),
                "replies": []
            }
            
            if "parent_id" in item:
                # This is a reply
                if item["parent_id"] not in replies_map:
                    replies_map[item["parent_id"]] = []
                replies_map[item["parent_id"]].append(comment)
            else:
                # This is a top-level comment
                comments.append(comment)
        
        # Attach replies to their parent comments
        for comment in comments:
            if comment["id"] in replies_map:
                comment["replies"] = sorted(
                    replies_map[comment["id"]], 
                    key=lambda x: x["timestamp"]
                )
        
        return {
            "comments": sorted(comments, key=lambda x: x["timestamp"], reverse=True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
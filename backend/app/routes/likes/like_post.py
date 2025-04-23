from fastapi import APIRouter, HTTPException
from typing import Dict
import boto3
from datetime import datetime
import uuid

router = APIRouter()
dynamodb = boto3.resource('dynamodb')
likes_table = dynamodb.Table('hb-likes-table')

@router.post("/like_post")
async def like_post(post_id: str, user_id: str) -> Dict:
    try:
        # Check if like already exists
        response = likes_table.get_item(
            Key={
                'post_id': post_id,
                'user_id': user_id
            }
        )
        
        # If like exists, remove it (unlike)
        if 'Item' in response:
            likes_table.delete_item(
                Key={
                    'post_id': post_id,
                    'user_id': user_id
                }
            )
            return {"message": "Post unliked successfully"}
        
        # If like doesn't exist, add it
        likes_table.put_item(
            Item={
                'post_id': post_id,
                'user_id': user_id,
                'timestamp': str(datetime.utcnow()),
                'like_id': str(uuid.uuid4())
            }
        )
        return {"message": "Post liked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
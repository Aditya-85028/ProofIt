import boto3
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

class DeletePostRequest(BaseModel):
    post_id: str
    user_id: str

@router.delete("/delete_post")
async def delete_post(request: DeletePostRequest):
    try:
        # Get the post from DynamoDB to get the S3 key
        posts_table = dynamodb.Table('hb-posts-table')
        response = posts_table.get_item(
            Key={
                'post_id': request.post_id,
                'user_id': request.user_id
            }
        )
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Post not found")
            
        post = response['Item']
        
        # Delete the image from S3 if it exists
        if 's3Key' in post:
            try:
                # Delete the object from S3 using the key directly
                s3.delete_object(
                    Bucket='hb-user-posts',
                    Key=post['s3Key']
                )
            except Exception as e:
                print(f"Error deleting from S3: {str(e)}")
                # Continue with DynamoDB deletion even if S3 deletion fails
        
        # Delete the post from DynamoDB
        posts_table.delete_item(
            Key={
                'post_id': request.post_id,
                'user_id': request.user_id
            }
        )
        
        return {"message": "Post deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
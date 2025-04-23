from fastapi import APIRouter, HTTPException
from typing import Dict
import boto3

router = APIRouter()
dynamodb = boto3.resource('dynamodb')
likes_table = dynamodb.Table('hb-likes-table')

@router.get("/get_post_likes/{post_id}")
async def get_post_likes(post_id: str) -> Dict:
    try:
        response = likes_table.query(
            KeyConditionExpression='post_id = :post_id',
            ExpressionAttributeValues={
                ':post_id': post_id
            }
        )
        return {"likes": response.get('Items', [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
from fastapi import APIRouter, HTTPException
from typing import Dict
import boto3

router = APIRouter()
dynamodb = boto3.resource('dynamodb')
likes_table = dynamodb.Table('hb-likes-table')

@router.get("/check_user_like/{post_id}/{user_id}")
async def check_user_like(post_id: str, user_id: str) -> Dict:
    try:
        response = likes_table.get_item(
            Key={
                'post_id': post_id,
                'user_id': user_id
            }
        )
        return {"liked": 'Item' in response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
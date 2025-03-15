import boto3
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer

router = APIRouter(prefix="/users", tags=["Users"])
auth_scheme = HTTPBearer()

COGNITO_USER_POOL_ID = "us-west-1_l4W6v8x3U"
COGNITO_REGION = "us-west-1"

def verify_token(token: str = Security(auth_scheme)):
    client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
    try:
        user_info = client.get_user(AccessToken=token.credentials)
        return user_info["Username"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me")
async def get_current_user(user_id: str = Depends(verify_token)):
    return {"message": "Authenticated", "user_id": user_id}

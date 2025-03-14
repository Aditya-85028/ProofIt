import boto3
from fastapi import APIRouter, UploadFile, File
from datetime import datetime

router = APIRouter(prefix="/upload", tags=["Uploads"])
s3_client = boto3.client("s3")
BUCKET_NAME = "habbit-user-posts"

@router.post("/")
async def upload_file(user_id: str, file: UploadFile = File(...)):
    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    file_key = f"user-uploads/{user_id}/{timestamp}_{file.filename}"

    s3_client.upload_fileobj(file.file, BUCKET_NAME, file_key)
    s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"

    return {"message": "File uploaded", "url": s3_url}

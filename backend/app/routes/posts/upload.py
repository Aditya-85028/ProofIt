from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import boto3
import uuid
from datetime import datetime

router = APIRouter()

# Initialize S3 client
s3 = boto3.client('s3', region_name='us-east-1')
BUCKET_NAME = 'hb-uploads-bucket'  # Replace with your actual bucket name

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Query(..., description="User's unique ID")
):
    """Upload a file to S3 bucket and return the URL."""
    try:
        # Generate a unique file name
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"
        
        # Read file content
        file_content = await file.read()
        
        # Upload to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=unique_filename,
            Body=file_content,
            ContentType=file.content_type
        )
        
        # Generate the URL for the uploaded file
        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{unique_filename}"
        
        return {
            "message": "File uploaded successfully",
            "file_url": file_url,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
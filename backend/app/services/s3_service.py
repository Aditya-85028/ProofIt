import boto3
from fastapi import HTTPException, UploadFile
from datetime import datetime

# Initialize S3 client
s3_client = boto3.client("s3")
BUCKET_NAME = "habbit-user-posts"  # Change this to your actual S3 bucket name

def upload_file(user_id: str, file: UploadFile):
    """ Uploads a file to the S3 bucket and returns the file URL. """
    try:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
        file_key = f"user-uploads/{user_id}/{timestamp}_{file.filename}"
        
        s3_client.upload_fileobj(file.file, BUCKET_NAME, file_key)

        return {"message": "File uploaded", "url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_latest_proof(user_id: str):
    """ Retrieves the most recent proof submission for a user. """
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME, Prefix=f"user-uploads/{user_id}/"
        )

        if "Contents" not in response:
            return {"message": "No proof found"}

        # Sort by LastModified (descending) to get the latest file
        latest_file = sorted(response["Contents"], key=lambda obj: obj["LastModified"], reverse=True)[0]

        return {"file_name": latest_file["Key"], "url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{latest_file['Key']}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

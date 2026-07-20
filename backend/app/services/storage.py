import boto3
from botocore.exceptions import ClientError
from uuid import UUID
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

R2_BUCKET_NAME =  os.getenv("R2_BUCKET")

# r2_client = boto3.client(
#     service_name='s3',
#     # Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
#     endpoint_url=os.getenv("R2_ENDPOINT"),
#     # Provide your R2 Access Key ID and Secret Access Key
#     aws_access_key_id=os.getenv("R2_ACCESS_ID_KEY"),
#     aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
#     region_name='auto',  # Required by boto3, not used by R2
# )

def get_client():
	return boto3.client(
    service_name='s3',
    # Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
    endpoint_url=os.getenv("R2_ENDPOINT"),
    # Provide your R2 Access Key ID and Secret Access Key
    aws_access_key_id=os.getenv("R2_ACCESS_ID_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name='auto',  # Required by boto3, not used by R2
)

def create_storage_key(
    event_id: UUID,
    filename: str
) -> str:
    """
    Creates a unique object key for an uploaded file.

    Example:
    events/550e8400-e29b/photo_2026-07-19T15:30:22_uuid.jpg
    """

    timestamp = datetime.utcnow().isoformat()

    return f"events/{event_id}/{timestamp}_{filename}"


def upload_file(
    file_object,
    event_id: UUID,
    filename: str,
) -> str:
    """
    Uploads a file to Cloudflare R2.

    Returns:
        The storage key.
    """

    try:
        key = create_storage_key(event_id=event_id, filename=filename)
        r2_client = get_client()
        r2_client.upload_fileobj(
            file_object,
            R2_BUCKET_NAME,
            key,
        )

        return key

    except ClientError as e:
        raise RuntimeError(
            f"Failed to upload file: {e}"
        )
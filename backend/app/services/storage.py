import boto3
from botocore.exceptions import ClientError
from uuid import UUID, uuid4
from dotenv import load_dotenv
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

s3 = boto3.client(
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
    events/550e8400-e29b/uuid4_{name}.jpg
    """

    return f"events/{event_id}/{uuid4()}_{filename}"

def generate_put_presign_url(key: str, content_type: str):
    put_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': R2_BUCKET_NAME,
            'Key': key,
            'ContentType': content_type
        },
        ExpiresIn=600
    )
    return put_url

def get_object_metadata(storage_key: str):
    try:
        response = s3.head_object(
            Bucket=R2_BUCKET_NAME,
            Key=storage_key
        )

        return {
            "size": response.get("ContentLength"),
            "content_type": response.get("ContentType"),
            "etag": response.get("ETag"),
            "last_modified": response.get("LastModified"),
        }

    except ClientError as e:
        error_code = e.response["Error"]["Code"]

        # Object does not exist
        if error_code in ("404", "NoSuchKey"):
            return None

        raise RuntimeError(
            f"Failed to check object metadata: {e}"
        )

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
        s3.upload_fileobj(
            file_object,
            R2_BUCKET_NAME,
            key,
        )

        return key

    except ClientError as e:
        raise RuntimeError(
            f"Failed to upload file: {e}"
        )
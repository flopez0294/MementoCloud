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
    
    Args:
        event_id (UUID): An event's given ID.
        filename (str): A media's filename.

    Returns:
        str: storage key for a given media.
    """
    return f"events/{event_id}/{uuid4()}_{filename}"

def generate_put_presign_url(key: str, content_type: str):
    """
    Generates a presigned url for image uploading from the frontend.

    Args:
        key (str): The storage key where the media will be uploaded.
        content_type (str): The MIME type of the media being uploaded.

    Returns:
        str: A presigned URL that allows the frontend to upload the media
            directly to the storage bucket for a limited time.
    """
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

def generate_get_presign_url(key: str):
    """
    Generates a presigned URL for retrieving an object from the storage bucket.

    Args:
        key (str): The storage key where the media is uploaded.

    Returns:
        str: A presigned URL that allows the frontend to retrieve the media
            directly from the storage bucket for a limited time.
    """
    get_url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": R2_BUCKET_NAME,
            "Key": key
        },
        ExpiresIn=1800
    )
    return get_url

def delete_object(storage_key: str):
    """
    Deletes a media object from the storage bucket.

    Args:
        storage_key (str): The storage key of the media object.

    Raises:
        RuntimeError: If the storage service fails to delete the object.
    """
    try:
        s3.delete_object(Bucket=R2_BUCKET_NAME, Key=storage_key)
    except ClientError as e:
        raise RuntimeError(f"Failed to delete object from storage: {e}") from e

def get_object_metadata(storage_key: str):
    """
    Retrieves metadata for a media object to verify that it exists
    in the storage bucket.

    Args:
        storage_key (str): The storage key of the media object.

    Raises:
        RuntimeError: If the storage service fails to retrieve the object's
            metadata for a reason other than the object not existing.

    Returns:
        Dict | None: A dictionary containing the object's size, content type,
            ETag, and last modified timestamp, or None if the object does
            not exist.
    """
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
        raise RuntimeError(f"Failed to delete object from storage: {e}") from e
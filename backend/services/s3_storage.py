import os
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class S3Storage:
    def __init__(self):
        self.bucket = os.getenv("R2_BUCKET")
        self.endpoint = os.getenv("R2_ENDPOINT")
        self.access_key = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
        
        if not all([self.bucket, self.endpoint, self.access_key, self.secret_key]):
            logger.warning("R2 Storage credentials are not fully configured")
            self.s3 = None
        else:
            self.s3 = boto3.client(
                's3',
                endpoint_url=self.endpoint,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                config=Config(signature_version='s3v4', s3={'addressing_style': 'path'}),
                region_name='ap-southeast-1'
            )

    def _check_client(self):
        if not self.s3:
            raise ValueError("R2 client not initialized. Check credentials.")

    def generate_upload_url(self, object_key: str, expires_in: int = 3600) -> str:
        self._check_client()
        try:
            url = self.s3.generate_presigned_url(
                ClientMethod='put_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': object_key,
                    'ContentType': 'application/pdf'
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating upload URL: {e}")
            raise

    def generate_download_url(self, object_key: str, expires_in: int = 3600) -> str:
        self._check_client()
        try:
            url = self.s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': object_key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating download URL: {e}")
            raise

    def delete_object(self, object_key: str) -> bool:
        self._check_client()
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=object_key)
            return True
        except ClientError as e:
            logger.error(f"Error deleting object: {e}")
            return False

    def download_to_file(self, object_key: str, file_path: str):
        self._check_client()
        try:
            self.s3.download_file(self.bucket, object_key, file_path)
        except ClientError as e:
            logger.error(f"Error downloading object to file: {e}")
            raise

    def upload_fileobj(self, file_obj, object_key: str, content_type: str = 'application/pdf'):
        self._check_client()
        try:
            self.s3.upload_fileobj(
                file_obj,
                self.bucket,
                object_key,
                ExtraArgs={'ContentType': content_type}
            )
            return True
        except ClientError as e:
            logger.error(f"Error uploading object: {e}")
            raise

storage = S3Storage()

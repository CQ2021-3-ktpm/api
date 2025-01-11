#!/bin/bash

echo "Creating S3 buckets..."

set -euo pipefail

#buckets=("public" "private")
buckets=("public")

# Endpoint URL for LocalStack
endpoint_url="http://localhost:4566"

for bucket_name in "${buckets[@]}"; do
    awslocal --endpoint-url="$endpoint_url" s3api create-bucket --bucket "$bucket_name"
done

#!/bin/bash

# Configuration
LAMBDA_NAME="habit-streak-reset"
REGION="us-east-1"

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy the Lambda code
cp weekly_reset.py "$TEMP_DIR/"

# Create a directory structure that matches the Python package
mkdir -p "$TEMP_DIR/app/utils"
cp ../utils/streak_manager.py "$TEMP_DIR/app/utils/"

# Create an empty __init__.py file
touch "$TEMP_DIR/app/__init__.py"
touch "$TEMP_DIR/app/utils/__init__.py"

# Install dependencies
pip install boto3 -t "$TEMP_DIR/"

# Create the zip file
cd "$TEMP_DIR"
zip -r "$TEMP_DIR/weekly_reset.zip" .

# Update Lambda function code directly
echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name $LAMBDA_NAME \
    --zip-file "fileb://$TEMP_DIR/weekly_reset.zip" \
    --region $REGION

# Clean up
rm -rf "$TEMP_DIR"
echo "Deployment completed successfully!" 
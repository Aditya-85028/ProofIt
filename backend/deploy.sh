#!/bin/bash

echo "📦 Repackaging Lambda Function..."
rm -rf package deployment.zip
mkdir -p package

# Install dependencies for Lambda
pip install --platform manylinux2014_x86_64 --only-binary=:all: -r requirements.txt -t package

# Create deployment package
cd package
zip -r ../deployment.zip .
cd ..
zip -g deployment.zip -r app
zip -g deployment.zip main.py

echo "🚀 Deploying to AWS Lambda..."
aws lambda update-function-code --function-name HabbitLambda --zip-file fileb://deployment.zip

echo "✅ Deployment Complete!"

#!/bin/bash

# Set the venv name
VENV_NAME="venv"

# Ensure Python 3.10 is installed
if ! command -v python3.10 &> /dev/null; then
    echo "Python 3.10 is not installed. Please install it and try again."
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "$VENV_NAME" ]; then
    echo "Creating virtual environment ($VENV_NAME)..."
    python3.10 -m venv $VENV_NAME
else
    echo "Virtual environment ($VENV_NAME) already exists."
fi

# Modify the activation script to include AWS credentials
ACTIVATE_SCRIPT="$VENV_NAME/bin/activate"

echo "Configuring AWS credentials inside the virtual environment..."

# Append AWS credentials export to the activation script
cat <<EOL >> $ACTIVATE_SCRIPT

# Load AWS SSO credentials dynamically upon activation
export AWS_PROFILE="default"
export AWS_ACCESS_KEY_ID=\$(aws configure get aws_access_key_id --profile default)
export AWS_SECRET_ACCESS_KEY=\$(aws configure get aws_secret_access_key --profile default)
export AWS_SESSION_TOKEN=\$(aws configure get aws_session_token --profile default)
export AWS_REGION=\$(aws configure get region --profile default)

# Refresh credentials if expired
aws sts get-caller-identity > /dev/null 2>&1
if [ \$? -ne 0 ]; then
    echo "AWS credentials expired. Running 'aws sso login'..."
    aws sso login --profile default
fi

echo "AWS credentials loaded successfully!"
EOL

echo "Setup complete! Activate your virtual environment using:"
echo "source $VENV_NAME/bin/activate"

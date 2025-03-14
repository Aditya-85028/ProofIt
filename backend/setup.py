from setuptools import setup, find_packages

setup(
    name="proofit-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.104.0",
        "mangum>=0.17.0",
        "uvicorn>=0.24.0",
        "boto3>=1.28.0",
        "pydantic>=2.0.0",
        "pydantic-core>=2.0.0",
        "aws-lambda-powertools>=2.0.0",
        "aioboto3>=12.0.0",
        "python-multipart>=0.0.6"
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=23.0.0",
            "isort>=5.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ]
    },
    python_requires=">=3.9",
    author="ProofIt Team",
    description="Backend API for ProofIt application",
    long_description=open("README.md").read() if os.path.exists("README.md") else "",
    long_description_content_type="text/markdown",
) 
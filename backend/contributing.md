# Contributing to ProofIt Backend

This document provides guidelines and instructions for contributing to the ProofIt backend service.

## Development Setup

### Prerequisites
- Python 3.10 or higher (3.10 recommended)
- pip (Python package manager)
- Git

### Initial Setup

1. Check your Python version:
```bash
python --version  # Should output Python 3.10.x
```

2. Clone the repository:
```bash
git clone <repository-url>
cd ProofIt/backend
```

3. Create and activate a virtual environment:
```bash
# On macOS/Linux
python3.10 -m venv venv
source venv/bin/activate

# On Windows
python3.10 -m venv venv
.\venv\Scripts\activate
```

4. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration values
```

## Local Development

### Running the Development Server

1. Start the local development server:
```bash
python local_dev.py
```

This will:
- Start the FastAPI server on http://localhost:8000
- Enable auto-reload for code changes
- Provide API documentation at:
  - Swagger UI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

### Testing

The project uses pytest for testing. Tests are organized into unit tests and integration tests.

1. Run all tests:
```bash
pytest
```

2. Run specific test categories:
```bash
# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/

# Run a specific test file
pytest tests/unit/test_lambda_handler.py
```

3. Run tests with coverage report:
```bash
pytest --cov
```
- Coverage reports will be generated in the terminal
- HTML coverage report will be available in `htmlcov/index.html`

### Code Quality

1. Format your code:
```bash
# Format with black
black .

# Sort imports
isort .
```

2. Run linting:
```bash
# Run flake8
flake8 .

# Run type checking
mypy .
```

## Project Structure

```
backend/
├── app/                    # Application package
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── conftest.py        # Test fixtures
├── main.py                # FastAPI application
├── local_dev.py           # Local development server
├── requirements.txt       # Production dependencies
├── requirements-dev.txt   # Development dependencies
└── setup.py              # Package configuration
```

## Deployment

### Local Testing Before Deployment

1. Test your changes locally:
```bash
# Run all tests
pytest

# Start local server and test endpoints
python local_dev.py
```

2. Manual testing using the Swagger UI:
- Visit http://localhost:8000/docs
- Test your endpoints through the interactive interface

### Deployment Process

1. Create a deployment package:
```bash
./deploy.sh
```

This will:
- Package the application and dependencies
- Create a deployment.zip file
- Upload to AWS Lambda

## Best Practices

1. **Code Style**
   - Follow PEP 8 guidelines
   - Use type hints for function arguments and return values
   - Write docstrings for functions and classes

2. **Testing**
   - Write tests for new features
   - Maintain test coverage above 80%
   - Test both success and error cases

3. **Git Workflow**
   - Create feature branches from `main`
   - Write clear commit messages
   - Update tests and documentation
   - Submit pull requests for review

4. **Environment Variables**
   - Never commit sensitive values
   - Add new environment variables to `.env.example`
   - Document any new configuration requirements

## Getting Help

- Check the API documentation at `/docs` or `/redoc`
- Review existing tests for examples
- Reach out to the team for questions

## License

[Your project license] 
# File Compressor FastAPI Backend

This is the Python FastAPI backend for the File Compressor application. It provides API endpoints for compressing and decompressing files using the C++ Huffman compression implementation.

## Features

- RESTful API for file compression and decompression
- Integration with C++ compression executables
- Automatic detection of already compressed files
- Base64 encoding of file data for frontend compatibility

## Getting Started

### Prerequisites

- Python 3.7 or higher
- C++ compression executables (`main.exe` and `decode.exe`) in the root directory

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

### Running the Server

Start the development server:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

Alternatively, you can use the provided batch script:

```bash
start.bat
```

The server will start on [http://localhost:3001](http://localhost:3001).

## API Endpoints

### Compress File

```
POST /api/compress
```

- Request: multipart/form-data with a file field
- Response: JSON with compression details and base64-encoded compressed file data

### Decompress File

```
POST /api/decompress
```

- Request: multipart/form-data with a file field (should be a .huf file)
- Response: JSON with decompression details and base64-encoded decompressed file data

## Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: [http://localhost:3001/docs](http://localhost:3001/docs)
- ReDoc: [http://localhost:3001/redoc](http://localhost:3001/redoc) 
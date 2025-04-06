# File Compressor

A complete file compression application using Huffman coding algorithm with a React frontend and FastAPI backend.

## Features

- File compression using Huffman coding
- File decompression
- Modern React UI with drag-and-drop file upload
- FastAPI Python backend for handling compression operations
- Integration with C++ compression executables

## Project Structure

- `/frontend` - React frontend application
- `/backend` - FastAPI Python backend
- `main.exe` - C++ compression executable
- `decode.exe` - C++ decompression executable

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- Python 3.7 or higher
- C++ compression executables (main.exe and decode.exe in the root directory)

### Installation

1. Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

### Running the Application

#### 1. Start the FastAPI backend:

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

Or use the provided batch script:

```bash
cd backend
start.bat
```

#### 2. Start the React frontend (in a new terminal):

```bash
cd frontend
npm start
```

The React application will run at [http://localhost:3000](http://localhost:3000) and the backend will run at [http://localhost:3001](http://localhost:3001).

## Usage

1. Navigate to the frontend URL in your browser
2. Choose whether to compress or decompress a file
3. Upload a file through the interface
4. The application will process the file and provide a download link for the result

## API Endpoints

The FastAPI backend provides the following endpoints:

- `POST /api/compress` - Compress a file
- `POST /api/decompress` - Decompress a file

API documentation is available at:
- Swagger UI: [http://localhost:3001/docs](http://localhost:3001/docs)
- ReDoc: [http://localhost:3001/redoc](http://localhost:3001/redoc)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## File Handling

The application handles different file types as follows:

### Text Files
- Text files (.txt, .csv, etc.) are compressed using the Huffman coding algorithm
- Compression is performed by the C++ executable (main.exe)
- The compressed file uses the .huf extension

### Image Files
- Image files (.jpg, .jpeg, .png, etc.) are compressed using Pillow/PIL
- The application applies image-specific compression techniques:
  - Quality reduction for JPEG images
  - Optimization for PNG images
- The compressed image keeps its original file format
- If image-specific compression fails, the app falls back to Huffman coding

### Audio and Video Files
- The system preserves audio files in their original format using a passthrough method
- Audio files are not compressed to ensure compatibility and to prevent errors
- The original audio file is returned with its original format maintained
- For video files, the system attempts Huffman compression but falls back to providing the original file if needed

### Other Binary Files
- Documents, archives, and executables are processed with Huffman coding
- The system handles binary files safely, preserving their content even if compression fails
- Most binary files won't achieve significant compression as they're often already compressed

Supported binary file extensions:
- Images: .jpg, .jpeg, .png, .gif, .bmp, .webp, .tiff
- Audio/Video: .mp3, .mp4, .avi, .mov
- Documents: .pdf, .docx, .xlsx, .pptx
- Archives: .zip, .rar, .7z
- Executables: .exe, .dll, .so



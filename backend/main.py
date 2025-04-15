from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import subprocess
import os
import shutil
import base64
from typing import Optional
import uuid
import io
from PIL import Image  # Add Pillow for image compression

app = FastAPI(title="File Compression API", description="API for compressing and decompressing files using Huffman coding")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for troubleshooting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Path to C++ executables
MAIN_EXE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "main.exe")
DECODE_EXE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "decode.exe")

# Check if executables exist
if not os.path.exists(MAIN_EXE):
    print(f"Warning: Compression executable not found at {MAIN_EXE}")
if not os.path.exists(DECODE_EXE):
    print(f"Warning: Decompression executable not found at {DECODE_EXE}")

# Helper function to check if a file is already compressed
def is_already_compressed(filename: str) -> bool:
    # Always return False to force compression on all files
    return False

# Function to compress an image file
def compress_image(input_path, output_path, quality=40):
    """Compress an image file using PIL/Pillow"""
    try:
        img = Image.open(input_path)
        
        # Convert to RGB if RGBA (needed for JPEG)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
            
        # Save with reduced quality and additional optimization
        img.save(output_path, optimize=True, quality=quality, progressive=True)
        return True
    except Exception as e:
        print(f"Image compression error: {str(e)}")
        return False

# Function to get file type
def get_file_type(filename):
    ext = os.path.splitext(filename)[1].lower()
    
    # Image file types
    if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff']:
        return 'image'
    
    # Audio file types    
    elif ext in ['.mp3', '.wav', '.ogg', '.flac', '.aac']:
        return 'audio'
        
    # Video file types
    elif ext in ['.mp4', '.avi', '.mov', '.mkv', '.webm']:
        return 'video'
        
    # Document types
    elif ext in ['.pdf', '.docx', '.xlsx', '.pptx']:
        return 'document'
        
    # Archive types
    elif ext in ['.zip', '.rar', '.7z', '.gz', '.tar']:
        return 'archive'
        
    # Executable types
    elif ext in ['.exe', '.dll', '.so']:
        return 'executable'
        
    # Default to text
    else:
        return 'text'

# Helper function to get file size in a human-readable format
def get_file_size(size_in_bytes: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"

@app.post("/api/compress")
async def compress_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
        
    try:
        print(f"Received file: {file.filename}, size: {file.size if hasattr(file, 'size') else 'unknown'}")
        
        # Generate a unique filename
        file_id = str(uuid.uuid4())
        original_filename = file.filename
        file_extension = os.path.splitext(original_filename)[1]
        
        # Create input file path
        input_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
        
        try:
            # Save the uploaded file
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            print(f"File saved to: {input_path}")
            
            # Check if file exists and has size
            if not os.path.exists(input_path) or os.path.getsize(input_path) == 0:
                raise HTTPException(status_code=500, detail="File upload failed or empty file received")
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")
        
        # Determine file type
        file_type = get_file_type(original_filename)
        print(f"File type detected: {file_type}")
        
        # Set output path for compressed file
        if file_type == 'image':
            # For images, keep the extension but add _compressed
            output_filename = f"{file_id}_compressed{file_extension}"
            compressed_path = os.path.join(UPLOAD_DIR, output_filename)
            compression_method = "image"
        else:
            # For other files, use .huf extension
            compressed_path = os.path.join(UPLOAD_DIR, f"{file_id}.huf")
            compression_method = "huffman"
        
        try:
            # Choose compression method based on file type
            if file_type == 'image':
                print(f"Compressing image: {input_path} to {compressed_path}")
                success = compress_image(input_path, compressed_path)
                if not success:
                    print("Image compression failed, trying Huffman")
                    compressed_path = os.path.join(UPLOAD_DIR, f"{file_id}.huf")
                    result = subprocess.run(
                        [MAIN_EXE, input_path, compressed_path],
                        capture_output=True,
                        text=True,
                        check=True
                    )
                    compression_method = "huffman"
            elif file_type == 'audio':
                # For audio files, just copy the file instead of trying Huffman compression
                # This avoids internal server errors with audio files
                print(f"Audio file detected, making a copy instead of compressing")
                compressed_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
                shutil.copy(input_path, compressed_path)
                compression_method = "passthrough"
            else:
                # For text and other files, use Huffman compression
                print(f"Running Huffman compression: {MAIN_EXE} {input_path} {compressed_path}")
                if not os.path.exists(MAIN_EXE):
                    raise HTTPException(status_code=500, detail=f"Compression executable not found at {MAIN_EXE}")
                
                # For audio, video, and other binary files, try Huffman but be prepared to fail
                try:
                    result = subprocess.run(
                        [MAIN_EXE, input_path, compressed_path],
                        capture_output=True,
                        text=True,
                        check=True
                    )
                    print(f"Compression output: {result.stdout}")
                except subprocess.CalledProcessError as e:
                    print(f"Huffman compression failed: {str(e)}")
                    # If Huffman fails for binary files, make a copy
                    if file_type in ['audio', 'video', 'document', 'archive', 'executable']:
                        print(f"Binary file compression failed, making a copy")
                        shutil.copy(input_path, compressed_path)
                    else:
                        raise
            
            # Check if the compressed file was created
            if not os.path.exists(compressed_path):
                raise HTTPException(status_code=500, detail="Compression failed: output file not created")
            
        except Exception as e:
            print(f"Error during compression: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Compression error: {str(e)}")
                
        # Calculate file sizes and compression ratio
        original_size = os.path.getsize(input_path)
        compressed_size = os.path.getsize(compressed_path)
        compression_ratio = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
        
        # Read the compressed file as base64
        with open(compressed_path, "rb") as f:
            compressed_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Clean up temporary files
        os.remove(input_path)
        if compressed_path != input_path:  # Only remove if they're different files
            os.remove(compressed_path)
        print('Temporary files cleaned up')
        
        # Determine output file extension
        if compression_method in ["image", "passthrough"]:
            output_extension = file_extension  # Keep original extension for images and audio
        else:
            output_extension = ".huf"  # Use .huf for Huffman compression
        
        # Prepare response
        response = {
            "success": True,
            "originalSize": original_size,
            "compressedSize": compressed_size,
            "compressionRatio": round(compression_ratio, 2),
            "compressedData": compressed_data,
            "fileName": original_filename,
            "fileExtension": output_extension,
            "compressionMethod": compression_method
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        print(f"Unhandled exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/decompress")
async def decompress_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
        
    try:
        print(f"Received file for decompression: {file.filename}")
        
        # Generate a unique filename
        file_id = str(uuid.uuid4())
        original_filename = file.filename
        
        # Create input file path
        input_path = os.path.join(UPLOAD_DIR, f"{file_id}.huf")
        
        try:
            # Save the uploaded file
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            print(f"File saved to: {input_path}")
            
            # Check if file exists and has size
            if not os.path.exists(input_path) or os.path.getsize(input_path) == 0:
                raise HTTPException(status_code=500, detail="File upload failed or empty file received")
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")
        
        # Set output path for decompressed file
        decompressed_path = os.path.join(UPLOAD_DIR, f"{file_id}.txt")
        
        # Execute C++ decompression program
        try:
            print(f"Running decompression: {DECODE_EXE} {input_path} {decompressed_path}")
            
            if not os.path.exists(DECODE_EXE):
                raise HTTPException(status_code=500, detail=f"Decompression executable not found at {DECODE_EXE}")
            
            result = subprocess.run(
                [DECODE_EXE, input_path, decompressed_path],
                capture_output=True,
                text=True,
                check=True
            )
            
            print(f"Decompression output: {result.stdout}")
            
            # Check if the decompressed file was created
            if not os.path.exists(decompressed_path):
                raise HTTPException(status_code=500, detail="Decompression failed: output file not created")
            
            # Get file sizes
            compressed_size = os.path.getsize(input_path)
            decompressed_size = os.path.getsize(decompressed_path)
            expansion_ratio = ((decompressed_size - compressed_size) / compressed_size * 100)
            
        except subprocess.CalledProcessError as e:
            print(f"Decompression process error: {str(e)}")
            print(f"STDERR: {e.stderr}")
            print(f"STDOUT: {e.stdout}")
            raise HTTPException(status_code=500, detail=f"Decompression failed: {e.stderr or str(e)}")
        except Exception as e:
            print(f"Error during decompression: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Decompression error: {str(e)}")
        
        # Read the decompressed file as base64
        with open(decompressed_path, "rb") as f:
            decompressed_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Clean up temporary files
        os.remove(input_path)
        os.remove(decompressed_path)
        
        # Prepare response
        response = {
            "success": True,
            "compressedSize": compressed_size,
            "decompressedSize": decompressed_size,
            "expansionRatio": round(expansion_ratio, 2),
            "decompressedData": decompressed_data,
            "fileName": original_filename.replace(".huf", ".txt")
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "API is running"}

@app.get("/")
async def root():
    return {"message": "Welcome to the File Compression API. Use /api/compress or /api/decompress endpoints."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True) 
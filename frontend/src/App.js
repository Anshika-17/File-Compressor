import React, { useState, useEffect, useContext } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import './App.css';
import FileUploader from './components/FileUploader';
import CompressionResult from './components/CompressionResult';
import DecompressionOption from './components/DecompressionOption';
import DecompressionResult from './components/DecompressionResult';
import Welcome from './components/Welcome';
import ThemeToggle from './components/ThemeToggle';
import ProgressBar from './components/ProgressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress, faExpand, faTimes } from '@fortawesome/free-solid-svg-icons';

function AppContent() {
  const { isDarkMode } = useContext(ThemeContext);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mode, setMode] = useState('choose'); // 'choose', 'compress', 'decompress'
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressionResult, setCompressionResult] = useState(null);
  const [decompressionResult, setDecompressionResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checked: false, ok: false, message: 'Checking API status...' });
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Check API health
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setApiStatus(data.status);
      } catch (error) {
        console.error('API Health Check Error:', error);
        setApiStatus('API connection error');
        // Log the actual API URL being used
        console.log('API URL:', process.env.REACT_APP_API_URL);
      }
    };

    checkApiHealth();
  }, []);

  const handleStart = () => {
    setShowWelcome(false);
  };

  const resetState = () => {
    setFile(null);
    setFileInfo(null);
    setCompressionResult(null);
    setDecompressionResult(null);
    setError(null);
    setLoading(false);
  };

  const chooseMode = (selectedMode) => {
    resetState();
    setMode(selectedMode);
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setFileInfo({
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        type: selectedFile.type
      });
      setCompressionResult(null);
      setError(null);
    }
  };

  const handleCompression = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setProgressStatus('Starting compression...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setProgressStatus('Uploading file...');
      setProgress(20);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/compress`, {
        method: 'POST',
        body: formData,
      });

      setProgressStatus('Compressing file...');
      setProgress(60);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setProgressStatus('Finalizing...');
      setProgress(90);
      
      if (data.success) {
        setCompressionResult({
          originalSize: formatFileSize(data.originalSize),
          compressedSize: formatFileSize(data.compressedSize),
          compressionRatio: `${data.compressionRatio}%`,
          downloadData: data.compressedData,
          fileName: data.fileName,
          fileExtension: data.fileExtension,
          compressionMethod: data.compressionMethod || 'huffman'
        });
        setProgressStatus('Compression complete!');
        setProgress(100);
      } else {
        throw new Error(data.detail || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
      setProgressStatus('Error occurred');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setProgressStatus('');
      }, 2000);
    }
  };

  const handleDecompressionResult = (data) => {
    setDecompressionResult({
      compressedSize: formatFileSize(data.compressedSize),
      decompressedSize: formatFileSize(data.decompressedSize),
      expansionRatio: data.expansionRatio,
      downloadData: data.decompressedData,
      fileName: data.fileName
    });
  };

  const handleCompressionDownload = () => {
    if (!compressionResult || !compressionResult.downloadData) return;
    
    // Use the file extension from the response
    let fileName;
    
    if (compressionResult.compressionMethod === 'passthrough' || compressionResult.compressionMethod === 'image') {
      // For audio and image files, keep the original filename
      fileName = compressionResult.fileName;
    } else {
      // For Huffman compression, use .huf extension
      const fileExt = compressionResult.fileExtension || '.huf';
      fileName = `${compressionResult.fileName.split('.')[0]}${fileExt}`;
    }
    
    downloadBase64File(
      compressionResult.downloadData,
      fileName
    );
  };

  const handleDecompressionDownload = () => {
    if (!decompressionResult || !decompressionResult.downloadData) return;
    downloadBase64File(decompressionResult.downloadData, decompressionResult.fileName);
  };

  const downloadBase64File = (base64Data, fileName) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (showWelcome) {
    return <Welcome onStart={handleStart} />;
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <ThemeToggle />
      <header className="App-header">
        <h1>File Compressor</h1>
        <p>Compress and decompress files efficiently</p>
        <div className={`api-status ${apiStatus.ok ? 'api-connected' : 'api-disconnected'}`}>
          {apiStatus.message}
        </div>
      </header>
      
      <main className="App-main">
        {loading && (
          <ProgressBar progress={progress} status={progressStatus} />
        )}
        
        {!apiStatus.ok && apiStatus.checked && (
          <div className="api-error-container">
            <h2>Cannot Connect to API Server</h2>
            <p>There was an error connecting to the API server. Please make sure:</p>
            <ol>
              <li>The FastAPI backend is running at <code>http://localhost:3001</code></li>
              <li>No firewall or network issues are blocking the connection</li>
              <li>You've started the app using the provided start script</li>
            </ol>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        )}
        
        {apiStatus.ok && mode === 'choose' && (
          <div className="mode-selection">
            <h2>What would you like to do?</h2>
            <div className="mode-options">
              <div className="mode-option" onClick={() => chooseMode('compress')}>
                <div className="mode-icon">
                  <FontAwesomeIcon icon={faCompress} size="2x" />
                </div>
                <h3>Compress a File</h3>
                <p>Reduce file size using Huffman coding</p>
              </div>
              <div className="mode-option" onClick={() => chooseMode('decompress')}>
                <div className="mode-icon">
                  <FontAwesomeIcon icon={faExpand} size="2x" />
                </div>
                <h3>Decompress a File</h3>
                <p>Restore a compressed file to its original form</p>
              </div>
            </div>
          </div>
        )}
        
        {apiStatus.ok && mode === 'compress' && (
          <div className="compression-section">
            <div className="section-header">
              <h2>Compress a File</h2>
              <button className="back-button" onClick={() => chooseMode('choose')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {!fileInfo && <FileUploader onFileSelect={handleFileSelect} />}
            
            {fileInfo && !compressionResult && !loading && (
              <div className="file-selected">
                <div className="file-details">
                  <h3>Selected File</h3>
                  <p><strong>Name:</strong> {fileInfo.name}</p>
                  <p><strong>Size:</strong> {fileInfo.size}</p>
                  <p><strong>Type:</strong> {fileInfo.type}</p>
                </div>
                <div className="action-buttons">
                  <button className="compress-button" onClick={handleCompression}>
                    Compress File
                  </button>
                  <button className="cancel-button" onClick={() => setFileInfo(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Compressing your file...</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>Error: {error}</p>
                <button className="retry-button" onClick={() => setError(null)}>
                  Try Again
                </button>
              </div>
            )}
            
            {compressionResult && (
              <CompressionResult 
                result={compressionResult} 
                onDownload={handleCompressionDownload} 
              />
            )}
          </div>
        )}
        
        {apiStatus.ok && mode === 'decompress' && (
          <div className="decompression-section">
            <div className="section-header">
              <h2>Decompress a File</h2>
              <button className="back-button" onClick={() => chooseMode('choose')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {!decompressionResult && (
              <DecompressionOption onDecompress={handleDecompressionResult} />
            )}
            
            {decompressionResult && (
              <DecompressionResult 
                result={decompressionResult} 
                onDownload={handleDecompressionDownload} 
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>© 2025 File Compressor. All Rights Reserved.</p>
        <p>Created with ❤️ by <a href="https://github.com/Anshika-17" target="_blank" rel="noopener noreferrer">Anshika</a></p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

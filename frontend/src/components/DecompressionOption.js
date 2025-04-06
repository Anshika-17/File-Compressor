import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArchive, faFileAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

const DecompressionOption = ({ onDecompress }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to decompress");
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.huf')) {
      setError("Please select a .huf file for decompression");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending decompression request to backend...');
      
      const response = await fetch('http://localhost:3001/api/decompress', {
        method: 'POST',
        body: formData,
      }).catch(error => {
        console.error('Network error during fetch:', error);
        throw new Error(`Network error: ${error.message}. Make sure the backend server is running at http://localhost:3001`);
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      try {
        const data = await response.json();
        
        if (data.success) {
          onDecompress(data);
        } else {
          throw new Error(data.detail || 'Unknown error occurred');
        }
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error(`Error processing response: ${jsonError.message}`);
      }
    } catch (err) {
      console.error('Decompression error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="decompression-option">
      <h3>Decompress a File</h3>
      <p className="option-description">
        Upload a .huf file to decompress it back to its original format.
      </p>
      
      <form onSubmit={handleSubmit} className="decompress-form">
        <div className="file-input-container">
          <label htmlFor="decompressFile" className="file-input-label">
            <FontAwesomeIcon icon={file ? faFileAlt : faFileArchive} className="file-icon" />
            <span>{file ? file.name : 'Choose .huf file'}</span>
          </label>
          <input
            type="file"
            id="decompressFile"
            accept=".huf"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        
        <button type="submit" className="decompress-button" disabled={loading || !file}>
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Decompressing...
            </>
          ) : (
            'Decompress File'
          )}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default DecompressionOption; 
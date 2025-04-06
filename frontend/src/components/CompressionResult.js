import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faInfoCircle, faImage, faFileCode, faMusic } from '@fortawesome/free-solid-svg-icons';

const CompressionResult = ({ result, onDownload }) => {
  if (!result) return null;

  // Determine if compression was effective
  const compressionEffective = parseFloat(result.compressionRatio) > 0;
  
  // Display the appropriate compression method icon and text
  const getCompressionMethodDisplay = () => {
    switch(result.compressionMethod) {
      case 'image':
        return (
          <>
            <FontAwesomeIcon icon={faImage} className="method-icon" /> Image Optimization
          </>
        );
      case 'passthrough':
        return (
          <>
            <FontAwesomeIcon icon={faMusic} className="method-icon" /> Audio Passthrough
          </>
        );
      default:
        return (
          <>
            <FontAwesomeIcon icon={faFileCode} className="method-icon" /> Huffman Coding
          </>
        );
    }
  };
  
  return (
    <div className="result-section">
      <h2>Compression Results</h2>
      <div className="result-info">
        <div className="result-row">
          <span>Original Size:</span>
          <span>{result.originalSize}</span>
        </div>
        <div className="result-row">
          <span>Compressed Size:</span>
          <span>{result.compressedSize}</span>
        </div>
        <div className="result-row">
          <span>Compression Ratio:</span>
          <span className={compressionEffective ? 'compression-ratio' : 'low-compression'}>
            {result.compressionRatio}
          </span>
        </div>
        {result.compressionMethod && (
          <div className="result-row">
            <span>Compression Method:</span>
            <span className="compression-method">
              {getCompressionMethodDisplay()}
            </span>
          </div>
        )}
        {!compressionEffective && (
          <div className="compression-note">
            <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
            {result.compressionMethod === 'passthrough' ? (
              <p>Audio files are preserved in their original format. No compression was applied.</p>
            ) : (
              <p>This file achieved minimal compression. The file format may already be optimized.</p>
            )}
          </div>
        )}
      </div>
      <button className="download-button" onClick={onDownload}>
        <FontAwesomeIcon icon={faDownload} className="download-icon" /> Download File
      </button>
    </div>
  );
};

export default CompressionResult; 
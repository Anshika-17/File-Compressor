import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const DecompressionResult = ({ result, onDownload }) => {
  if (!result) return null;

  return (
    <div className="result-section">
      <h2>Decompression Results</h2>
      <div className="result-info">
        <div className="result-row">
          <span>Compressed Size:</span>
          <span>{result.compressedSize}</span>
        </div>
        <div className="result-row">
          <span>Decompressed Size:</span>
          <span>{result.decompressedSize}</span>
        </div>
        <div className="result-row">
          <span>Expansion Ratio:</span>
          <span className="expansion-ratio">
            {result.expansionRatio}%
          </span>
        </div>
        <div className="file-type-info">
          <FontAwesomeIcon icon={faFileAlt} className="file-icon" />
          <p>File decompressed successfully. You can now download the original file.</p>
        </div>
      </div>
      <button className="download-button" onClick={onDownload}>
        <FontAwesomeIcon icon={faDownload} className="download-icon" /> Download Original File
      </button>
    </div>
  );
};

export default DecompressionResult; 
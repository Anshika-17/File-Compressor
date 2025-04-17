import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, status }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-status">
        {status}
      </div>
    </div>
  );
};

export default ProgressBar; 
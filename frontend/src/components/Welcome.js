import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './Welcome.css';

function Welcome({ onStart }) {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to File Compressor</h1>
        <p className="welcome-description">
          A powerful tool to compress and decompress your files efficiently
        </p>
        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">📁</span>
            <span>Compress any file type</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🖼️</span>
            <span>Optimized image compression</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎵</span>
            <span>Audio file support</span>
          </div>
        </div>
        <button className="start-button" onClick={onStart}>
          Get Started
          <FontAwesomeIcon icon={faArrowRight} className="button-icon" />
        </button>
      </div>
    </div>
  );
}

export default Welcome; 
import React from 'react';
import './SubmittedPage.css';

const SubmittedPage = () => {
  return (
    <div className="submitted-container">
      <div className="submitted-card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 className="submitted-title">Successfully Submitted!</h1>
        <p className="submitted-message">
          Thank you for your submission. We have received your information and 
          will process it shortly.
        </p>
        <button className="back-button" onClick={() => window.history.back()}>
          Return to Previous Page
        </button>
      </div>
    </div>
  );
};

export default SubmittedPage;
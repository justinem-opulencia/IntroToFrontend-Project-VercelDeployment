import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
        </div>
    );
};

export default LoadingScreen;

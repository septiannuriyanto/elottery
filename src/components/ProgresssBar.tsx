import React from 'react';

interface ProgressBarProps {
  progress: number; // Progress percentage (0 to 100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
        
      <div
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`, // Ensure progress stays between 0 and 100
          backgroundColor: '#76c7c0',
          height: '20px',
          transition: 'width 0.5s ease-in-out', // Smooth transition for progress bar
        }}
      >
        <span style={{ color: 'white', textAlign: 'center', lineHeight: '20px', display: 'block' }}>
          {`${Math.floor(Math.min(Math.max(progress, 0), 100))}%`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;

import React, { useState, useEffect } from 'react';
import { Prize } from '../types/Prize';

interface ProgressBarProps {
  mutablePrizes: Prize[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ mutablePrizes }) => {
  // Initialize totalQty when mutablePrizes changes
  const [totalQty, setTotalQty] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    // Calculate totalQty only once on the initial load
    if (totalQty === 0) {
      const initialTotal = mutablePrizes.reduce((sum, prize) => sum + prize.qty, 0);
      setTotalQty(initialTotal);
    }
  }, [mutablePrizes, totalQty]);

  useEffect(() => {
    // Calculate progress whenever mutablePrizes changes
    const remainingQty = mutablePrizes.reduce((sum, prize) => sum + prize.qty, 0);
    const completedQty = totalQty - remainingQty;

    if (totalQty > 0) {
      const newProgress = (completedQty / totalQty) * 100;
      setCurrentProgress(newProgress);
    }
  }, [mutablePrizes, totalQty]);

  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${currentProgress}%`,
          backgroundColor: '#76c7c0',
          height: '20px',
          transition: 'width 0.5s ease-in-out', // Smooth transition for progress bar
        }}
      >
        <span style={{ color: 'white', textAlign: 'center', lineHeight: '20px', display: 'block' }}>
          {`${Math.floor(currentProgress)}%`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;

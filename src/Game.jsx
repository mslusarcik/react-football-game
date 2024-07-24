import React, { useState, useEffect } from 'react';
import Ball from './Ball';

const Game = () => {
  const [score, setScore] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });

  const handleBallClick = () => {
    setScore(score + 1);
  };

  const handleLose = () => {
    setScore(0); // Resetování skóre
    setBallPosition({ x: 50, y: 50 }); // Resetování pozice míče
  };

  useEffect(() => {
    setBallPosition({ x: 50, y: 50 }); // Resetování pozice míče při načtení
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'lightblue',
      }}
    >
      <Ball
        onClick={handleBallClick}
        setBallPosition={setBallPosition}
        onLose={handleLose}
      />
      <div
        style={{ position: 'absolute', top: 16, right: 24, fontSize: '40px' }}
      >
        {score}
      </div>
      <div style={{ position: 'absolute', top: 40, left: 10 }}>
        Ball Position: x: {ballPosition.x.toFixed(2)}%, y:{' '}
        {ballPosition.y.toFixed(2)}%
      </div>
    </div>
  );
};

export default Game;

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

const Ball = ({ onClick, setBallPosition, onLose }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isGameActive, setIsGameActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // Nový stav pro resetování
  const gravity = 1.2; // Síla gravitace
  const bounceFactor = 0.7; // Koeficient odrazu
  const maxClickForce = 70; // Maximální síla kliknutí
  const minClickForce = maxClickForce * 0.2; // Minimální síla kliknutí (20% z maxClickForce)
  const horizontalForceMultiplier = 5;

  const [props, api] = useSpring(() => ({
    left: `${position.x}%`,
    top: `${position.y}%`,
    config: { mass: 1, tension: 300, friction: 10 },
  }));

  const calculateForce = (offsetY, rectHeight) => {
    const relativeY = offsetY / rectHeight;
    return minClickForce + relativeY * (maxClickForce - minClickForce);
  };

  const bind = useGesture({
    onClick: ({ event }) => {
      if (!isGameActive) {
        setIsGameActive(true);
        setIsResetting(false); // Zrušit stav resetování při začátku hry
      }

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const clickPosition = {
        x: offsetX - rect.width / 2,
        y: offsetY - rect.height / 2,
      };

      const force = calculateForce(offsetY, rect.height);

      // Úprava směru rychlosti tak, aby míč vždy směřoval nahoru a do stran
      const newVelocity = {
        x: (clickPosition.x / rect.width) * -force * horizontalForceMultiplier,
        y: -force,
      };

      // Uplatnění stejného bounce faktoru pro kliknutí myší
      setVelocity({
        x: newVelocity.x * bounceFactor,
        y: newVelocity.y * bounceFactor,
      });

      if (onClick) onClick();
    },
  });

  useEffect(() => {
    console.log('Ball position:', position); // Přidáno logování pro ladění

    if (!isGameActive || isResetting) return; // Pokud hra není aktivní nebo je resetování, neprováděj pohyb

    const interval = setInterval(() => {
      setPosition((prevPosition) => {
        const newVelocity = {
          x: velocity.x,
          y: velocity.y + gravity, // Gravitace přidána k y
        };

        // Poloměr míče v % šířky/výšky kontejneru
        const ballRadiusPercent =
          (110 / document.documentElement.clientWidth) * 50;

        let newX = prevPosition.x + newVelocity.x * 0.05;
        let newY = prevPosition.y + newVelocity.y * 0.05;

        // Kontrola hranic a odraz
        if (newX <= ballRadiusPercent || newX >= 100 - ballRadiusPercent) {
          newX = Math.min(
            Math.max(newX, ballRadiusPercent),
            100 - ballRadiusPercent
          );
          newVelocity.x = -newVelocity.x * bounceFactor;
        }

        if (newY <= ballRadiusPercent || newY >= 100) {
          if (newY >= 100 - ballRadiusPercent) {
            if (onLose) {
              onLose();
            }
            setIsGameActive(false); // Deaktivovat hru
            setIsResetting(true); // Nastavit stav resetování
            setPosition({ x: 50, y: 50 }); // Resetovat pozici
            api.start({ left: `50%`, top: `50%`, immediate: true }); // Resetovat animaci okamžitě
            return { x: 50, y: 50 };
          } else {
            newY = Math.min(
              Math.max(newY, ballRadiusPercent),
              100 - ballRadiusPercent
            );
            newVelocity.y = -newVelocity.y * bounceFactor;
          }
        }

        setVelocity(newVelocity);
        api.start({ left: `${newX}%`, top: `${newY}%` });

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [velocity, api, onLose, isGameActive, isResetting]);

  useEffect(() => {
    // Aktualizace pozice míče pro ladění po změně pozice
    if (setBallPosition) {
      setBallPosition(position);
    }
  }, [position, setBallPosition]);

  return (
    <>
      <animated.div
        {...bind()}
        style={{
          ...props,
          position: 'absolute',
          width: '150px', // Zvětšení míče na 110 pixelů
          height: '150px', // Zvětšení míče na 110 pixelů
          backgroundColor: 'red',
          backgroundImage: 'url(/ball.svg)',
          backgroundSize: 'cover',
          borderRadius: '50%',
          cursor: 'pointer',
          transform: 'translate(-50%, -50%)', // Přidání transformace pro přesné vystředění
        }}
      />
      {isGameActive ? (
        ''
      ) : (
        <span
          style={{
            position: 'absolute',
            top: '65%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Tap on a ball to start a game
        </span>
      )}
    </>
  );
};

export default Ball;

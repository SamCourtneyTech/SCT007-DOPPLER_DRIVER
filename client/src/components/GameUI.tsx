import React from 'react';
import { Html } from '@react-three/drei';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';

export default function GameUI() {
  const { gameState, survivalTime, playerLane, startGame, resetGame } = useDriving();
  const { isMuted, toggleMute } = useAudio();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Html fullscreen>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif',
      }}>
        
        {/* Game Info - Top */}
        {gameState === 'playing' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {formatTime(survivalTime)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Lane: {playerLane === 0 ? 'LEFT' : playerLane === 1 ? 'CENTER' : 'RIGHT'}
            </div>
          </div>
        )}

        {/* Controls Info - Bottom */}
        {gameState === 'playing' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            A/D or ←/→ to switch lanes • W/↑ to move forward • Listen for honking!
          </div>
        )}

        {/* Start Screen */}
        {gameState === 'ready' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            pointerEvents: 'auto'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '40px 30px',
              borderRadius: '15px',
              textAlign: 'center',
              width: '90vw',
              maxWidth: '500px',
              minHeight: '60vh',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                marginBottom: '25px',
                color: '#333',
                wordWrap: 'break-word'
              }}>
                Wrong Way Driver
              </h1>
              <p style={{ 
                fontSize: '18px', 
                marginBottom: '35px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                You're driving on the wrong side of the road!<br/>
                Listen for honking sounds to know which lane has incoming traffic.<br/>
                Switch lanes quickly to avoid crashes!
              </p>
              <div style={{ marginBottom: '35px', color: '#888', fontSize: '16px' }}>
                <div>🎧 Use headphones for best experience</div>
                <div>A/D or ←/→ keys to switch lanes</div>
                <div>W/↑ key to move forward (risky!)</div>
              </div>
              <button
                onClick={startGame}
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  padding: '18px 35px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255,68,68,0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#ff6666';
                  target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#ff4444';
                  target.style.transform = 'translateY(0)';
                }}
              >
                START DRIVING
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'ended' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            pointerEvents: 'auto'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '25px',
              borderRadius: '15px',
              textAlign: 'center',
              width: '90vw',
              maxWidth: '450px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#ff4444'
              }}>
                CRASHED!
              </h2>
              <p style={{ 
                fontSize: '18px', 
                marginBottom: '15px',
                color: '#333'
              }}>
                Survival Time: {formatTime(survivalTime)}
              </p>
              <p style={{ 
                fontSize: '14px', 
                marginBottom: '25px',
                color: '#666'
              }}>
                You got caught by the police or crashed into traffic!
              </p>
              <button
                onClick={resetGame}
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '12px 25px',
                  backgroundColor: '#4444ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(68,68,255,0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#6666ff';
                  target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#4444ff';
                  target.style.transform = 'translateY(0)';
                }}
              >
                TRY AGAIN (R)
              </button>
            </div>
          </div>
        )}

      </div>
    </Html>
  );
}

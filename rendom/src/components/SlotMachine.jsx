import React, { useState, useEffect, useRef } from 'react';
import { playSpin, playWin } from '../utils/soundEffects';
import { HelpCircle } from 'lucide-react';

export default function SlotMachine({
  students,
  secretQueue,
  onConsumeSecretQueue,
  onMarkAsPresented,
  excludePresented,
  isMuted
}) {
  const [drawCount, setDrawCount] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [slots, setSlots] = useState([]); // Array of { id, currentName, isRolling, winnerName }
  const [finalWinners, setFinalWinners] = useState([]);
  const intervalsRef = useRef([]);
  const timeoutsRef = useRef([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(clearInterval);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Filter eligible students
  const getEligibleStudents = () => {
    return students.filter(s => {
      if (s.excluded) return false;
      if (excludePresented && s.presented) return false;
      return true;
    });
  };

  const eligibleStudents = getEligibleStudents();

  const handleSpin = () => {
    if (isSpinning) return;
    if (eligibleStudents.length === 0) {
      alert('추출 가능한 학생이 없습니다. 학생 목록을 확인하거나 발표 완료 리셋을 해주세요.');
      return;
    }
    if (drawCount > eligibleStudents.length) {
      alert(`추출 가능한 학생(${eligibleStudents.length}명)보다 설정된 인원(${drawCount}명)이 더 많습니다.`);
      return;
    }

    setIsSpinning(true);
    setFinalWinners([]);
    
    // 1. Determine the winners
    const winners = [];
    const tempSecretQueue = [...secretQueue];
    const availablePool = [...eligibleStudents];

    for (let i = 0; i < drawCount; i++) {
      let chosenStudent = null;

      // Find first available student in the secret queue
      while (tempSecretQueue.length > 0) {
        const nextSecretName = tempSecretQueue.shift();
        const found = availablePool.find(s => s.name === nextSecretName);
        if (found) {
          chosenStudent = found;
          // Remove from available pool so we don't pick them again in this draw
          const idx = availablePool.findIndex(s => s.id === chosenStudent.id);
          availablePool.splice(idx, 1);
          break;
        }
      }

      // If no secret student was chosen, pick randomly
      if (!chosenStudent) {
        const randomIdx = Math.floor(Math.random() * availablePool.length);
        chosenStudent = availablePool[randomIdx];
        availablePool.splice(randomIdx, 1);
      }

      winners.push(chosenStudent);
    }

    // Update the secret queue in parent state
    onConsumeSecretQueue(winners.map(w => w.name));

    // 2. Initialize slots
    const initialSlots = Array.from({ length: drawCount }).map((_, idx) => ({
      id: idx,
      currentName: '?',
      isRolling: true,
      winnerName: winners[idx].name
    }));
    setSlots(initialSlots);

    // Clear previous timers
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // 3. Start rolling for each slot with slightly different end times
    initialSlots.forEach((slot, idx) => {
      const spinDuration = 2000 + idx * 800; // sequential stop (2s, 2.8s, 3.6s...)
      let tickCount = 0;

      const interval = setInterval(() => {
        // Pick a random name from ALL students for visual richness during spin
        const randomName = students.length > 0 
          ? students[Math.floor(Math.random() * students.length)].name 
          : '🎰';
        
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, currentName: randomName } : s));

        // Sound effect (rate limited to keep it pleasant)
        if (!isMuted && tickCount % 2 === 0) {
          playSpin();
        }
        tickCount++;
      }, 60);

      intervalsRef.current.push(interval);

      // Stop slot after duration
      const timeout = setTimeout(() => {
        clearInterval(interval);
        
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, currentName: slot.winnerName, isRolling: false } : s));
        
        if (!isMuted) {
          playWin();
        }

        // If this is the last slot to stop, finish spinning
        if (idx === drawCount - 1) {
          setIsSpinning(false);
          setFinalWinners(winners);
          // Mark winners as presented
          const winnerIds = winners.map(w => w.id);
          onMarkAsPresented(winnerIds);
        }
      }, spinDuration);

      timeoutsRef.current.push(timeout);
    });
  };

  return (
    <div className="slot-machine-card neon-border-pink">
      <div className="slot-settings">
        <div className="draw-count-selector">
          <label className="draw-label neon-text-pink">추출 인원</label>
          <div className="count-buttons">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => !isSpinning && setDrawCount(num)}
                className={`btn-count ${drawCount === num ? 'active' : ''}`}
                disabled={isSpinning}
              >
                {num}명
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || eligibleStudents.length === 0}
          className="btn-spin-wheel neon-btn-pink"
        >
          {isSpinning ? '추출 중...' : '발표자 뽑기 🎰'}
        </button>
      </div>

      {/* Slots display container */}
      <div className="slots-container">
        {slots.length === 0 ? (
          // Default empty slot placeholder
          <div className="slot-box placeholder">
            <span className="slot-rolling-text neon-text-cyan">
              <HelpCircle size={48} className="pulse-slow" />
            </span>
          </div>
        ) : (
          <div className="slots-row">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`slot-box ${slot.isRolling ? 'spinning' : 'stopped'}`}
              >
                <div className="slot-overlay-top"></div>
                <div className="slot-content">
                  <span className={`slot-name-display ${slot.isRolling ? 'text-cyan glow-cyan' : 'text-pink glow-pink animation-glitch'}`}>
                    {slot.currentName}
                  </span>
                </div>
                <div className="slot-overlay-bottom"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Presenter result banner */}
      {!isSpinning && finalWinners.length > 0 && (
        <div className="winners-banner neon-border-cyan animate-fade-in">
          <h3 className="neon-text-cyan animate-pulse-slow">축하합니다! 발표 대상자</h3>
          <div className="winners-names">
            {finalWinners.map((winner, idx) => (
              <span key={winner.id} className="winner-name-badge">
                {winner.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

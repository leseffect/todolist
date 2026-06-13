import React, { useState } from 'react';
import { Volume2, VolumeX, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { playClick } from '../utils/soundEffects';

export default function Header({
  classes,
  currentClass,
  onSelectClass,
  onAddClass,
  onDeleteClass,
  onOpenSecret,
  isMuted,
  onToggleMute,
  secretActive
}) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [showAddClassInput, setShowAddClassInput] = useState(false);

  const handleLogoClick = () => {
    if (!isMuted) playClick();
    
    // Clear existing timer
    if (clickTimer) clearTimeout(clickTimer);

    const newCount = clickCount + 1;
    if (newCount >= 5) {
      onOpenSecret();
      setClickCount(0);
    } else {
      setClickCount(newCount);
      // Reset count after 2.5 seconds of inactivity
      setClickTimer(
        setTimeout(() => {
          setClickCount(0);
        }, 2500)
      );
    }
  };

  const handleAddClassSubmit = (e) => {
    e.preventDefault();
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName('');
      setShowAddClassInput(false);
      if (!isMuted) playClick();
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`정말로 '${currentClass}' 학급을 삭제하시겠습니까? 관련 명단이 모두 삭제됩니다.`)) {
      onDeleteClass(currentClass);
      if (!isMuted) playClick();
    }
  };

  return (
    <header className="app-header">
      <div className="header-logo-container" onClick={handleLogoClick}>
        <h1 className="logo-text neon-text-pink">
          NEON<span className="neon-text-cyan">SPIN</span>
        </h1>
        {secretActive && <span className="secret-indicator"><ShieldAlert size={14} /> SYSTEM ACTIVE</span>}
      </div>

      <div className="header-controls">
        <div className="class-selector-container">
          <select
            value={currentClass}
            onChange={(e) => {
              onSelectClass(e.target.value);
              if (!isMuted) playClick();
            }}
            className="class-select"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {classes.length > 1 && (
            <button
              onClick={handleDeleteClick}
              className="btn-icon btn-delete-class"
              title="현재 학급 삭제"
            >
              <Trash2 size={18} />
            </button>
          )}

          {showAddClassInput ? (
            <form onSubmit={handleAddClassSubmit} className="add-class-form">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="예: 1학년 3반"
                maxLength={12}
                className="add-class-input"
                autoFocus
              />
              <button type="submit" className="btn-add-class-confirm">추가</button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddClassInput(false);
                  setNewClassName('');
                }}
                className="btn-add-class-cancel"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setShowAddClassInput(true);
                if (!isMuted) playClick();
              }}
              className="btn-icon btn-add-class"
              title="새 학급 추가"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        <button
          onClick={onToggleMute}
          className={`btn-icon btn-volume ${isMuted ? 'muted' : ''}`}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </header>
  );
}

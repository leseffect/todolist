import React, { useState } from 'react';
import { X, Play, RefreshCw, Terminal, Eye, EyeOff } from 'lucide-react';
import { playClick } from '../utils/soundEffects';

export default function SecretModal({
  isOpen,
  onClose,
  students,
  secretQueue,
  onUpdateSecretQueue,
  isMuted
}) {
  const [showRealPanel, setShowRealPanel] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');

  if (!isOpen) return null;

  // Filter only active students who can be drawn
  const activeStudents = students.filter(s => !s.excluded);

  const handleAddToQueue = (name) => {
    if (!name) return;
    if (secretQueue.includes(name)) {
      alert('이미 대기열에 포함된 학생입니다.');
      return;
    }
    onUpdateSecretQueue([...secretQueue, name]);
    if (!isMuted) playClick();
  };

  const handleRemoveFromQueue = (index) => {
    const nextQueue = [...secretQueue];
    nextQueue.splice(index, 1);
    onUpdateSecretQueue(nextQueue);
    if (!isMuted) playClick();
  };

  const handleClearQueue = () => {
    onUpdateSecretQueue([]);
    if (!isMuted) playClick();
  };

  return (
    <div className="modal-backdrop">
      <div className="secret-modal neon-border-pink">
        <div className="modal-header">
          <div className="terminal-header-title">
            <Terminal size={16} /> SYSTEM_LOGS_DIAGNOSTIC (v1.2.04)
          </div>
          <button
            onClick={() => {
              onClose();
              if (!isMuted) playClick();
            }}
            className="btn-close-modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Disguise section: Fake system logs */}
          <div className="fake-terminal-logs">
            <div className="log-line text-dim">[OK] WebGL 2.0 Canvas hardware acceleration bound.</div>
            <div className="log-line text-dim">[INFO] Fetching client local state: {students.length} registers loaded.</div>
            <div className="log-line text-dim">[SUCCESS] WebAudioAPI context synthesis initialized.</div>
            <div className="log-line text-cyan">[DEBUG] Client Thread Cache hits: 98.42%</div>
            {secretQueue.length > 0 ? (
              <div className="log-line text-pink animate-pulse-slow">
                [WARN] Pipeline Override Hook active: [{secretQueue.join(', ')}] ({secretQueue.length} segments bound)
              </div>
            ) : (
              <div className="log-line text-dim">[INFO] Pipeline Hook Hook status: LISTENING (No overrides)</div>
            )}
          </div>

          {/* Toggle reveal for the actual configuration */}
          <div className="disguise-toggle-section">
            <button
              onClick={() => {
                setShowRealPanel(!showRealPanel);
                if (!isMuted) playClick();
              }}
              className="btn-disguise-toggle"
            >
              {showRealPanel ? <EyeOff size={16} /> : <Eye size={16} />}
              {showRealPanel ? "진단 분석 보기 (학생 위장용)" : "시퀀스 설정 도구 활성화 (교사용)"}
            </button>
          </div>

          {showRealPanel ? (
            <div className="secret-control-panel">
              <h3 className="panel-subtitle text-pink">발표자 예약 시스템 (Secret Override)</h3>
              <p className="panel-desc text-dim">
                여기서 지정한 학생들은 다음 뽑기 시 순서대로 무조건 뽑히게 됩니다.<br />
                예약 목록에 이름이 있어도, 결석/제외 설정이 되어있으면 자동으로 건너뜁니다.
              </p>

              {/* Input section to add to queue */}
              <div className="queue-input-group">
                <select
                  value={selectedStudentName}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="secret-student-select"
                >
                  <option value="">-- 학생 선택 --</option>
                  {activeStudents.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToQueue(selectedStudentName);
                    setSelectedStudentName('');
                  }}
                  className="btn-add-secret btn-neon-pink"
                  disabled={!selectedStudentName}
                >
                  예약 추가
                </button>
              </div>

              {/* Active Queue Display */}
              <div className="active-queue-box">
                <div className="queue-box-header">
                  <span className="text-cyan font-bold">다음 추출 예정 순서:</span>
                  {secretQueue.length > 0 && (
                    <button onClick={handleClearQueue} className="btn-clear-queue">
                      전체 비우기
                    </button>
                  )}
                </div>

                {secretQueue.length === 0 ? (
                  <div className="empty-queue-text text-dim">예약된 발표자가 없습니다. (완전 랜덤으로 추출됨)</div>
                ) : (
                  <div className="queue-item-list">
                    {secretQueue.map((name, idx) => (
                      <div key={idx} className="queue-item-card">
                        <span className="queue-badge">{idx + 1}순위</span>
                        <span className="queue-name">{name}</span>
                        <button
                          onClick={() => handleRemoveFromQueue(idx)}
                          className="btn-remove-queue-item"
                          title="예약 취소"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="fake-system-bench">
              <div className="bench-row">
                <span>Audio Engine Synth:</span>
                <span className="badge-ok">ACTIVE</span>
              </div>
              <div className="bench-row">
                <span>Memory Heap Leakage:</span>
                <span className="badge-ok">0.00 MB</span>
              </div>
              <div className="bench-row">
                <span>CPU Frame Interleaving:</span>
                <span className="badge-ok">60 FPS (V-SYNC)</span>
              </div>
              <div className="bench-row">
                <span>Active Class Hash:</span>
                <span className="text-cyan font-mono">0x7FEE129A</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Trash2, UserPlus, Users, FileDown, FileUp, RotateCcw, AlertTriangle } from 'lucide-react';
import { playClick } from '../utils/soundEffects';

export default function StudentList({
  students,
  onAddStudents,
  onRemoveStudent,
  onToggleExclude,
  onResetPresented,
  isMuted
}) {
  const [singleName, setSingleName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (singleName.trim()) {
      onAddStudents([singleName.trim()]);
      setSingleName('');
      if (!isMuted) playClick();
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (bulkNames.trim()) {
      // Split by newline, comma, or whitespace
      const namesArray = bulkNames
        .split(/[\n,]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (namesArray.length > 0) {
        onAddStudents(namesArray);
        setBulkNames('');
        setIsBulkMode(false);
        if (!isMuted) playClick();
      }
    }
  };

  const handleExport = () => {
    if (!isMuted) playClick();
    const names = students.map(s => s.name).join('\n');
    const blob = new Blob([names], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `학급명단_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    if (!isMuted) playClick();
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const names = text
        .split(/[\n,]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (names.length > 0) {
        onAddStudents(names);
        alert(`${names.length}명의 학생을 성공적으로 불러왔습니다.`);
      } else {
        alert('올바른 명단 파일을 선택해주세요. (텍스트 파일에 이름을 줄바꿈으로 구분해 작성)');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const triggerFileInput = () => {
    if (!isMuted) playClick();
    fileInputRef.current.click();
  };

  const activeCount = students.filter(s => !s.excluded && !s.presented).length;
  const presentedCount = students.filter(s => s.presented).length;

  return (
    <div className="student-manager-card neon-border-cyan">
      <div className="card-header">
        <h2 className="card-title neon-text-cyan">
          <Users className="title-icon" size={20} /> 명단 관리 ({students.length}명)
        </h2>
        <div className="card-header-actions">
          <button
            onClick={handleExport}
            className="btn-text-icon btn-neon-cyan"
            title="텍스트 파일로 저장"
            disabled={students.length === 0}
          >
            <FileDown size={16} /> 내보내기
          </button>
          <button
            onClick={triggerFileInput}
            className="btn-text-icon btn-neon-cyan"
            title="명단 가져오기 (.txt)"
          >
            <FileUp size={16} /> 불러오기
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".txt,.csv"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Add Student Section */}
      <div className="add-student-section">
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-btn ${!isBulkMode ? 'active' : ''}`}
            onClick={() => {
              setIsBulkMode(false);
              if (!isMuted) playClick();
            }}
          >
            개별 추가
          </button>
          <button
            type="button"
            className={`tab-btn ${isBulkMode ? 'active' : ''}`}
            onClick={() => {
              setIsBulkMode(true);
              if (!isMuted) playClick();
            }}
          >
            일괄 추가
          </button>
        </div>

        {!isBulkMode ? (
          <form onSubmit={handleSingleSubmit} className="add-form-single">
            <input
              type="text"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              placeholder="학생 이름 입력"
              className="student-name-input"
              maxLength={10}
            />
            <button type="submit" className="btn-add-submit btn-neon-pink">
              <UserPlus size={16} /> 추가
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="add-form-bulk">
            <textarea
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              placeholder="이름을 줄바꿈(Enter)이나 쉼표(,)로 구분해서 입력해주세요.&#10;예:&#10;홍길동&#10;김철수, 이영희"
              className="student-textarea"
              rows={4}
            />
            <button type="submit" className="btn-add-submit btn-neon-pink">
              <Users size={16} /> 대량 추가
            </button>
          </form>
        )}
      </div>

      {/* Info Status Panel */}
      <div className="student-stats">
        <span>추출 대상 학생 수: <strong className="highlight-cyan">{activeCount}명</strong></span>
        <span>발표 완료: <strong className="highlight-pink">{presentedCount}명</strong></span>
        {presentedCount > 0 && (
          <button 
            onClick={() => {
              if (!isMuted) playClick();
              onResetPresented();
            }} 
            className="btn-reset-presented btn-neon-pink"
            title="발표 완료 상태를 모두 초기화합니다."
          >
            <RotateCcw size={14} /> 리셋
          </button>
        )}
      </div>

      {/* Student List View */}
      {students.length === 0 ? (
        <div className="empty-student-state">
          <AlertTriangle size={32} className="warning-pulse" />
          <p>등록된 학생이 없습니다. 학생 이름을 먼저 추가해 주세요!</p>
        </div>
      ) : (
        <div className="student-grid">
          {students.map((student) => {
            let statusClass = '';
            if (student.excluded) statusClass = 'excluded';
            else if (student.presented) statusClass = 'presented';

            return (
              <div key={student.id} className={`student-card ${statusClass}`}>
                <span className="student-name" onClick={() => onToggleExclude(student.id)}>
                  {student.name}
                  {student.presented && <span className="badge-presented">발표완료</span>}
                  {student.excluded && <span className="badge-excluded">결석/제외</span>}
                </span>
                
                <div className="student-card-actions">
                  <input
                    type="checkbox"
                    checked={!student.excluded}
                    onChange={() => {
                      onToggleExclude(student.id);
                      if (!isMuted) playClick();
                    }}
                    title={student.excluded ? "대상의 포함시키기" : "대상에서 제외하기 (결석 등)"}
                    className="exclude-checkbox"
                  />
                  <button
                    onClick={() => {
                      onRemoveStudent(student.id);
                      if (!isMuted) playClick();
                    }}
                    className="btn-remove-student"
                    title="학생 명단에서 영구 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
